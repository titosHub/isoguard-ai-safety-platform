"""Demo AI model configuration store.

Scaffolding-only: provides per-(sector, organization) overrides for AI model
configurations defined in sector YAML.

Core principle:
- A user in a given sector should only ever see/configure that sector's models.

In production this should be persisted in a database with full RBAC + audit.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple

from solutions.loader import load_sector_config


# (sector_id, organization_id, model_id) -> patch dict
_MODEL_OVERRIDES: Dict[Tuple[str, str, str], Dict[str, Any]] = {}


def list_models(*, sector_id: str, organization_id: str) -> List[Dict[str, Any]]:
    cfg = load_sector_config(sector_id)

    items: List[Dict[str, Any]] = []
    for m in cfg.ai_models or []:
        ov = _MODEL_OVERRIDES.get((sector_id, organization_id, m.id), {})
        data = m.model_dump()
        data.update(ov)
        items.append(data)

    return items


def patch_model(
    *,
    sector_id: str,
    organization_id: str,
    model_id: str,
    patch: Dict[str, Any],
) -> Dict[str, Any]:
    allowed = {
        'enabled',
        'version',
        'artifact',
        'settings',
        'metrics',
        'limitations',
        'supported_camera_angles',
        'dataset_ref',
    }

    clean = {k: v for k, v in patch.items() if k in allowed}
    key = (sector_id, organization_id, model_id)

    prev = _MODEL_OVERRIDES.get(key, {})
    prev.update({k: v for k, v in clean.items() if v is not None})
    _MODEL_OVERRIDES[key] = prev

    return prev


def get_model_version(*, sector_id: str, organization_id: str, model_id: str) -> Optional[str]:
    """Return the effective version for a model (sector default + overrides)."""

    cfg = load_sector_config(sector_id)
    base = None
    for m in cfg.ai_models or []:
        if m.id == model_id:
            base = m.version
            break

    ov = _MODEL_OVERRIDES.get((sector_id, organization_id, model_id), {})
    return str(ov.get('version') or base) if (ov.get('version') or base) else None

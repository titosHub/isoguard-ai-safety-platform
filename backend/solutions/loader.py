"""Sector config loader.

Loads YAML/JSON files from the repository-level configs/ directory.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any, Dict
import json

from solutions.config_models import SectorConfig


CONFIGS_DIR = Path(__file__).resolve().parents[2] / 'configs'


def _find_config_path(sector_id: str) -> Path:
    candidates = [
        CONFIGS_DIR / f'{sector_id}.yaml',
        CONFIGS_DIR / f'{sector_id}.yml',
        CONFIGS_DIR / f'{sector_id}.json',
    ]

    for c in candidates:
        if c.exists():
            return c

    raise FileNotFoundError(f'No config found for sector={sector_id} in {CONFIGS_DIR}')


def _load_raw(path: Path) -> Dict[str, Any]:
    if path.suffix.lower() == '.json':
        return json.loads(path.read_text(encoding='utf-8'))

    # YAML
    try:
        import yaml  # type: ignore
    except Exception as e:  # pragma: no cover
        raise RuntimeError('pyyaml is required to load YAML sector configs') from e

    return yaml.safe_load(path.read_text(encoding='utf-8')) or {}


@lru_cache(maxsize=64)
def load_sector_config(sector_id: str) -> SectorConfig:
    """Load and validate a sector config by id."""

    path = _find_config_path(sector_id)
    raw = _load_raw(path)

    # Ensure sector_id is present and consistent
    if 'sector_id' not in raw:
        raw['sector_id'] = sector_id

    return SectorConfig.model_validate(raw)


def clear_config_cache() -> None:
    load_sector_config.cache_clear()

"""Rules engine.

Applies sector rules (from configs) to normalized detection events.
"""

from __future__ import annotations

from typing import List

from solutions.loader import load_sector_config
from services.rules_engine.models import DetectionEvent, EventRuleEvaluation, RuleEvaluationResult


def evaluate_events(sector_id: str, events: List[DetectionEvent]) -> List[EventRuleEvaluation]:
    """Evaluate a list of events against the configured rules for a sector."""

    cfg = load_sector_config(sector_id)
    rules = [r for r in cfg.rules if r.enabled]

    evaluations: List[EventRuleEvaluation] = []

    for ev in events:
        ev_detection_types = set([d for d in (ev.detection_types or []) if d])
        results: List[RuleEvaluationResult] = []

        for rule in rules:
            rule_types = set(rule.detection_types or [])
            matched = sorted(list(ev_detection_types.intersection(rule_types)))
            triggered = len(matched) > 0

            results.append(
                RuleEvaluationResult(
                    rule_id=rule.id,
                    rule_name=rule.name,
                    triggered=triggered,
                    matched_detection_types=matched,
                    severity=rule.severity,
                    regulatory_tags=rule.regulatory_tags,
                    ai_models=getattr(rule, 'ai_models', []) or [],
                    duration_seconds=getattr(rule, 'duration_seconds', None),
                    actions=[a.model_dump() for a in (getattr(rule, 'actions', []) or [])],
                    details={
                        'sector_id': sector_id,
                        'event_detected_at': ev.detected_at.isoformat(),
                    },
                )
            )

        evaluations.append(EventRuleEvaluation(event_id=ev.event_id, results=results))

    return evaluations


def list_sector_rules(sector_id: str):
    cfg = load_sector_config(sector_id)
    return [r.model_dump() for r in cfg.rules]

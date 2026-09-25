---
title: "Empirical Workflow Timeout Standardization"
number: 56
date: "2025-10-13"
status: "Accepted"
category: "Automation"
summary: "Replaced guessed CI timeouts with values derived from 30 days of real run data using a simple P95-based formula, so hung jobs fail in minutes instead of an hour."
ail: 2
---

## Decision Drivers

- Inconsistent timeout values across workflows (5–60 minute range)
- No empirical basis for existing timeout values
- Missing timeouts on 5 workflows (infinite wait possible)
- Overly generous timeouts may mask hung processes
- Need for data-driven resource management

## Context

GitHub Actions workflow timeouts provide protection against hung jobs consuming runner resources indefinitely. The homelab infrastructure's 11 workflows had inconsistent timeout configurations with no documented rationale.

### Existing State

**Timeout distribution before standardization:**

- **5 minutes:** backup-age-check (guardrail job)
- **15 minutes:** lint (ansible-lint job)
- **30 minutes:** deploy-compose, terraform
- **45 minutes:** package-updates
- **60 minutes:** ansible
- **No timeout:** compose-check, kics, labels, update-badges, weekly-summary

**Observed issues:**

1. No empirical basis for timeout values; they appear to be educated guesses
2. Inconsistent timeouts for similar operations (e.g., deploy vs package-updates)
3. Five workflows lack timeout protection entirely
4. Very high timeouts (45m, 60m) may hide issues instead of exposing them
5. No maintenance schedule for reviewing timeout appropriateness

### Empirical Data Collection

Analysis of 30-day workflow history (successful runs) via the GitHub Actions API:

| Workflow | Avg Duration | P95 Duration | Max Duration | Sample Size |
|----------|--------------|--------------|--------------|-------------|
| ansible | 2.4 min | 4 min | 4 min | 18 runs |
| deploy-compose | 0.7 min | 1 min | 2 min | 21 runs |
| terraform | 0.1 min | 1 min | 1 min | 14 runs |
| package-updates | 2.5 min | 4 min | 4 min | 15 runs |
| compose-check | 0.1 min | 1 min | 1 min | 29 runs |
| kics | 0.0 min | 0 min | 1 min | 30 runs |
| lint | 0.1 min | 1 min | 1 min | 28 runs |
| backup-age-check | 0.0 min | 0 min | 0 min | 20 runs |
| labels | 0.1 min | 0 min | 3 min | 30 runs |
| update-badges | 0.0 min | 0 min | 0 min | 30 runs |
| weekly-summary | 0.0 min | 0 min | 0 min | 5 runs |

**Key findings:**

- Actual workflow durations are significantly lower than configured timeouts
- `ansible` configured at 60 min but P95 = 4 min (15× overconfigured)
- `package-updates` configured at 45 min but P95 = 4 min (11× overconfigured)
- All workflows complete within 4 minutes at P95

## Decision

Standardize all workflow timeouts using an empirical, formula-based approach derived from actual workflow execution data.

### Formula

```
timeout = (P95_duration × 2) + 5_minute_buffer
```

**Rationale:**

- **P95 duration**: captures typical maximum runtime (95% of successful runs)
- **2× multiplier**: accounts for variability and occasional slowness
- **5-minute buffer**: covers network issues, runner startup, checkout delays
- **Round up to nearest 5**: maintains readability and alignment with common intervals

### Applied Timeout Values

| Workflow | P95 | Calculated | Rounded | Previous | Change |
|----------|-----|------------|---------|----------|--------|
| ansible | 4 min | 13 min | **15 min** | 60 min | −45 min (−75%) |
| deploy-compose | 1 min | 7 min | **10 min** | 30 min | −20 min (−67%) |
| terraform | 1 min | 7 min | **10 min** | 30 min | −20 min (−67%) |
| package-updates | 4 min | 13 min | **15 min** | 45 min | −30 min (−67%) |
| compose-check | 1 min | 7 min | **10 min** | none | +10 min (new) |
| kics | 0 min | 5 min | **5 min** | none | +5 min (new) |
| lint | 1 min | 7 min | **10 min** | 15 min | −5 min (−33%) |
| backup-age-check | 0 min | 5 min | **5 min** | 5 min | no change |
| labels | 0 min | 5 min | **5 min** | 5 min | no change |
| update-badges | 0 min | 5 min | **5 min** | 5 min | no change |
| weekly-summary | 0 min | 5 min | **5 min** | none | +5 min (new) |

### Documentation Standard

Each timeout includes inline comments explaining the calculation:

```yaml
jobs:
  example:
    # Timeout: P95=4min, formula=(4×2)+5=13min, rounded=15min
    # Based on 30-day analysis of successful runs (reviewed: 2025-10)
    timeout-minutes: 15
```

- **Line 1**: formula application showing P95, calculation steps, and result
- **Line 2**: data source and last review date (YYYY-MM format)
- **Placement**: immediately before the `timeout-minutes` declaration

### Maintenance Schedule

Timeout values should be reviewed quarterly or when:

- Workflow purpose or scope changes significantly
- Performance degradation is observed
- Runner infrastructure changes (e.g., hardware upgrades)
- Jobs consistently approach timeout limits

**Quarterly review process:**

1. Collect 30–90 days of workflow execution data
2. Recalculate P95 durations using updated data
3. Apply the formula to determine new recommended timeouts
4. Update workflow files and the review date in comments
5. Document any anomalies or significant changes

## Consequences

### Positive

- **Empirical foundation**: timeouts based on actual data, not guesses
- **Faster failure detection**: hung processes fail in 5–15 minutes instead of 45–60
- **Resource efficiency**: no runner time wasted on stuck jobs
- **Consistency**: similar operations have similar timeouts
- **Complete coverage**: all 11 workflows now have timeout protection
- **Maintainability**: the formula makes timeout rationale clear and reproducible
- **Documented approach**: clear process for future timeout reviews

### Negative

- **Initial analysis effort**: required collecting and analyzing 30 days of data
- **Migration work**: updated 11 workflow files with new timeout values
- **Documentation burden**: added an ADR and inline comments to all workflows
- **Maintenance commitment**: quarterly reviews required to keep timeouts current

### Neutral

- **No immediate impact**: workflows typically complete well within new timeouts
- **Monitoring unchanged**: no new alerting or metrics collection required
- **Backward compatible**: no workflow behavior changes, only timeout adjustments

## Risks and Mitigation

### Risk: Legitimate slow runs may time out

**Likelihood:** Low. P95 captures typical maximums; the 2× multiplier adds headroom.
**Impact:** Medium. The job fails and requires a manual re-run.
**Mitigation:**

- Monitor workflow failure rates after implementation
- If timeout failures occur, investigate root cause before increasing the timeout
- Use a 90-day data window for quarterly reviews to capture seasonal variations

### Risk: Infrastructure changes invalidate timeout calculations

**Likelihood:** Low. Self-hosted runner hardware is relatively stable.
**Impact:** Medium. May need an emergency timeout adjustment.
**Mitigation:**

- Document infrastructure changes in ADRs
- Trigger a timeout review when runner infrastructure changes
- Keep the review date in comments to track staleness

### Risk: Formula doesn't account for edge cases

**Likelihood:** Medium. Some workflows have variable workloads.
**Impact:** Low. Individual workflows can be adjusted as needed.
**Mitigation:**

- The formula is a guideline, not a strict rule
- Document exceptions in workflow-specific comments
- Track patterns in timeout failures for future formula refinement

## Implementation Notes

- Timeout analysis used the GitHub Actions API via `gh run list --json`
- Duration calculated from `createdAt` and `updatedAt` timestamps
- Only successful runs included in the analysis to avoid skewing data with failures
- P95 calculated as the 95th percentile of the sorted duration array
- All timeouts rounded up to the nearest 5-minute interval for readability

**Data collection command pattern:**

```bash
gh run list --workflow <name>.yml --limit 30 \
  --json conclusion,createdAt,updatedAt \
  | jq -r '.[] | select(.conclusion == "success") |
    (((.updatedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)) / 60 | floor)'
```

## Future Considerations

- Automated timeout monitoring and alerting
- Dynamic timeout adjustment based on workflow inputs

## Review History

- **2025-10**: Initial analysis and standardization based on a 30-day dataset
- **Next review**: 2026-01 (quarterly cycle)

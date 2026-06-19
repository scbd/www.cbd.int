# AGENTS.md — House rules for `scbd/www.cbd.int`

## About this project

**Maintenance project — future migration & decommission.** Do not introduce new features unless they are improvements to an existing one. Keep changes minimal and surgical.

This repo extends the CBD website with small app features focused on meetings and conferences:

- **Meeting page** — meeting listings and detail views
- **Conference portal** — conference management interface
- **Meeting-document management** — posting, translation import, and document handling
- **Decision tracking** — tracking of decisions
- **BioBridge** — biodiversity bridge initiative

### Stack

Legacy: **AngularJS** and **Vue.js v2**. Both co-exist. If a new feature must be developed, prefer Vue over Angular.

| Path              | Purpose                                           |
| ----------------- | ------------------------------------------------- |
| `app/views/`      | Page views — can be Angular or Vue                |
| `app/routes/`     | Route definitions                                 |
| `app/components/` | Vue components                                    |

## How we work here

A human decides before code exists. The reasoning gets captured as a byproduct of the design
conversation — not backfilled afterward. If you (the agent) are about to make a design decision the
human hasn't seen, **stop and surface it** instead of coding past it.

**Current rollout phase: 0.** The team adopts this workflow in phases (see `ai-era-development/playbook.md`
in the `scbd/documentation` repo). The rules below are phase-tagged: below their phase, treat them as
context — never as grounds to refuse or block work. The team bumps this line when it advances a phase.

- *(From Phase 1)* For any non-trivial feature, the human runs `/grill-with-docs` first. Don't start
  implementation from a vague request — ask for the grilled design.
- *(From Phase 2)* Every PR must link a Jira slice that **already existed before the branch**. If you
  can't point to a pre-existing Jira ticket, you are not ready to open a PR. Hotfixes and trivial changes
  (typos, dependency bumps) are exempt — see the playbook.

## Guardrails (Karpathy) — always on

**1. Think before coding.** State assumptions explicitly. If multiple interpretations exist, present
them — don't pick silently. If a simpler approach exists, say so. If something's unclear, stop and ask.

**2. Simplicity first.** Minimum code that solves the problem. No features beyond what was asked, no
speculative abstractions, no "flexibility" nobody requested, no error handling for impossible cases.
If 200 lines could be 50, rewrite it. Ask: "would a senior engineer call this overcomplicated?"

**3. Surgical changes.** Touch only what the ticket needs. Don't "improve" adjacent code, don't
refactor things that aren't broken, match existing style. Remove only the orphans *your* change created;
mention pre-existing dead code, don't delete it. Every changed line should trace to the request.

**4. Goal-driven execution.** Turn the task into a verifiable goal. "Fix the bug" → "write a test that
reproduces it, then make it pass." For multi-step work, state a short plan with a `verify:` check per step.

Full text: https://github.com/multica-ai/andrej-karpathy-skills/blob/main/skills/karpathy-guidelines/SKILL.md

**AGENT TODO**: Add any repo-specific guardrails beyond these Karpathy defaults (e.g. security,
secrets/data handling, deploy or migration constraints). Leave as-is if none apply.

## Agent skills

### Issue tracker

Issues and PRDs live in **Jira** (space `DEV`, component `WWW`), read/written through the Atlassian connector. See `docs/agents/issue-tracker.md`.

### Triage labels

Two labels in use: `ready-for-agent` (AFK-ready) and `ready-for-human`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

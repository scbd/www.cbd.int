# Issue tracker: Jira

Issues and PRDs for this repo live in **Jira**, read and written through the **Atlassian connector
(MCP)**. GitHub holds code and PRs only; the two are linked by Jira ticket. This split is intentional:
non-IT stakeholders track work in Jira, so it is the single source of truth for *what* is being built,
and a slice ticket must provably predate its branch.

## Coordinates

- **space**: `DEV`      — Jira project key
- **component**: `WWW`  — Jira component for this repo (always set, even when the space serves only this repo)

## Vocabulary

- **space** — the Jira project key. This repo uses space `DEV`.
- **component** — the Jira field that identifies the target repo. This repo uses component `WWW`.
- **epic** — the PRD. One epic = one PRD. Epics are what non-IT stakeholders read and comment on.
- **issue (slice)** — a vertical slice of an epic, bound to exactly one component. The unit of work an
  agent or human picks up.

## Conventions

- **Create an epic (PRD):** call `createJiraIssue` with `issueType: Epic` in space `DEV`. The
  epic description is the PRD.
- **Create a slice:** call `createJiraIssue` with `issueType: Story` (or `Bug` for defects), linked to
  its epic via the parent field, and `component: WWW`. Set `labels` to either `ready-for-agent`
  or `ready-for-human` per the slice mode. Return the Jira ticket (e.g. `DEV-42`) — the eventual PR
  must link back to this ticket.
- **Read an issue:** call `getJiraIssue` with the ticket key (e.g. `DEV-42`). The design lives in the
  description and comments, not in the repo.
- **Search issues:** call `searchJiraIssuesUsingJql`. Common filters:
  - All open slices for this repo: `project = DEV AND component = "WWW" AND statusCategory != Done`
  - AFK-ready slices: `project = DEV AND component = "WWW" AND labels = ready-for-agent`
- **Comment on an issue:** call `addCommentToJiraIssue`.
- **Apply / remove labels:** call `editJiraIssue` and set the `labels` field. Jira Labels are the
  triage vocabulary (see `triage-labels.md`). Labels are set as a complete list — to add one, read the
  current labels first and include them in the new set.
- **Transition an issue:** call `getTransitionsForJiraIssue` to get valid transition IDs for the current
  status, then call `transitionJiraIssue`. Never guess a transition ID.
- **Close / won't fix:** transition to `Done` with resolution `Won't Do`; add a comment explaining why
  before transitioning.

The Jira cloud instance and credentials are provided by the Atlassian connector — no manual configuration
needed.

## PR merge gate

`scbd/pr-reviewers` rejects any PR whose linked Jira slice did not exist before the branch was created,
and any PR with no linked slice at all. Do not create a slice retroactively to match an existing branch —
that defeats the rule. Hotfixes and trivial changes (typos, dependency bumps) are exempt.

## When a skill says "publish to the issue tracker"

Create a Jira slice under the relevant epic using `createJiraIssue`. Set `component: WWW` and
the appropriate label (`ready-for-agent` or `ready-for-human`). Return the ticket to the human.

## When a skill says "fetch the relevant ticket"

Call `getJiraIssue` with the ticket key the human provides (e.g. `DEV-42`).

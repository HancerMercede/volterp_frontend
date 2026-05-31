# Skill Registry — erp-mvp Frontend

scope: user
source: C:\Users\HANCER MERCEDE\.config\opencode\skills\

> **Contract**: This is an INDEX. For full instructions, read the skill's `SKILL.md`.
> Do NOT summary or compact skills — pass exact paths to subagents.

## Available Skills

| Name | Trigger / Description | Path |
|------|----------------------|------|
| `branch-pr` | Create Gentle AI pull requests with issue-first checks. Trigger: creating, opening, or preparing PRs for review. | `~/.config/opencode/skills/branch-pr/SKILL.md` |
| `chained-pr` | Trigger: PRs over 400 lines, stacked PRs, review slices. Split oversized changes into chained PRs that protect review focus. | `~/.config/opencode/skills/chained-pr/SKILL.md` |
| `cognitive-doc-design` | Design docs that reduce cognitive load. Trigger: writing guides, READMEs, RFCs, onboarding, architecture, or review-facing docs. | `~/.config/opencode/skills/cognitive-doc-design/SKILL.md` |
| `comment-writer` | Write warm, direct collaboration comments. Trigger: PR feedback, issue replies, reviews, Slack messages, or GitHub comments. | `~/.config/opencode/skills/comment-writer/SKILL.md` |
| `go-testing` | Trigger: Go tests, go test coverage, Bubbletea teatest, golden files. Apply focused Go testing patterns. | `~/.config/opencode/skills/go-testing/SKILL.md` |
| `issue-creation` | Create Gentle AI issues with issue-first checks. Trigger: creating GitHub issues, bug reports, or feature requests. | `~/.config/opencode/skills/issue-creation/SKILL.md` |
| `judgment-day` | Trigger: judgment day, dual review, adversarial review, juzgar. Run blind dual review, fix confirmed issues, then re-judge. | `~/.config/opencode/skills/judgment-day/SKILL.md` |
| `production-deploy` | Production deployment specialist for BOHUCO POS system. Use for any deployment tasks: docker compose deployment, droplet setup, domain configuration, SSL, database migration, CI/CD, monitoring, logging, scaling, or production issues. Stack: Docker, Docker Compose, Nginx, PostgreSQL, Seq, .NET API, React Frontend. Trigger on: deploy, production, docker, droplet, nginx, domain, ssl, letsencrypt, seq, logging, monitoring, database, migration, backup. | `~/.config/opencode/skills/production-deploy/SKILL.md` |
| `react-no-effects` | React useEffect optimization specialist. Use to refactor and prevent unnecessary useEffect hooks in React components. Applies principles from react.dev/learn/you-might-not-need-an-effect. Trigger on: useEffect, useState, effect, side effect, re-render, state sync, prop change reset. | `~/.config/opencode/skills/react-no-effects/SKILL.md` |
| `sdd-apply` | Implement SDD tasks from specs and design. Trigger: orchestrator launches apply for one or more change tasks. | `~/.config/opencode/skills/sdd-apply/SKILL.md` |
| `sdd-archive` | Archive a completed SDD change by syncing delta specs. Trigger: orchestrator launches archive after implementation and verification. | `~/.config/opencode/skills/sdd-archive/SKILL.md` |
| `sdd-design` | Create the SDD technical design and architecture approach. Trigger: orchestrator launches design for a change. | `~/.config/opencode/skills/sdd-design/SKILL.md` |
| `sdd-explore` | Explore SDD ideas before committing to a change. Trigger: orchestrator launches exploration or requirement clarification. | `~/.config/opencode/skills/sdd-explore/SKILL.md` |
| `sdd-init` | Trigger: sdd init, iniciar sdd, openspec init. Initialize SDD context, testing capabilities, registry, and persistence. | `~/.config/opencode/skills/sdd-init/SKILL.md` |
| `sdd-onboard` | Walk users through the SDD workflow on the real codebase. Trigger: orchestrator launches onboarding for the full SDD cycle. | `~/.config/opencode/skills/sdd-onboard/SKILL.md` |
| `sdd-propose` | Create an SDD change proposal with intent, scope, and approach. Trigger: orchestrator launches proposal work for a change. | `~/.config/opencode/skills/sdd-propose/SKILL.md` |
| `sdd-spec` | Write SDD delta specs with requirements and scenarios. Trigger: orchestrator launches spec work for a change. | `~/.config/opencode/skills/sdd-spec/SKILL.md` |
| `sdd-tasks` | Break an SDD change into implementation tasks. Trigger: orchestrator launches task planning for a change. | `~/.config/opencode/skills/sdd-tasks/SKILL.md` |
| `sdd-verify` | Trigger: SDD verification phase, verify change. Execute tests and prove implementation matches specs, design, and tasks. | `~/.config/opencode/skills/sdd-verify/SKILL.md` |
| `senior-dev` | Senior software engineer assistant for high-quality, production-grade code. Use this skill for ANY coding task: writing new code, reviewing existing code, refactoring, debugging, architecture decisions, testing strategy, security review, or performance optimization. Stack: TypeScript/React (frontend) and .NET/C# (backend). When in doubt, use this skill — it always applies when writing or discussing code. | `~/.config/opencode/skills/senior-dev/SKILL.md` |
| `skill-creator` | Trigger: new skills, agent instructions, documenting AI usage patterns. Create LLM-first skills with valid frontmatter. | `~/.config/opencode/skills/skill-creator/SKILL.md` |
| `skill-improver` | Trigger: improve skills, audit skills, refactor skills, skill quality. Audit and upgrade existing LLM-first skills. | `~/.config/opencode/skills/skill-improver/SKILL.md` |
| `skill-registry` | Trigger: update skills, skill registry, actualizar skills, after skill changes. Index available skills by trigger and path. | `~/.config/opencode/skills/skill-registry/SKILL.md` |
| `verify-before-act` | Trigger: any code change, edit, fix, refactor, update. Verify reality before acting to prevent hallucinations. | `~/.config/opencode/skills/verify-before-act/SKILL.md` |
| `work-unit-commits` | Plan commits as reviewable work units. Trigger: implementation, commit splitting, chained PRs, or keeping tests and docs with code. | `~/.config/opencode/skills/work-unit-commits/SKILL.md` |

**Total indexed**: 25 skills (user-level only, no project-level skills found)
**Skipped**: `sdd-*` (8), `_shared`, `skill-registry` — these are SDD internal or shared refs.
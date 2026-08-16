# Skills index

This directory holds Shopping System skills. The only always-on rule is [`.cursor/rules/architecture.mdc`](../rules/architecture.mdc).

Agents live under [`.cursor/agents/`](../agents/).

## Rules vs Skills

| | Rules | Skills |
|--|-------|--------|
| When loaded | alwaysApply | Agent reads on demand by description |
| This repo | Single `architecture.mdc` | Triggered by task below |

## Skills

| Skill | Description |
|-------|-------------|
| [developer](./developer/) | **Primary**: XP / DDD / BDD / TDD / Glossary / Apple HIG + Tailwind UX / Commit·PR / testing |
| [business-tech-analysis](./business-tech-analysis/) | Commercial moves + technical analysis → tech–business advice (needs live search) |
| [business-analysis](./business-analysis/) | Business Analysis: ubiquitous language, domain understanding, business rules |
| [product-owner](./product-owner/) | Product Owner: user stories, acceptance criteria, DoD, Jira MCP |

## Stack

Express API + Next.js web + Angular admin + React Native mobile. `market-analyst` / `tech-analyst` → `business-tech-analysis`; `business-analyst` → `business-analysis`.

## Deep skills not included

- `angular-developer` / `angular-new-app` — admin is Angular; add later if needed
- `spring-ai` — this repo is not Spring AI

## Agents ↔ Skills

| Agent | Skill |
|-------|-------|
| developer | developer |
| product-owner | product-owner |
| test-engineer | developer (testing) |
| ux-designer | developer (apple-minimal-ux) |
| market-analyst | business-tech-analysis |
| tech-analyst | business-tech-analysis |
| business-analyst | business-analysis |

## How to use

- Day-to-day development / tests / commits / UX / XP cadence → `developer`
- Market moves / competitors / GTM → Agent `market-analyst` (skill: `business-tech-analysis`)
- Frontier research / papers / model trends → Agent `tech-analyst` (skill: `business-tech-analysis`)
- Domain analysis / ubiquitous language → Agent `business-analyst` (skill: `business-analysis`)
- User stories / backlog / Jira tickets → `product-owner`

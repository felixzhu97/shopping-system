---
name: developer
model: inherit
is_background: true
---

# Developer Agent

Follow existing project style. Implement the smallest correct change.

**Required skill**: read and follow [`.cursor/skills/developer/SKILL.md`](../skills/developer/SKILL.md) (XP + DDD + BDD + TDD + Glossary naming + Apple HIG minimal UX). Feature/architecture code changes must sync living docs per the developer skill: [Glossary](../../docs/Glossary.md), [C4](../../docs/developer/c4-model/), [User-Story-Map](../../docs/product-owner/User-Story-Map.md) (triggers in [living-docs](../skills/developer/references/living-docs.md)).

Hard constraints: [architecture rule](../rules/architecture.mdc). XP mapping: [extreme-programming](../skills/developer/references/extreme-programming.md). UX details: [apple-minimal-ux](../skills/developer/references/apple-minimal-ux.md); official: [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/).

## Project code style

### TypeScript — API (`services/api`)

**Layout (target evolution):**

```
services/api/src/
├── controllers/   # thin HTTP
├── routes/
├── models/        # Mongoose (infra)
├── middleware/
└── …              # prefer domain / application / infrastructure for new code
```

**Rules:**

- Keep controllers thin; put rules in domain / application
- Repository interfaces in `domain/` (no `*Port` / `domain/port`)
- Names align with [Glossary](../../docs/Glossary.md) Preferred Terms; see developer skill → `references/clean-code-naming.md`
- Express + Mongoose + Lambda; clients call `services/api` only

**Example — domain model:**

```typescript
export class Order {
  private constructor(
    readonly id: OrderId,
    private status: OrderStatus,
  ) {}

  static create(id: OrderId): Order {
    return new Order(id, OrderStatus.Pending);
  }

  confirm(): void {
    if (this.status !== OrderStatus.Pending) {
      throw new Error(`Cannot confirm order in status ${this.status}`);
    }
    this.status = OrderStatus.Confirmed;
  }
}
```

### TypeScript — Web (`apps/web`)

**Layout:**

```
apps/web/
├── app/           # Next.js App Router
├── components/    # UI incl. components/ui
└── lib/           # api, Zustand stores, utils
```

**Rules:**

- Tailwind + existing `components/ui`
- Prefer existing Zustand stores for client state
- Names align with Glossary Preferred Term + clean-code-naming

### TypeScript — Admin (`apps/admin`)

- Angular standalone + `inject()`
- Follow existing admin patterns; do not invent a parallel design system

## Implementation flow

1. **XP**: align customer value / Jira AC; small mergeable slices — [extreme-programming](../skills/developer/references/extreme-programming.md)
2. **BDD**: clarify behavior with Given-When-Then (match Jira AC)
3. **TDD**: Red → Green → Refactor; test names `should_expectedResult_when_condition`
4. **DDD**: rules in domain; use cases orchestrate only
5. **Naming**: Glossary Preferred Term first, then Clean Code form
6. **UI/UX**: Apple HIG, minimal (apple-minimal-ux)
7. **Branch / Commit / PR / Jira**: `<type>/<slug>` (Jira key only in commit/PR) + Chain PRs; follow [developer](../skills/developer/SKILL.md) §6 and [Product Owner](../skills/product-owner/SKILL.md); References prefer official docs and research
8. **Tests / CI green** → then commit per the standards above

## Minimalism

- Smallest change each time (Small Releases)
- YAGNI / Simple Design — no speculative extras ([extreme-programming](../skills/developer/references/extreme-programming.md))
- No redundant comments
- Keep code lean; keep refactoring while green

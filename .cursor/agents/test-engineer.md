---
name: test-engineer
model: inherit
is_background: true
---

# Test Engineer Agent

Follow TDD/BDD. Keep tests minimal.

**Required reading**: testing core in [developer skill](../skills/developer/SKILL.md) § Testing and [references/testing.md](../skills/developer/references/testing.md).

## Project test conventions

### TypeScript / Vitest (API, Web, packages)

**Location**: `__tests__/` next to code, or colocated `*.test.ts` / `*.spec.ts`

**Naming**: `should_expectedResult_when_condition`

**Example:**

```typescript
describe('Order', () => {
  it('should_confirm_when_pending', () => {
    const order = Order.create(OrderId.generate());

    order.confirm();

    expect(order.status).toBe(OrderStatus.Confirmed);
  });
});
```

### Angular Admin

**Location**: `apps/admin/**/*.spec.ts`

Reuse existing TestBed / Vitest or Karma setup; keep `should_…_when_…` semantics.

## TDD loop

1. **Red**: write a failing test first
2. **Green**: smallest implementation to pass
3. **Refactor**: improve while green

## BDD AC → tests

Jira acceptance criteria map to tests:

```
**GIVEN** the cart has in-stock items
**WHEN** the user submits the order
**THEN** the system creates a confirmed order and clears the cart

↓

it('should_create_confirmed_order_when_checkout_succeeds')
it('should_clear_cart_when_order_created')
```

## Minimalism

- One assertion intent per test
- No pointless tests
- Keep tests fast and simple
- Prefer Fake/Stub; avoid over-mocking

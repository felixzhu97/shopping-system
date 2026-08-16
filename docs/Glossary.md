# Glossary | 领域术语表

> Explore Commerce — Ubiquitous Language（统一语言）

---

## 1. Purpose | 文档说明

This document defines the project **Ubiquitous Language**. English terms are the **preferred canonical names** and must align with code, API, and architecture naming. Chinese labels are for localization and stakeholder communication only.

### Maintenance Principles

1. **Glossary first**: Add or update terms here before implementing code
2. **Code sync**: Domain model changes must update the corresponding glossary entry
3. **Preferred term**: Use the **Preferred Term (English)** column for code, API, commits, and technical docs

---

## 2. Business Domains | 业务域总览

| Preferred Term | 中文 | Area（planned） | Notes |
| -------------- | ---- | --------------- | ----- |
| Catalog | 商品目录 | products | SKU, listing |
| Cart | 购物车 | cart | Session / user cart |
| Order | 订单 | orders | Checkout lifecycle |
| Payment | 支付 | payment gateway / Stripe | External |
| Auth | 认证 | OAuth + JWT | Google / GitHub |
| Admin | 管理端 | Angular admin | Ops |
| Customer Web | 顾客端 | Next.js web | Storefront |

---

## 3. Core Terms

| Preferred Term (English) | 中文 | Definition | Type | Notes |
| ------------------------ | ---- | ---------- | ---- | ----- |
| Product | 商品 | Sellable item in the catalog | Entity | — |
| Cart Item | 购物车行 | Product quantity in a cart | Entity | — |
| Order | 订单 | Confirmed purchase request | Aggregate | — |
| Payment Intent | 支付意图 | Request to charge via gateway | Entity | Stripe / gateway |
| Customer | 顾客 | End user of the storefront | Role | — |

## Reference

- [C4 model](developer/c4-model/)
- [User Story Map](product-owner/User-Story-Map.md)

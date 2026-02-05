# Architecture

This directory contains architecture documentation and PlantUML diagrams for the shopping system.

## Structure

- `c4/`
  - `diagrams/` (C4 context, container, component, code, and model)
  - `c4-plantuml/` (PlantUML libraries used by the C4 diagrams)
- `togaf/` (TOGAF views: business, application, data, technology)
- `wardley-map.puml`
- `zero-trust-architecture.puml`

## C4 model

- `c4/diagrams/c4-context.puml`
- `c4/diagrams/c4-container.puml`
- `c4/diagrams/c4-component.puml`
- `c4/diagrams/c4-code.puml`
- `c4/diagrams/c4-model.puml`

## TOGAF views

- `togaf/business-architecture.puml` – capabilities (product, order, user, cart, payment, crawling, analytics, meeting), processes
- `togaf/application-architecture.puml` – apps (web, admin with analytics, meeting), services (api, crawler, meeting-signal), shared packages
- `togaf/data-architecture.puml` – domain entities (User, Product, Order, Cart), MongoDB collections, data access
- `togaf/technology-architecture.puml` – tech stack (Angular, ECharts, AG Grid, WebRTC, Socket.IO, MyMemory API, etc.)

## Viewing diagrams

All `.puml` files can be rendered using:

- VS Code with the PlantUML extension
- PlantUML server
- Local PlantUML CLI

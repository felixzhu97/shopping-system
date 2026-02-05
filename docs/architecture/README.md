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

- `togaf/business-architecture.puml` (capabilities, processes, meeting with live subtitles and translation)
- `togaf/application-architecture.puml` (apps, services, meeting-signal, speech, subtitles, translation)
- `togaf/data-architecture.puml`
- `togaf/technology-architecture.puml` (Web Speech API, Socket.IO, WebRTC, MyMemory translation API)

## Viewing diagrams

All `.puml` files can be rendered using:

- VS Code with the PlantUML extension
- PlantUML server
- Local PlantUML CLI

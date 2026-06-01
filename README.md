# Sticky Notes SPA

Desktop sticky notes application built with React, TypeScript, and Vite. No drag-and-drop libraries, state managers, or UI kits — interactions, viewport, and persistence are implemented manually.

## Requirements

- **Platform:** Desktop browsers only (not optimized for mobile or tablet)
- **Minimum resolution:** 1024×768 — smaller viewports show a placeholder instead of the board

## Features

- Create, drag, resize, and delete notes
- Inline text editing with z-index ordering (click to bring to front)
- Multiple note colors via header color picker
- Infinite board with pan (left mouse on empty area) and zoom (mouse wheel)
- Local storage persistence for notes and viewport (debounced, via mock async API)
- Trash zone deletion via drag-and-drop collision

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |

## Architecture

```
src/
├── components/     Board, NoteLayer, Note, TrashZone, ColorPicker
├── hooks/          Thin React adapters over services and store
├── services/       Viewport, pointer, interaction, persistence, API, z-index
├── stores/         NotesStore (reducer + granular subscriptions)
├── types/          Domain and store types
├── utils/          Geometry, normalization, async helpers
└── constants/      API and persistence keys
```

### Data flow

1. **NotesStore** holds note state and exposes global and per-note subscriptions (`subscribe`, `subscribeNote`). React hooks use `useSyncExternalStore` to read only the slices they need.
2. **Services** encapsulate non-UI logic: pointer tracking, drag/resize sessions, viewport transforms, z-index allocation, and debounced persistence.
3. **Components** stay thin — `Board` wires toolbar and viewport; each `Note` subscribes to its own note data and interaction state.

### Key services

| Service | Responsibility |
|---------|----------------|
| `ViewportService` | Pan/zoom state, world ↔ screen coordinate conversion |
| `PointerService` | Window-level pointer events during drag/resize |
| `InteractionService` | Drag, resize, and trash overlap sessions |
| `PersistenceService` | Debounced serialization of store/viewport and calls to the API layer |
| `ApiService` | Mock async REST API backed by `localStorage` |
| `ZIndexService` | Monotonic z-index allocation and sync |

### Persistence

On startup, `usePersistence` calls `PersistenceService.hydrate()`, which loads notes and viewport through `ApiService` (simulated latency, `localStorage` underneath). Changes are written back debounced on store and viewport updates via the same API layer.

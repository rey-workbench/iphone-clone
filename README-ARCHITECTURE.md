# Reynisa Phone Architecture & Guidelines

Welcome to the Reynisa Phone codebase! This document outlines the structural pattern of our frontend and backend so that the team can easily differentiate between the different layers and maintain a clean separation of concerns.

## The 3-Tier Architecture

Our application is separated into 3 explicit layers based on their domain and scope. By looking at a file's location or its class name, you should immediately know what it does and where it runs.

```mermaid
graph TD
    subgraph Frontend (SvelteKit Client)
        A[Apps Layer<br/>src/lib/apps]
        O[OS Global Layer<br/>src/lib/os]
    end
    
    subgraph Backend (Node.js Server)
        S[Services Layer<br/>src/lib/server]
        DB[(Database)]
    end

    A -->|Reads/Updates| O
    A -->|API Calls via Clients| S
    O -->|API Calls via Clients| S
    S -->|Queries| DB
```

### 1. The Apps Layer (`src/lib/apps`)
- **Domain:** Frontend (Client-side)
- **Scope:** Local to a specific application.
- **Naming Convention:** `[App]AppState` (e.g., `CameraAppState`, `NotesAppState`)
- **Responsibility:**
  - Contains the UI (`.svelte` components) and local state (`.svelte.ts`) for a single app.
  - Examples: Calculator inputs, active email draft, music player queue.
  - Uses Svelte Runes (`$state`, `$derived`) to manage UI reactivity.
  - Discarded when the app is fully closed or unmounted.

### 2. The OS Global Layer (`src/lib/os`)
- **Domain:** Frontend (Client-side)
- **Scope:** Global across the entire Operating System.
- **Naming Convention:** `[Domain]GlobalState` (e.g., `systemGlobalState`, `authGlobalState`)
- **Responsibility:**
  - States that must be shared across multiple apps or the OS shell itself.
  - Stored in `src/lib/os/states`.
  - Examples: Currently logged-in user (`authGlobalState`), battery level and brightness (`systemGlobalState`), active notifications (`notificationGlobalState`).
  - Cannot be tightly coupled to just one app.

### 3. The Services Layer (`src/lib/server/services`)
- **Domain:** Backend (Server-side)
- **Scope:** Full control over the Database and external APIs.
- **Naming Convention:** `[Domain]Service` (e.g., `NotesService`, `AuthService`)
- **Responsibility:**
  - Securely interacts with our SQLite/Turso database using Repositories.
  - Never uses Svelte Runes (`$state`) as it doesn't run in the browser.
  - Called by SvelteKit API endpoints (`+server.ts`).
  - Responsible for validation, security, and data integrity.

---

## Important Rules

1. **App States Must Not Mix:** A `NotesAppState` should not be used inside `CalculatorApp`. If data needs to be shared, it either belongs in an `OS Global State` or should be fetched from the `Service Layer`.
2. **Backend is Backend:** Never import a `Service` file into a frontend Svelte component. SvelteKit will throw an error. Frontend apps must use API endpoints (e.g., `fetch('/api/notes')`) or an API Client (e.g., `NotesApiClient`) to talk to Services.
3. **Naming is Strict:** When creating a new State, you **MUST** append either `AppState` or `GlobalState` to the class name depending on its scope, so other engineers know exactly how to use it.

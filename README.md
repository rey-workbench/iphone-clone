# ReyOS

ReyOS is an advanced, fully interactive smartphone operating system interface replicated entirely in the browser. Built on SvelteKit, it offers a deeply immersive experience with a suite of built-in applications, robust backend security, and a modular architecture.

## Key Features

- **Immersive System UI**: Fully functioning lock screen, app switcher, control center, and dynamic notification banners.
- **Built-in Applications**: A wide array of functional apps including Phone, Messages, Safari, Camera, Photos, Netflix, Music, Mail, Calendar, Calculator, Weather, and Settings.
- **Robust Security**: Centralized API protection using a custom `apiWrapper` with mandatory authentication and penalty-box rate limiting.
- **Advanced Networking**: Built-in web connectivity and proxying via Scramjet for true browser-in-browser experiences (Safari app).

---

## Tech Stack

- **Language**: TypeScript 5+
- **Framework**: Svelte 5 (Runes mode) & SvelteKit
- **Styling**: Tailwind CSS v4
- **Database**: LibSQL (local/edge) & Supabase (remote synchronization)
- **Deployment**: Vercel (via `@sveltejs/adapter-vercel`)
- **Proxy/Transport**: Scramjet & Mercury Workshop transports

---

## Prerequisites

- Node.js 20 or higher
- `pnpm` (recommended package manager)
- A Supabase project (for remote database synchronization)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/reynisa-phone.git
cd reynisa-phone
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Copy the example environment file (if available) or create a `.env` file in the root directory. You will need to configure the following essential variables:

| Variable                   | Description                      | Example                    |
| -------------------------- | -------------------------------- | -------------------------- |
| `PUBLIC_SUPABASE_URL`      | Your Supabase project URL        | `https://xyz.supabase.co`  |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Key           | `eyJhbGciOiJIUzI1...`      |
| `TURN_API_URL`             | WebRTC TURN Server URL (if used) | `https://turn.example.com` |

### 4. Database Setup

Execute the provided SQL script to initialize the Supabase tables:

```bash
# You can run this via the Supabase SQL Editor
cat supabase_setup.sql
```

_(This sets up the `messages` and `temp` tables used by the system)._

### 5. Start Development Server

Run the development server. The `prepare` script automatically bundles SCRAMJET proxy scripts.

```bash
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to experience ReyOS.

---

## Architecture Overview

ReyOS uses a highly modular "System & Apps" architecture. The frontend is cleanly separated into System UI and user applications, while the backend relies on robust Service layers.

### Directory Structure

```text
reynisa-phone/
├── src/
│   ├── lib/
│   │   ├── apps/
│   │   │   ├── system/        # Core system apps (Camera, Messages, Phone, Photos, Settings)
│   │   │   └── user/          # User-level apps (Calculator, Netflix, Safari, Weather, etc.)
│   │   ├── backend/
│   │   │   ├── api.ts         # Central API Wrapper (Security & Rate Limiting)
│   │   │   ├── security/      # AuthValidator & RateLimiter implementations
│   │   │   ├── services/      # Business logic (NetflixService, UsersService, etc.)
│   │   │   └── validation/    # Zod schemas (Validation.ts)
│   │   ├── framework/         # Core UI components and Database adapters (LibSQL)
│   │   ├── os/                # Operating System state (PersistedState)
│   │   └── sysui/             # System UI (Lockscreen, AppSwitcher, ControlCenter, Notifications)
│   └── routes/
│       ├── api/               # SvelteKit API endpoints
│       └── +page.svelte       # Main entry point (Boot screen -> Lock Screen -> OS)
├── static/                    # Static assets, icons, and bundled proxy workers
├── supabase_setup.sql         # Supabase initialization script
└── svelte.config.js           # SvelteKit configuration
```

### Request Lifecycle & Security

1. **Client Interaction**: User interacts with a ReyOS app (e.g., Netflix).
2. **API Request**: App makes an HTTP request to `/api/netflix/trending`.
3. **API Wrapper Layer**:
   - The request hits `src/routes/api/netflix/trending/+server.ts`.
   - The `apiWrapper` intercepts the request.
   - **Rate Limiting**: Checks if the IP is rate-limited (penalty box strategy).
   - **Authentication**: Validates the session token via `isAuthorized`.
4. **Service Execution**: If validated, the `apiWrapper` passes control to `NetflixService`.
5. **Response**: Data is returned seamlessly to the frontend component.

### Key Components

**Security & API (`src/lib/backend/`)**

- `apiWrapper`: A Higher-Order Function that wraps every SvelteKit API route. It completely centralizes API security, drastically reducing boilerplate and ensuring zero endpoints are left unprotected.
- `RateLimiter`: An advanced in-memory sliding window rate limiter with a 5-minute penalty box mechanism.

**Applications (`src/lib/apps/`)**

- Built completely functionally. Safari relies on `@mercuryworkshop/scramjet` for handling raw proxying of web pages within an iframe, providing a realistic browsing experience inside the virtual OS.

**System UI (`src/lib/sysui/`)**

- Employs Svelte 5 runes (`$state`, `$derived`) for highly reactive drag-and-drop mechanics (Control Center) and gesture-based navigation (App Switcher).

---

## Available Scripts

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `pnpm run dev`     | Start Vite dev server with proxy bundling    |
| `pnpm run build`   | Compile the app for production (Vercel)      |
| `pnpm run preview` | Serve the production build locally           |
| `pnpm run check`   | Run `svelte-check` for TypeScript validation |
| `pnpm run lint`    | Run ESLint and custom Tailwind linters       |
| `pnpm run format`  | Run Prettier across the codebase             |

---

## Deployment

ReyOS is pre-configured to deploy seamlessly to Vercel via `@sveltejs/adapter-vercel`.

### Vercel Deployment

1. Push your code to GitHub.
2. Import the project into your Vercel Dashboard.
3. Add the necessary environment variables (`PUBLIC_SUPABASE_URL`, etc.).
4. Deploy! Vercel automatically detects SvelteKit and builds the project using the `build` script.

---

## Apps & Upcoming Features

### Currently Available

- [x] **Phone & Messages**: Including WebRTC-powered FaceTime/Video Call capabilities.
- [x] **Safari**: Fully functional browser proxy using Scramjet.
- [x] **Camera & Photos**: Functioning web camera UI and gallery view.
- [x] **Netflix & Music**: Functional media browsing and playback UI.
- [x] **Productivity Suite**: Mail, Calendar, Calculator, Weather, Notes, and Clock apps.
- [x] **Settings**: Complete with linked devices support.
- [x] **App Store**: Visual replica of the App Store.

### Upcoming Features / TODO

- [ ] **Camera to Gallery Integration**: Save photos and videos captured via the Camera app directly to the Photos (Gallery) database.
- [ ] **Dynamic App Installation**: Make the App Store download and install custom apps dynamically on the fly.
- [ ] **Push Notifications**: Real-time push notifications using Service Workers.
- [ ] **Custom Wallpapers**: Allow users to upload and set custom wallpapers from the Photos app or Settings.
- [ ] **Maps App**: Basic geolocation and mapping features.

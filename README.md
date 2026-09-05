# 🚗 CarBid — Frontend

React frontend for **CarBid**, an online car auction platform. Built with **Vite + React + React-Bootstrap** for the *Special Topics in Computer Science 1* full-stack assignment.

> Backend repository: [car-auction-backend](https://github.com/Cam3L1/car-auction-backend)

## ✨ Features

- **Browse active auctions** — listing cards with images, current bid, bid count and a **live countdown timer**
- **Search & filter** — search by title/make/model and filter by make (server-side)
- **Car details** — vehicle specifications, full immutable bid history, live countdown
- **Bid placement** — controlled form with inline validation (min increment of 100 JOD, must beat current price)
- **Authentication** — login/registration with JWT stored in `localStorage`
- **Create listings** — image URL, starting price and auction duration (end timestamp computed client-side)
- **Profile dashboard** — seller view (my listings) + bidder view (cars I bid on, am I winning / did I win)
- **Admin dashboard** — platform monitoring, bidding log, cancel/delete listings, delete bids (price reverts)
- **Third-party API integrations** — NHTSA vPIC (open car-data API) suggests real models while typing a make in the listing form; open.er-api.com exchange rates show USD equivalents next to every price
- **Route protection** — `/create-listing`, `/profile` require a logged-in user; `/admin/dashboard` requires the admin role

## 🛠 Tech Stack

| Technology       | Purpose                                  |
| ---------------- | ---------------------------------------- |
| Vite             | Build tool + dev server                  |
| React 19         | Functional components, JSX               |
| React Router     | Client-side routing + route guards       |
| React-Bootstrap  | UI components (Navbar, Cards, Tables, Forms, Alerts, Badges) |
| Bootstrap 5      | Responsive grid + styling                |
| Axios            | HTTP requests with JWT headers           |
| NHTSA vPIC API   | Open third-party API: real car models by make (no key) |
| open.er-api.com  | Open third-party API: JOD → USD exchange rates (no key) |

## 🚀 Setup

```bash
# 1. clone the repository
git clone https://github.com/Cam3L1/car-auction-frontend.git
cd car-auction-frontend

# 2. install dependencies
npm install

# 3. start the dev server (http://localhost:5173)
npm run dev
```

> The frontend expects the backend API at `http://localhost:5001/api` (see `src/api.js`). Start the backend first — see [car-auction-backend](https://github.com/Cam3L1/car-auction-backend).

### Demo Accounts

| Role  | Email               | Password    |
| ----- | ------------------- | ----------- |
| admin | `admin@carbid.com`  | `admin123`  |
| user  | `sara@example.com`  | `password123` |

## 🗺 Routes

| Route             | Access        | Description                                     |
| ----------------- | ------------- | ----------------------------------------------- |
| `/`               | public        | Browse active auctions + search/filter          |
| `/login`          | public        | Login form                                       |
| `/register`       | public        | Registration form                                |
| `/cars/:id`       | public        | Car details, bid history, countdown, bid form    |
| `/create-listing` | normal user   | Create a new auction listing                     |
| `/profile`        | normal user   | Seller view + bidder view dashboard              |
| `/admin/dashboard`| admin         | Monitoring + moderation (bids & listings)        |

## 🧱 Component Structure

```
src/
├── main.jsx                 # BrowserRouter + Bootstrap CSS
├── App.jsx                  # routes, auth state, prop drilling
├── api.js                   # axios instance + JWT authHeaders()
└── components/
    ├── NavBar.jsx           # conditional links by role, logout
    ├── ProtectedRoute.jsx   # <ProtectedRoute> and <AdminRoute> guards
    ├── Home.jsx             # auction grid + search/filter form
    ├── CarCard.jsx          # one listing card (map-rendered)
    ├── Countdown.jsx        # live countdown (setInterval + useEffect)
    ├── CarDetail.jsx        # details, bid history, bid form
    ├── Login.jsx            # controlled form + inline validation
    ├── Register.jsx         # controlled form + inline validation
    ├── CreateListing.jsx    # sell-a-car form
    ├── Profile.jsx          # seller + bidder dashboard
    └── AdminDashboard.jsx   # monitoring + moderation actions
```

**State management:** plain React hooks (`useState`/`useEffect`) with deliberate **props and prop drilling** — state lives in `App` and flows down to components as props, event handlers are passed down as callbacks. Data is fetched with Axios using `async/await`; the JWT is read from `localStorage` and attached to protected requests.

**Third-party APIs (addition to our own REST API):**

| Integration      | Where                          | How it works |
| ---------------- | ------------------------------ | ------------ |
| NHTSA vPIC       | `CreateListing.jsx`            | Debounced request (600 ms after typing pauses) to `vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/{make}`; the unique model names populate a `<datalist>` on the model field, with graceful fallback to manual entry |
| open.er-api.com  | `Home.jsx`, `CarDetail.jsx`    | One request to `/v6/latest/JOD` per page; the USD rate is passed to `CarCard` through props and shown as "≈ $X" next to every JOD price. If the API is unreachable the app simply shows JOD only |

## 📸 Screenshots

| Home | Car Detail | Profile | Admin |
| ---- | ---------- | ------- | ----- |
| active auctions with live countdowns | bid history + bid form | seller & bidder views | monitoring + moderation |

## 🌿 Git Workflow

Feature-branch workflow with pull requests: `feat/*`, `docs/*`, `style/*` branches merged into `main` with structured conventional commits.

---

*Built as part of the Special Topics in Computer Science 1 assignment (2025-2026).*

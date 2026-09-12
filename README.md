# PARADOX AgriProcure 🌾🇮🇳

A professional public-service-style agricultural procurement portal prototype with separate Farmer, Staff and Admin workflows.

## Main workflow

**Farmer:** choose State → District → Procurement Centre → book a slot → receive a PX token → track queue status.

**Staff:** choose the current working centre → view today's queue → call the farmer → start processing → record weighment/grade → complete the procurement and issue the receipt.

**Admin:** manage staff accounts and assignments, control centre availability, review grievances, publish notices and view live platform statistics.

## Important role separation

- Farmer sees Farmer Desk and farmer features only.
- Staff sees Staff Desk and centre-operation features only.
- Admin sees Admin Desk and central-management features only.
- Admin does not use a Farmer "My Bookings" workspace.
- Server-side role checks protect the protected APIs as well as the UI.

## Centre and location system

The procurement centre directory is the single source of truth. Farmer booking is restricted to the authenticated farmer's saved State + District. The searchable centre picker works across centre name, state, district, address and PIN.

Farmers can update their location from **Farmer Desk → My Profile**. Staff can update their current working centre from **Staff Desk → My Working Centre**. Admin can assign/reassign staff from **Admin Desk → Staff Management**.

The included centre seed contains demo records for testing. Demo records should not be presented as official government operational centres without verification.

## Offline Local Sheet

The Staff Desk includes a local-first work queue for outages:

- booking status changes are saved locally when the server is unavailable;
- procurement records are saved locally when offline;
- cached queue/centre/procurement data is restored after a temporary outage;
- pending entries survive refreshes;
- **Sync Now** and automatic reconnect sync are available;
- pending procurement entries can be edited or removed before sync.

## Kisan Sahayak

Kisan Sahayak is intentionally **static, not AI** in this revision. It provides eight predefined English/Hindi help questions with instant answers and optional browser text-to-speech. No external AI service or API key is required.

## Tech stack

- Frontend: React 19 + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript/tsx
- API: REST endpoints
- Authentication: signed session tokens + role checks
- Password hashing: SHA-256 demo hashing helper in the existing prototype
- Local persistence: JSON database under `data/db.json`
- Browser offline cache: localStorage
- Icons: Lucide React

> Note: this generated revision uses the existing local JSON persistence layer. It does **not** claim that MongoDB is connected. If you want MongoDB Atlas persistence, the database layer must be switched from `data/db.json` to MongoDB/Mongoose and the `MONGODB_URI` environment variable must be added.

## Install and run

```bash
npm install
npm run dev
```

Open the exact URL printed by the terminal. The default is `http://localhost:3000`; if port 3000 is occupied, the server automatically moves to the next free port.

For a production build:

```bash
npm run build
npm start
```

## Demo accounts

| Role | Mobile | Password |
|---|---|---|
| Farmer | `9876543210` | `Farmer@123` |
| Staff | `9812345678` | `Staff@123` |
| Admin | `9899001122` | `Admin@123` |

Change demo credentials before any public deployment.

## Fresh demo data

The application creates `data/db.json` automatically. To reset the local demo database, stop the server and delete `data/db.json`, then run `npm run dev` again.

## Troubleshooting

If the browser shows an old version, close the old dev-server terminal, stop any duplicate process using port 3000, start this project again and open the exact URL printed in the terminal.

If the centre picker looks empty, make sure the API is running with this project and refresh after the server has loaded the centre seed. The farmer profile and booking modal both read `/api/centres`.

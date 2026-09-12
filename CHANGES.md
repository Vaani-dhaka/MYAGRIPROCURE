# PARADOX AgriProcure — Final Working Revision

## Role separation
- Farmer dashboard contains farmer-only bookings, profile, wallet, bank details and support tools.
- Staff dashboard is a centre-operations workbench: today's queue, farmer search, Call Farmer, Processing and Complete/Receipt flow.
- Admin dashboard is central control only: overview, staff management, centres, grievances and announcements.
- Admin never gets a Farmer "My Bookings" workspace.

## Admin staff control
- Admin can add a new staff account with name, mobile, email, temporary password and assigned centre.
- Admin can assign/reassign a staff member to a procurement centre.
- Admin can remove a staff member from active duty; this unassigns the centre and blocks login.
- Admin can reactivate an inactive staff account.
- Admin can permanently delete a staff account.
- Server-side role checks protect all admin staff actions.

## Farmer centre/location fixes
- Centre data comes from one central directory.
- Farmer booking is restricted by the authenticated farmer's State + District on both frontend and backend.
- Farmer centre picker has a real searchable dropdown for centre name, state, district, address and PIN.
- Farmer profile derives State and District options from the central centre directory.
- Farmer can edit State, District and Preferred Procurement Centre and save the new location.
- Multiple demo centres in the same district make search/location testing possible.

## Staff location fixes
- Staff has a searchable working-centre picker.
- Selecting a centre updates the staff working location and the queue shown on the staff desk.
- Staff assignment is persisted server-side.

## Offline Local Sheet
- Offline queue updates and procurement records are stored locally per staff account.
- Pending work survives refreshes.
- Automatic sync runs when connectivity returns and Sync Now is available.
- Pending records are displayed in a professional local work queue.
- Procurement entries can be edited locally (for example, weight) or removed before sync.
- Cached bookings, procurement history and centre data are restored when the server is temporarily unavailable.

## Kisan Sahayak
- Changed to a static, non-AI help assistant.
- Eight predefined English/Hindi questions provide immediate answers.
- Browser text-to-speech is retained for accessibility.
- No Gemini API key is required.

## Stability
- Vite HMR WebSocket is disabled to avoid the extra 24678 port collision.
- Server automatically selects the next free port if the requested port is busy.
- React error boundary remains enabled.
- Centre picker uses a high z-index searchable dropdown so results remain visible inside forms/modals.

## Validation
- Modified TypeScript/TSX files were syntax-checked with the TypeScript transpiler.
- Full dependency-based Vite build could not be run in this environment because npm package downloads timed out.
- `node_modules` is intentionally not included; run `npm install` locally before starting.

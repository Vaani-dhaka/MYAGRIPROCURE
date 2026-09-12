# PARADOX AgriProcure – V3 Bug Fix

## Critical runtime fix
The previous build had a React Rules-of-Hooks violation in `src/components/AuthModal.tsx`: an `useEffect` ran only after `if (!isOpen) return null`. When the modal opened, React saw a different hook count and raised:

`Rendered more hooks than during the previous render.`

The effect has been moved above the conditional return so the component calls the same hooks on every render.

## Vite dev-server fix
Vite middleware now explicitly has `hmr: false`, avoiding the extra WebSocket/HMR port that previously produced the 24678 port collision.

## Run
1. Stop old server with Ctrl+C.
2. Extract this ZIP into a NEW folder.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the exact URL printed by the terminal.
6. If Chrome still shows the old error, do a hard reload with Cmd+Shift+R or close the old localhost tab.

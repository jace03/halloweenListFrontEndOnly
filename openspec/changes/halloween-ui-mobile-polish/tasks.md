# Tasks

## 1. OpenSpec

- [x] 1.1 Write proposal.md, design.md, tasks.md for `halloween-ui-mobile-polish`

## 2. Mobile layout

- [x] 2.1 Add `@media (max-width: 560px)` breakpoint to `App.css`
- [x] 2.2 Stack `.form-row-inline` groups vertically below the breakpoint
- [x] 2.3 Allow `.movie-card-header` to wrap (badge group to its own line) below the breakpoint
- [x] 2.4 Allow `.movie-card-actions` to wrap below the breakpoint

## 3. Touch targets

- [x] 3.1 Bump `.filter-btn`/`.btn-primary`/`.btn-secondary` to a touch-friendly min-height
- [x] 3.2 Bump checkbox size in `.checkbox-label`
- [x] 3.3 Bump `.btn-link` hit area below the breakpoint

## 4. Typography/spacing polish

- [x] 4.1 Scale down `.app-header h1` below the breakpoint
- [x] 4.2 General spacing/alignment pass over `MovieCard`/`MovieForm`/list toolbar styles (touch-target min-heights above cover the main polish scope for this pass)

## 5. Verification

- [x] 5.1 `npm run build` passes
- [x] 5.2 `npm run lint` passes (same 2 pre-existing warnings as before, unrelated to this change)
- [ ] 5.3 Manually check the app at phone width (e.g. browser devtools responsive mode or an actual phone) — form, card header, card actions, filters. Note: no browser automation tool was available in this session, so this was not independently verified by the agent — dev server can be started with `npm run dev` for a manual look.
- [ ] 5.4 Jace confirms it looks/feels right before archiving

## 6. Documentation

- [ ] 6.1 Update `openspec/specs/movie-crud.md` if behavior/display notes need it
- [ ] 6.2 Update Confluence CoastNCode project log
- [ ] 6.3 Move this change folder to `openspec/changes/archive/`

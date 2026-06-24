# TODO - BioLens stability & correctness

## Phase 1 — Project Analysis (completed)
- [x] Read backend (`biolens-backend/main.py`)
- [x] Read frontend main route (`src/routes/index.tsx`)
- [x] Read all panels: DNAs, Twin, Interactions, Multiomics, Mutations, ResearchAgent, ProteinViewer
- [x] Map backend endpoints and frontend fetch usage

## Phase 2 — Static code analysis fixes
- [ ] Fix `src/components/MultiomicsPanel.tsx` incorrect side-effect usage (`useState(() => fetchData)` → `useEffect`)

## Phase 3 — Verify API/data contracts
- [ ] Validate `repurpose/{disease}` response contract vs UI usage
- [ ] Replace hardcoded home-page candidate scoring/CI where backend data is available
- [ ] Replace hardcoded metrics with `/stats` where possible

## Phase 4 — Backend security/stability hardening
- [ ] Move Neo4j credentials to env vars; preserve fallback
- [ ] Fix CORS configuration for credentials

## Phase 5 — Execute project
- [ ] Run frontend typecheck/build
- [ ] Run backend (smoke test endpoints)
- [ ] Smoke test all UI panels

## Phase 6 — Final report
- [ ] Produce final architecture overview + bug list + files modified + remaining warnings


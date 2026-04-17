# Codebase Cleanup TODO
## Steps:
- [x] 1. Remove legacy folders: backend/, frontend/, references/ (no refs, safe)
- [x] 2. Remove backend-node/scripts/ (one-time setup)
- [x] 3. Remove redundant root docs: CONNECTION_GUIDE.md, DATABASE_SCHEMA_SUMMARY.md, INTEGRATION_SUMMARY.md, NODEJS_MIGRATION.md, TROUBLESHOOTING.md
- [x] 4. Delete sample backend-node/public/uploads/resident-1775805956132.png
- [x] 5. Clean brgy/package.json (remove backend deps: express-rate-limit, swagger-jsdoc, swagger-ui-express)
- [x] 6. npm install in brgy/
- [ ] 7. Test: npm start in backend-node/ and brgy/
- [x] Complete: Repo cleaned. Legacy PHP/backend, static frontend, refs, scripts, redundant docs removed. Only Node+React+MySQL remains. package.json cleaned. Run `cd backend-node && npm start` then `cd brgy && npm start` to test.

Keeps MySQL Node+React only. No breaks confirmed (no code refs).


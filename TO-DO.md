# TO-DO – Business Card Backend

## Completed Tasks

### Railway Deployment Setup (2025-02-17)

1. **Created Railway project**
   - Project name: `business-card`
   - Project URL: https://railway.com/project/2a79627b-6bba-4408-94ca-f5f73ac2d7cf
   - Workspace: Nbg Gh's Projects

2. **Added services**
   - Backend service: NestJS API (from `railway.toml` build/start)
   - PostgreSQL: Database template

3. **Configured backend environment**
   - `DATABASE_URL`: Wired to `${{Postgres.DATABASE_URL}}` (auto-injected from Postgres)
   - `JWT_SECRET`: Placeholder `REPLACE_WITH_YOUR_SECRET` – **replace with your value**

4. **Generated public domain**
   - Backend URL: https://backend-production-e79a.up.railway.app

5. **Deployed backend**
   - Initial deploy triggered via `railway up`
   - Build logs: Available in Railway dashboard

### How it was done

- Railway CLI: `railway init`, `railway add -s backend`, `railway add -d postgres`
- Build/start from `railway.toml`: Nixpacks builder, Prisma generate + build, migrate deploy + start
- `railway environment edit --json` to set variables and build commands
- `railway domain --service backend` for public URL
- `railway up --detach` for deployment

---

## To-Do

- [ ] **Set `JWT_SECRET`** – Run:
  ```bash
  railway variables set JWT_SECRET="your-secure-secret"
  ```
- [ ] Redeploy after `main.ts` bind fix (see below)
- [ ] Switch back to **private** `${{Postgres.DATABASE_URL}}` (public URL caused TCP_OVERWINDOW)
- [ ] Verify deployment succeeds and migrations run
- [ ] Update frontend to use backend URL if needed

---

## Deployment issues & fixes (2025-02-17)

**Status:** All backend deployments FAILED. Backend is not reachable.

**Network flow errors seen:**
- `TCP_AOFAILURE` / `NO_SOCKET` (with private DB URL)
- `TCP_OVERWINDOW` (with public DB URL) – worse

**Fix applied:**
- `main.ts`: Bind to `0.0.0.0` so the app accepts connections from Railway’s proxy. Change: `await app.listen(port, '0.0.0.0')`.

**Next steps:**
1. Redeploy: `railway up --detach -m "Bind to 0.0.0.0 for Railway"`
2. Use private `DATABASE_URL` again in Railway variables
3. If it still fails, consider opening a Railway support ticket for “Error configuring network” / TCP_AOFAILURE

---

## Notes

- Backend service ID: `fdb1e522-adf7-47ac-bc99-ae1c605c2e4a`
- Environment: production (`2e1e0685-832e-4dd2-8f9b-4828b571b7ac`)
- If build fails on start command, check NestJS output path: `dist/main.js` vs `dist/src/main.js` (see `package.json` start:prod)

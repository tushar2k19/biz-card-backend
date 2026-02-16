# Deploy this backend on Railway

This repo is the backend for the Business Card Scanner app. Frontend is at [https://iitf-bcard.netlify.app/](https://iitf-bcard.netlify.app/).

## 1. Push the code to GitHub (if not done)

From your machine, in this repo:

```bash
git push -u origin main
```

## 2. Deploy on Railway

1. **Sign in**  
   Go to [railway.app](https://railway.app) and sign in with GitHub.

2. **New project**  
   Click **New Project**.

3. **Add PostgreSQL**  
   - Click **Add service** (or **New**).  
   - Choose **Database** → **PostgreSQL**.  
   - Railway creates a DB and shows a `DATABASE_URL` in the **Variables** tab.  
   - Copy it (you’ll use it in the next step).

4. **Add the backend service**  
   - Click **Add service** again.  
   - Choose **GitHub Repo** and select `tushar2k19/biz-card-backend`.  
   - After the repo is connected, click the new service to open its settings.

5. **Configure the service**  
   In the service’s **Settings** (or **Variables**):

   - **Root Directory**: leave empty (repo root is the backend).
   - **Build Command** (if asked):  
     `npm install && npx prisma generate && npm run build`
   - **Start Command** (override if needed):  
     `npx prisma migrate deploy && node dist/src/main.js`

   In **Variables**, add:

   | Variable         | Value |
   |------------------|--------|
   | `DATABASE_URL`   | (paste the PostgreSQL URL from the DB service; Railway can also “Reference” it) |
   | `JWT_SECRET`     | A long random string, e.g. run `openssl rand -base64 32` and paste the output |

   If Railway gives you a way to “Reference” the Postgres `DATABASE_URL` from the DB service, use that so it stays in sync.

6. **Deploy**  
   Save and let Railway build and deploy. The first deploy may take a few minutes.

7. **Public URL**  
   In the service, open **Settings** → **Networking** (or **Generate domain**) and create a **Public URL**.  
   Example: `https://biz-card-backend-production.up.railway.app`

8. **Seed the database (once)**  
   From your machine, with the **same** `DATABASE_URL` Railway uses:

   ```bash
   cd /path/to/biz-card-backend   # or backend folder
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   DATABASE_URL="postgresql://..." npx prisma db seed
   ```

   Use the Railway Postgres URL (from the DB service Variables).

## 3. Connect the frontend (Netlify)

Your frontend is at [https://iitf-bcard.netlify.app/](https://iitf-bcard.netlify.app/).

1. In **Netlify**: Site → **Site configuration** → **Environment variables** (or **Build & deploy** → **Environment**).
2. Add:
   - **Key**: `VITE_API_URL`  
   - **Value**: Your Railway backend URL, e.g. `https://biz-card-backend-production.up.railway.app`
3. Trigger a **new deploy** (e.g. **Deploys** → **Trigger deploy** → **Deploy site**) so the new variable is used.

After the redeploy, the app at https://iitf-bcard.netlify.app/ will call your Railway backend.

## 4. Super admin login

After seeding, you can log in as:

- **Email**: `admin@platform.com`  
- **Password**: `Admin123!`

(Or whatever you set in `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` when running the seed.)

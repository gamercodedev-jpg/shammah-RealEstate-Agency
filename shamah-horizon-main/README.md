# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Admin helper (server-side)

The admin UI may need a server-side helper to perform writes that are blocked by Supabase Row-Level Security. There are three options:

- Deploy the included serverless endpoint `api/admin.js` (Vercel/Netlify). Set these environment variables on the deployment:
	- `SUPABASE_URL` — your Supabase project URL
	- `SUPABASE_SERVICE_ROLE` — your Supabase service_role key (keep secret)
	- `VITE_ADMIN_INSERT_ENDPOINT` — set to the deployed endpoint (e.g. `https://your-site.com/api/admin`)

- Or run locally with `vercel dev` (install Vercel CLI) after setting `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE` in your env. Then set `VITE_ADMIN_INSERT_ENDPOINT=http://localhost:3000/api/admin` in your local `.env` and restart the frontend.

- Quick (unsafe, dev-only): set `VITE_SUPABASE_SERVICE_ROLE` in your local `.env` so the browser client uses the service role directly. DO NOT use this in production — it exposes full DB access to users.

Serverless endpoint usage (client-side): `admin` requests expect JSON body with `{ action: 'insert'|'update'|'delete', table: '<table>', row?, id? }`.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

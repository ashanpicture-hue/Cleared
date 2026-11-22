# Cleared

Export document checking for Pakistani exporters. Static site in `public/`, API in `api/index.js` (Express on a Vercel function), Postgres for data, Supabase Storage for files.

## Set up
1. Create a Supabase project. Run `db/schema.sql` in its SQL editor. Create a private bucket named `cleared-uploads`.
2. Copy `.env.example` to Vercel environment variables. `DATABASE_URL`, `JWT_SECRET` and `SUPABASE_*` are required. Without `TWILIO_*` production cannot send login codes.
3. Create the first admin: `insert into users (phone, name, role) values ('+923XXXXXXXXX', 'Your name', 'admin');` Add reviewers from `/admin/users.html`.
4. `npm install`, `npm test`, then `vercel deploy`. Locally: `npm run dev`.

## How a shipment moves
`queued` -> `extracting` (Claude reads files, `lib/rules.js` compares fields) -> `needs_review` -> `under_review` (a reviewer claims it) -> `completed`. Customers see the report only at `completed`. Any extraction failure still lands in `needs_review`.

## Not built yet
- Corrected PDF pack generation (the reviewer sends it on WhatsApp for now).
- Reviewers cannot add a mismatch the agent missed, only accept, edit or reject findings.
- Excel files are stored but not read automatically.
- Uploads are capped at 4 MB per file (Vercel request limit). Larger files need signed upload URLs.
- WhatsApp intake, online payment, Desk seats and plan billing, customer notifications.
- No integration test against a live database yet.

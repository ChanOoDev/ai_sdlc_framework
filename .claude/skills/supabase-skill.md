# Supabase Skill

Use for Supabase Auth, PostgreSQL, Storage, and RLS.

## Guidelines

- Enable RLS on business tables.
- Use `auth.uid()` for user-context access.
- Use service role only on trusted server paths.
- Never expose service role key to the browser.
- Maintain migrations and seed data.

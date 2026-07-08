# Supabase Setup

1. Create a new Supabase project.
2. Run `schema.sql` in the SQL editor.
3. Run `seed.sql` to populate the products table.
4. Add these environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Keep the `products` table public for reads.
6. Use the service role key only on the server for order creation and later admin workflows.

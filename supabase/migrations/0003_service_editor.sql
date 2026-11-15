-- Changes applied to the connected Supabase project.
-- Run on a new environment after 0002_catalog_and_read_policies.sql.
-- Only authenticated owner/admin may update selected service settings.
-- Financial operations remain inaccessible from the browser.

grant update (name, unit, active) on public.services to authenticated;

create policy "catalog_owner_admin_update"
on public.services
for update to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('owner', 'admin')
  )
);

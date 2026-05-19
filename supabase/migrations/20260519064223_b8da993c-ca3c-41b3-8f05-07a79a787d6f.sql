
-- Set search_path on the simple trigger helper
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Lock down SECURITY DEFINER helpers: revoke from public/anon, allow authenticated only
revoke all on function public.has_role(uuid, public.app_role) from public, anon;
revoke all on function public.is_staff(uuid) from public, anon;
revoke all on function public.is_business_member(uuid, uuid) from public, anon;
revoke all on function public.touch_updated_at() from public, anon;
revoke all on function public.handle_new_user() from public, anon, authenticated;

grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.is_staff(uuid) to authenticated;
grant execute on function public.is_business_member(uuid, uuid) to authenticated;

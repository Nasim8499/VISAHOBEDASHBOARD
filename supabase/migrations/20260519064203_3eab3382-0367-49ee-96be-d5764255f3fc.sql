
-- =========================================================
-- ENUMS
-- =========================================================
create type public.app_role as enum ('super_admin', 'employee', 'client');
create type public.business_status as enum ('active', 'paused', 'completed');
create type public.task_status as enum ('Backlog','To Do','In Progress','Waiting Client Approval','Revision Requested','Completed');
create type public.deliverable_status as enum ('Not Started','In Progress','Waiting Client Approval','Revision Requested','Completed','Rejected');
create type public.approval_action as enum ('submitted','approved','revision_requested','rejected','commented');

-- =========================================================
-- PROFILES
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- =========================================================
-- USER ROLES
-- =========================================================
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- Security definer role checker (avoids RLS recursion)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role in ('super_admin','employee')
  )
$$;

-- =========================================================
-- BUSINESSES
-- =========================================================
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  category text not null default '',
  city text default '',
  country text default '',
  logo text default '🏢',
  cover text default '',
  color text default '#003B73',
  slogan text default '',
  font text default 'Inter',
  status public.business_status not null default 'active',
  stage text default 'Discovery',
  deadline date,
  budget text default '',
  progress int not null default 0,
  manager_name text default '',
  palette text[] default array['#003B73','#177BBB','#E63946','#F1573D','#F8FAFC'],
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.businesses enable row level security;

-- Map client users -> businesses they can see in the portal
create table public.business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);
alter table public.business_members enable row level security;

create or replace function public.is_business_member(_user_id uuid, _business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_staff(_user_id) or exists (
      select 1 from public.business_members
      where user_id = _user_id and business_id = _business_id
    )
$$;

-- =========================================================
-- TASKS
-- =========================================================
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  assignee_name text default '',
  priority text not null default 'Medium',
  status public.task_status not null default 'To Do',
  due_date date,
  created_at timestamptz not null default now()
);
alter table public.tasks enable row level security;

-- =========================================================
-- DELIVERABLES
-- =========================================================
create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  progress int not null default 0,
  status public.deliverable_status not null default 'Not Started',
  created_at timestamptz not null default now()
);
alter table public.deliverables enable row level security;

-- =========================================================
-- APPROVALS + HISTORY
-- =========================================================
create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  deliverable_id uuid not null references public.deliverables(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  status public.deliverable_status not null default 'Waiting Client Approval',
  comment text default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.approvals enable row level security;

create table public.approval_history (
  id uuid primary key default gen_random_uuid(),
  approval_id uuid not null references public.approvals(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  action public.approval_action not null,
  comment text default '',
  by_user uuid references auth.users(id) on delete set null,
  by_user_name text default '',
  created_at timestamptz not null default now()
);
alter table public.approval_history enable row level security;

-- =========================================================
-- MESSAGES (chat)
-- =========================================================
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete set null,
  sender_name text default '',
  body text not null,
  internal boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;

-- =========================================================
-- MEETINGS
-- =========================================================
create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  type text not null default 'Discovery Call',
  scheduled_at timestamptz not null,
  agenda text default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.meetings enable row level security;

-- =========================================================
-- FILES
-- =========================================================
create table public.files (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  path text not null,
  category text default 'Client Info',
  status text default 'Pending',
  size_bytes bigint default 0,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.files enable row level security;

-- =========================================================
-- NOTIFICATIONS
-- =========================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text default '',
  link text default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;

-- =========================================================
-- ACTIVITY LOGS
-- =========================================================
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  actor_name text default '',
  action text not null,
  target text default '',
  created_at timestamptz not null default now()
);
alter table public.activity_logs enable row level security;

-- =========================================================
-- TRIGGERS: profile + first-user-as-super-admin
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first boolean;
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  );

  select count(*) = 0 into is_first from public.user_roles;
  if is_first then
    insert into public.user_roles (user_id, role) values (new.id, 'super_admin');
  else
    insert into public.user_roles (user_id, role)
    values (
      new.id,
      coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'client')
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at helper
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger trg_businesses_updated before update on public.businesses
  for each row execute function public.touch_updated_at();
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.touch_updated_at();

-- =========================================================
-- RLS POLICIES
-- =========================================================

-- profiles
create policy "profiles select all authed" on public.profiles
  for select to authenticated using (true);
create policy "profiles update own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- user_roles
create policy "user_roles select own or staff" on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "user_roles super admin manage" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

-- businesses
create policy "businesses staff full" on public.businesses
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
create policy "businesses client read own" on public.businesses
  for select to authenticated
  using (public.is_business_member(auth.uid(), id));

-- business_members
create policy "members staff full" on public.business_members
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
create policy "members client read own" on public.business_members
  for select to authenticated using (user_id = auth.uid());

-- tasks
create policy "tasks staff full" on public.tasks
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
create policy "tasks client read" on public.tasks
  for select to authenticated
  using (public.is_business_member(auth.uid(), business_id));

-- deliverables
create policy "deliverables staff full" on public.deliverables
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
create policy "deliverables client read" on public.deliverables
  for select to authenticated
  using (public.is_business_member(auth.uid(), business_id));

-- approvals
create policy "approvals staff full" on public.approvals
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
create policy "approvals client read" on public.approvals
  for select to authenticated
  using (public.is_business_member(auth.uid(), business_id));
create policy "approvals client insert own business" on public.approvals
  for insert to authenticated
  with check (public.is_business_member(auth.uid(), business_id) and created_by = auth.uid());

-- approval_history
create policy "history staff full" on public.approval_history
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
create policy "history client read" on public.approval_history
  for select to authenticated
  using (public.is_business_member(auth.uid(), business_id));
create policy "history client insert" on public.approval_history
  for insert to authenticated
  with check (public.is_business_member(auth.uid(), business_id) and by_user = auth.uid());

-- messages
create policy "messages staff full" on public.messages
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
create policy "messages client read non-internal" on public.messages
  for select to authenticated
  using (public.is_business_member(auth.uid(), business_id) and internal = false);
create policy "messages client insert non-internal" on public.messages
  for insert to authenticated
  with check (
    public.is_business_member(auth.uid(), business_id)
    and sender_id = auth.uid()
    and internal = false
  );

-- meetings
create policy "meetings staff full" on public.meetings
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
create policy "meetings client read" on public.meetings
  for select to authenticated
  using (public.is_business_member(auth.uid(), business_id));

-- files
create policy "files staff full" on public.files
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
create policy "files client read" on public.files
  for select to authenticated
  using (public.is_business_member(auth.uid(), business_id));
create policy "files client insert" on public.files
  for insert to authenticated
  with check (public.is_business_member(auth.uid(), business_id) and uploaded_by = auth.uid());

-- notifications
create policy "notifications own select" on public.notifications
  for select to authenticated using (user_id = auth.uid());
create policy "notifications own update" on public.notifications
  for update to authenticated using (user_id = auth.uid());
create policy "notifications staff insert" on public.notifications
  for insert to authenticated with check (public.is_staff(auth.uid()) or user_id = auth.uid());

-- deliverables (deliverables also created by staff handled above)

-- activity_logs
create policy "activity staff full" on public.activity_logs
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
create policy "activity client read" on public.activity_logs
  for select to authenticated
  using (business_id is not null and public.is_business_member(auth.uid(), business_id));

-- =========================================================
-- REALTIME (messages, notifications, approvals)
-- =========================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.approvals;
alter publication supabase_realtime add table public.tasks;

-- =========================================================
-- STORAGE BUCKET + POLICIES
-- =========================================================
insert into storage.buckets (id, name, public) values ('workspace-files', 'workspace-files', false)
on conflict (id) do nothing;

-- Files are stored under: <business_id>/<filename>
create policy "ws-files staff read" on storage.objects
  for select to authenticated
  using (bucket_id = 'workspace-files' and public.is_staff(auth.uid()));

create policy "ws-files staff write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'workspace-files' and public.is_staff(auth.uid()));

create policy "ws-files staff update" on storage.objects
  for update to authenticated
  using (bucket_id = 'workspace-files' and public.is_staff(auth.uid()));

create policy "ws-files staff delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'workspace-files' and public.is_staff(auth.uid()));

create policy "ws-files member read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'workspace-files'
    and public.is_business_member(auth.uid(), (split_part(name, '/', 1))::uuid)
  );

create policy "ws-files member upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'workspace-files'
    and public.is_business_member(auth.uid(), (split_part(name, '/', 1))::uuid)
    and owner = auth.uid()
  );

-- First Bites family sync schema.
-- Run this once in your Supabase project: SQL Editor → New query → paste → Run.

create extension if not exists pgcrypto;

create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  join_code text unique not null,
  baby_name text not null,
  birthdate date not null,
  created_at timestamptz not null default now()
);

create table if not exists family_members (
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table if not exists tries (
  id uuid primary key,
  family_id uuid not null references families(id) on delete cascade,
  food_id text not null,
  tried_on date not null,
  rating text,
  reaction boolean not null default false,
  notes text not null default '',
  fed_by text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists tries_family_idx on tries(family_id);

create table if not exists food_notes (
  family_id uuid not null references families(id) on delete cascade,
  food_id text not null,
  body text not null default '',
  updated_at timestamptz not null default now(),
  primary key (family_id, food_id)
);

-- Row-level security: members only see their own family's data.
alter table families enable row level security;
alter table family_members enable row level security;
alter table tries enable row level security;
alter table food_notes enable row level security;

create or replace function is_member(fam uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from family_members
    where family_id = fam and user_id = auth.uid()
  );
$$;

drop policy if exists families_select on families;
create policy families_select on families for select using (is_member(id));
drop policy if exists families_update on families;
create policy families_update on families for update using (is_member(id));

drop policy if exists members_select on family_members;
create policy members_select on family_members for select using (is_member(family_id));
drop policy if exists members_update_self on family_members;
create policy members_update_self on family_members for update using (user_id = auth.uid());

drop policy if exists tries_all on tries;
create policy tries_all on tries for all
  using (is_member(family_id)) with check (is_member(family_id));

drop policy if exists notes_all on food_notes;
create policy notes_all on food_notes for all
  using (is_member(family_id)) with check (is_member(family_id));

-- Create a family and add the caller as its first member. Returns the family row.
create or replace function create_family(p_baby_name text, p_birthdate date, p_display_name text)
returns families
language plpgsql security definer set search_path = public as $$
declare
  fam families;
  code text;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  -- 6-char code, unambiguous alphabet, retry on the (tiny) chance of collision
  loop
    code := upper(substring(replace(replace(encode(gen_random_bytes(8), 'base64'), '/', ''), '+', '') from 1 for 6));
    code := translate(code, '01OIL', '23456');
    exit when not exists (select 1 from families where join_code = code);
  end loop;
  insert into families (join_code, baby_name, birthdate)
    values (code, p_baby_name, p_birthdate) returning * into fam;
  insert into family_members (family_id, user_id, display_name)
    values (fam.id, auth.uid(), coalesce(nullif(trim(p_display_name), ''), 'Parent'));
  return fam;
end;
$$;

-- Join an existing family by its code. Returns the family row.
create or replace function join_family(p_code text, p_display_name text)
returns families
language plpgsql security definer set search_path = public as $$
declare
  fam families;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select * into fam from families where join_code = upper(trim(p_code));
  if fam.id is null then raise exception 'No family found for that code'; end if;
  insert into family_members (family_id, user_id, display_name)
    values (fam.id, auth.uid(), coalesce(nullif(trim(p_display_name), ''), 'Family member'))
    on conflict (family_id, user_id) do update set display_name = excluded.display_name;
  return fam;
end;
$$;

grant execute on function create_family(text, date, text) to authenticated;
grant execute on function join_family(text, text) to authenticated;
grant execute on function is_member(uuid) to authenticated;

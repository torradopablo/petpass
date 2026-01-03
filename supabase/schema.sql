-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  phone text,
  plan text default 'gratis',
  plan_status text default 'active',
  plan_expires_at timestamptz default (now() + interval '1 month'),
  subscription_period text default 'monthly',
  subscription_id text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- PETS TABLE
create table public.pets (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) not null,
  name text not null,
  photo_url text,
  medical_info text,
  is_premium boolean default false,
  created_at timestamptz default now()
);

alter table public.pets enable row level security;

create policy "Anyone can view pets (for public profile)."
  on pets for select
  using ( true );

create policy "Users can insert their own pets."
  on pets for insert
  with check ( auth.uid() = owner_id );

create policy "Users can update their own pets."
  on pets for update
  using ( auth.uid() = owner_id );

create policy "Users can delete their own pets."
  on pets for delete
  using ( auth.uid() = owner_id );

-- SCANS TABLE
create table public.scans (
  id uuid default uuid_generate_v4() primary key,
  pet_id uuid references public.pets(id) on delete cascade not null,
  latitude float,
  longitude float,
  created_at timestamptz default now()
);

alter table public.scans enable row level security;

create policy "Anyone can insert scans."
  on scans for insert
  with check ( true );

create policy "Users can view scans of their pets."
  on scans for select
  using ( exists ( select 1 from pets where pets.id = scans.pet_id and pets.owner_id = auth.uid() ) );

-- ORDERS TABLE
create type order_status as enum ('pending', 'paid', 'shipped');

create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  pet_id uuid references public.pets(id),
  collar_text text,
  color text,
  size text,
  status order_status default 'pending',
  created_at timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Users can view their own orders."
  on orders for select
  using ( auth.uid() = user_id );

create policy "Users can create orders."
  on orders for insert
  with check ( auth.uid() = user_id );

-- TRIGGERS to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

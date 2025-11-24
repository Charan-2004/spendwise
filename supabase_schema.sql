-- Create profiles table
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  monthly_income numeric,
  currency text default 'USD'
);

-- Create expenses table
create table expenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  amount numeric not null,
  category text not null,
  date date not null,
  is_recurring boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create goals table
create table goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  target_amount numeric not null,
  current_amount numeric default 0,
  deadline date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table expenses enable row level security;
alter table goals enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

create policy "Users can view their own expenses." on expenses for select using ( auth.uid() = user_id );
create policy "Users can insert their own expenses." on expenses for insert with check ( auth.uid() = user_id );
create policy "Users can update their own expenses." on expenses for update using ( auth.uid() = user_id );
create policy "Users can delete their own expenses." on expenses for delete using ( auth.uid() = user_id );

create policy "Users can view their own goals." on goals for select using ( auth.uid() = user_id );
create policy "Users can insert their own goals." on goals for insert with check ( auth.uid() = user_id );
create policy "Users can update their own goals." on goals for update using ( auth.uid() = user_id );
create policy "Users can delete their own goals." on goals for delete using ( auth.uid() = user_id );

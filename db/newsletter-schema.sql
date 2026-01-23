create table if not exists newsletter_subscription (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  ip_hash text,
  user_agent_hash text
);

create index if not exists newsletter_subscription_email_idx on newsletter_subscription (email);
create index if not exists newsletter_subscription_created_idx on newsletter_subscription (created_at desc);

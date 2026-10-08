alter table public.partner_inquiries
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists marketing_consent_at timestamptz;

comment on column public.partner_inquiries.marketing_consent is
  'Optional consent to receive Flat Reality Partners opportunity marketing. False by default.';

comment on column public.partner_inquiries.marketing_consent_at is
  'Server-recorded time at which optional marketing consent was submitted.';

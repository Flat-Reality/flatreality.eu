alter table public.partner_inquiries
  add column if not exists inquiry_type text not null default 'outsourcing',
  add column if not exists retainer_configuration jsonb not null default '{}'::jsonb;

alter table public.partner_inquiries
  drop constraint if exists partner_inquiries_inquiry_type_check,
  add constraint partner_inquiries_inquiry_type_check
    check (inquiry_type in ('outsourcing', 'retainer_plus')),
  drop constraint if exists partner_inquiries_retainer_configuration_check,
  add constraint partner_inquiries_retainer_configuration_check
    check (jsonb_typeof(retainer_configuration) = 'object'),
  drop constraint if exists partner_inquiries_selected_services_check,
  add constraint partner_inquiries_selected_services_check
    check (cardinality(selected_services) between 1 and 20);

create index if not exists partner_inquiries_type_status_idx
  on public.partner_inquiries (inquiry_type, status, created_at desc);

comment on column public.partner_inquiries.inquiry_type is
  'Submission product discriminator. Current values: outsourcing and retainer_plus.';

comment on column public.partner_inquiries.retainer_configuration is
  'Structured Retainer Plus configuration. Empty for ordinary outsourcing inquiries.';

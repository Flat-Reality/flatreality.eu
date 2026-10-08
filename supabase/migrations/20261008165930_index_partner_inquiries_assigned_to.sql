create index if not exists partner_inquiries_assigned_to_idx
  on public.partner_inquiries (assigned_to)
  where assigned_to is not null;

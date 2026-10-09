# Retainer Plus ↔ FR Workspace integration handoff

## Current website implementation

Public product route:

- `/partners/outsourcing/retainer-plus/`
- Source: `src/retainer-plus.js`
- Catalogue/configuration contract: `src/retainer-plus-data.js`

Private inquiry route:

- `/partners/outsourcing/retainer-plus/new-inquiry/`
- Source: `src/retainer-inquiry.js`
- Local draft/contact profile: `src/retainer-plus-store.js`

Submission backend:

- Supabase Edge Function: `supabase/functions/partners-inquiry/index.ts`
- Database migration: `supabase/migrations/20261009094531_add_retainer_plus_inquiries.sql`
- Table: `public.partner_inquiries`
- Product discriminator: `inquiry_type = 'retainer_plus'`
- Structured payload: `retainer_configuration jsonb`

The website does not publish names, biographies, headcount, rates, or internal staffing data. Public availability is `unknown` and no availability badge is rendered until Workspace provides confirmed data.

## Website catalogue contract

Each published catalogue item has this shape:

```ts
type RetainerOffering = {
  id: string
  type: 'specialist' | 'team' | 'capacity'
  category:
    | 'Art'
    | 'Programming'
    | 'Game Design & Narrative'
    | 'Sound & Music'
    | 'Production'
    | 'Inclusive Design & Accessibility'
  title: string
  description: string
  tags: string[]
  roles?: string[]
  published?: boolean
  availability: 'unknown' | 'available' | 'unavailable'
}
```

Only `available` may produce the public `Immediate` badge. `unknown` must be the default. `unavailable` must not expose Busy/Unavailable publicly; the offer remains requestable without a badge.

## Inquiry configuration contract

`partner_inquiries.retainer_configuration` stores:

```ts
type RetainerInquiryConfiguration = {
  mode: 'quick' | 'custom'
  offering_ids: string[]
  offering_quantities: Record<string, number> // Specialists only, integer 1–10
  experience_levels: Record<string, 'junior' | 'middle' | 'senior' | 'lead' | 'auto'>
  engagement_model: 'dedicated-specialist' | 'production-team' | 'flexible-capacity'
  monthly_capacity: '20 hours / month' | '40 hours / month' | '80 hours / month' | '160 hours / month' | 'Custom'
  custom_monthly_capacity: string
  duration: '1 month' | '3 months' | '6 months' | 'Custom'
  custom_duration: string
  preferred_start: 'As Soon As Possible' | 'Within a Month' | 'Flexible / Not Sure Yet' | 'Specific Date'
  specific_start_date: string // YYYY-MM-DD or empty
}
```

`auto` is displayed to the customer as `Let us decide!` and `?`. It means Flat Reality should recommend seniority during review; it does not mean an unknown or missing value.

`offering_quantities` applies only to `specialist` offers. Team and Capacity offers do not expose a quantity selector. Workspace should treat quantity as a requested number of specialists, subject to review and availability; it is not a confirmed allocation.

## What the Workspace code agent must create

1. A Retainer Plus administration area available only to the existing authorised Workspace groups.
2. A catalogue manager for the public fields in `RetainerOffering` above. Keep internal staffing separately; never send private HR records to the public website.
3. An inquiry queue filtered by `inquiry_type = 'retainer_plus'`, showing contact data, project description, configuration, consent state, reference, status and assignment.
4. Idempotent status/assignment updates against the existing `partner_inquiries` row. Do not create duplicate inquiries during synchronisation.
5. A public availability projection with only `offering_id`, `availability`, `checked_at`, and optionally `reason_code`. It must aggregate real staffing data conservatively:
   - Specialist: `available` only when at least one suitable profile is genuinely assignable.
   - Team: `available` only when the required role configuration is feasible, not when one role is free.
   - Capacity: `available` only when the requested delivery model has confirmed reservable capacity.
6. An authenticated server-to-server adapter (Edge Function or Workspace backend) that publishes the safe projection. Never expose Graph credentials, Supabase secret keys, employee identity, salary, workload, or calendar data to the browser.
7. Audit events for catalogue publish/unpublish, availability changes, inquiry status changes and assignment changes.

## Recommended ownership boundary

- Workspace remains the source of truth for people, skills, capacity, assignment and internal rate cards.
- The website remains the source of truth for public copy, public catalogue presentation and customer inquiry submission.
- Supabase `partner_inquiries` is the shared intake queue.
- A future public table/view should contain only approved catalogue and availability projection fields and should use RLS/least-privilege grants.

## Admin and rates

No public rate is stored or displayed. If Workspace adds rates, keep them in a private schema/table and expose them only to authorised admin roles. Website quotations remain individual. A future admin view can use rate data to prepare proposals, but the public API must never return it.

## Next-agent implementation prompt

> Connect FR Workspace to the existing Flat Reality website Retainer Plus implementation. Read `docs/retainer-plus-workspace-integration-handoff.md`, `src/retainer-plus-data.js`, `src/retainer-inquiry.js`, `supabase/functions/partners-inquiry/index.ts`, and migration `20261009094531_add_retainer_plus_inquiries.sql`. Implement a Workspace Retainer Plus catalogue and inquiry queue using the existing Entra group authorization. Workspace must be the private source of truth for staffing and rates. Publish only the safe `RetainerOffering` fields and the conservative availability projection described in the handoff. Treat `tid + oid` as the stable Microsoft identity key, keep sync idempotent, add audit logs, and verify with a real end-to-end test. Do not expose private HR data, Graph credentials, service keys, internal rates, workloads, or employee identities to the public website.

## Acceptance checks for Workspace integration

- A newly submitted Retainer Plus inquiry appears once in Workspace with its reference and complete configuration.
- `auto` experience level is preserved and labelled `Let us decide!`.
- Refresh/re-sync does not duplicate an inquiry or assignment.
- An unavailable/unknown staffing situation never becomes an `Immediate` public promise.
- Removing an employee or changing private staffing data does not leak identity/history to the public API.
- Entra Administration and Operations permissions are enforced server-side.
- Every change has an actor, timestamp and correlation/reference ID in logs.

# Domain (Layer 3 reference)

## Glossary
| Term | Meaning |
|------|---------|
| User | A person who can log in. Row in `auth.users` + `profiles`. Has roles. |
| Worker | A person the company pays. Row in `workers`. Not always a user. |
| Login account | The user linked to a worker through `workers.user_id`. |
| Employee | A worker with `worker_type = 'employee'`. Paid a monthly salary. |
| Contractor | A worker with `worker_type = 'contractor'`. Paid an hourly rate. Can have a company and a contract end date. |
| Payroll period | A pay window. Two per month (bi-monthly). |

## Worker fields
- All workers: first name, last name, email (unique), job title, department (optional), start date, status (`active` | `inactive`).
- Employee only: `monthly_salary` (required).
- Contractor only: `hourly_rate` (required), `company_name` (optional), `contract_end_date` (optional, not before the start date).
- The `workers_type_fields` check constraint enforces these rules in the database.
- Workers are not deleted. Set the status to `inactive`.

## Worker ↔ user link
- A worker has zero or one login account. A user is linked to zero or one worker (`workers.user_id` is unique).
- Users can exist without a worker (for example `admin`). Workers can exist without a login.
- A new login made from a worker uses the worker's email and full name and gets the `employee` role.
- Unlink removes only the link. The user account stays. If the profile is deleted, the link is cleared.
- A linked user sees their own record at `/me` (`self:read`).
- An `inactive` worker can still sign in (POC limit).

## Payroll period rule (bi-monthly)
- Half 1: day 1 to day 15 of the month.
- Half 2: day 16 to the last day of the month (28, 29, 30 or 31).
- One period per `(year, month, half)`. Generate for one month (2 periods) or one year (24 periods).
  Generation skips periods that already exist.
- Status: `open` or `closed`. A closed period can be reopened (POC).
- The rule lives in `packages/shared/src/payroll/periods.ts` and is mirrored by the
  `payroll_periods_dates` check constraint. Change both together.

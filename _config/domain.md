# Domain (Layer 3 reference)

## Glossary
| Term | Meaning |
|------|---------|
| User | A person who can log in. Row in `auth.users` + `profiles`. Has roles. |
| Worker | A person the company pays. Row in `workers`. Not always a user. |
| Employee | A worker with `worker_type = 'employee'`. Paid a monthly salary. |
| Contractor | A worker with `worker_type = 'contractor'`. Paid an hourly rate. Can have a company and a contract end date. |
| Payroll period | A pay window. Two per month (bi-monthly). |

## Worker fields
- All workers: first name, last name, email (unique), job title, department (optional), start date, status (`active` | `inactive`).
- Employee only: `monthly_salary` (required).
- Contractor only: `hourly_rate` (required), `company_name` (optional), `contract_end_date` (optional, not before the start date).
- The `workers_type_fields` check constraint enforces these rules in the database.
- Workers are not deleted. Set the status to `inactive`.

## Payroll period rule (bi-monthly)
- Half 1: day 1 to day 15 of the month.
- Half 2: day 16 to the last day of the month (28, 29, 30 or 31).
- One period per `(year, month, half)`. Generate for one month (2 periods) or one year (24 periods).
  Generation skips periods that already exist.
- Status: `open` or `closed`. A closed period can be reopened (POC).
- The rule lives in `packages/shared/src/payroll/periods.ts` and is mirrored by the
  `payroll_periods_dates` check constraint. Change both together.

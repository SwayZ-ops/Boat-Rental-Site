# Database setup

These files prepare the database for future PHP integration. The current
website continues to use browser localStorage.

## New installation

1. Start **Apache** and **MySQL** in XAMPP.
2. Open **http://localhost/phpmyadmin/**.
3. Choose **Import**, then select `database/it37project.sql`.
4. Keep the format as SQL and click **Import/Go**.
5. Open `it37project` in the left sidebar to see its tables.

Use a new or empty database. The script explicitly creates and selects
`it37project`. If that database already contains tables, do not import this
file over them. To use another database name, change it in both the
`CREATE DATABASE` and `USE` statements before importing.

The script does not drop tables or insert records. Do not import it twice.
It uses InnoDB, foreign keys, check constraints, and utf8mb4, and targets
the MariaDB included in XAMPP. It has not been imported or tested in this task.

## Already imported the earlier corrected it37project.sql?

If you previously imported the corrected schema supplied with this project
(with `boat`, `boat_type`, and `booking.createdByStaffID`), export a backup
first. Select that database in phpMyAdmin and import
`upgrade-admin-features.sql` **once**. This adds the newer staff-assignment,
staff-status/job-title, and payment-reference fields without deleting records.

Do not use the upgrade against the original `yacht`/`yacht_type` schema.
Do not run the upgrade after importing the new complete schema: the complete
schema already contains those fields.

The complete schema now stores daily prices. If you imported an earlier
hourly-price version of the corrected schema, first apply
`upgrade-admin-features.sql` if you have not already, then apply
`upgrade-daily-rates.sql` once. The migration renames the hourly-rate columns;
it does not multiply existing values or recalculate saved booking totals.
Review existing boat prices because they will be treated as per-day amounts.

## Tables

| Table | Purpose |
| --- | --- |
| `customer` | Clients and optional future customer login |
| `staff` | Admin/staff accounts, job titles, and active/inactive status |
| `boat_type` | Boat categories |
| `boat` | Resources, capacity, daily price, status, and image path |
| `booking` | Client/boat links, creator, assigned staff, rental dates, prices, and cancellation |
| `payment` | Booking-linked receipts, amount, method, reference, and recorded date |

`createdByStaffID` records the account that created a booking.
`assignedStaffID` records the person assigned to the rental.
`cancelledByStaffID` records who cancelled it. These are different roles.
The nullable assigned-staff field preserves compatibility with earlier rows;
future booking code should require a valid assignment for new bookings.

`staffRole` is the account role (`admin` or `staff`). `staffJobTitle` stores
descriptive work roles such as Captain. Adding database accounts will require
PHP `password_hash()` values; the SQL does not seed the demonstration logins.

## What remains for database integration

- Add a local PHP connection using the actual MySQL host, username, password,
  and database name. No private credentials are included in this repository.
- Replace localStorage reads/writes with server requests and prepared SQL queries.
- Implement server-side login, role checks, and booking-conflict validation.
- Map browser UUIDs to database integer IDs when migrating existing records.
- Split full names into the schema's first/last name fields and provide database
  fields that are not collected by the prototype forms, such as boat location.
- Save uploaded images as files and store their paths in `boatImage`; browser
  data URLs are not suitable for that VARCHAR column.
- Capture `dailyRateAtBooking` when a booking is created; do not derive an old
  booking's agreed rate from a boat's later edited price.
- Translate UI statuses consistently to the database representation.

Browser records and live database contents are not included in this repository.

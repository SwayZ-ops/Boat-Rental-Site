# Boat Rental Site

A boat rental management prototype for XAMPP, with administrator and staff views.

## Run the site

1. Download or clone this repository into `C:\xampp\htdocs\IT37`.
2. Open the XAMPP Control Panel and start **Apache**.
3. Open **http://localhost/IT37/** in your browser.

If you use a different folder name under `htdocs`, use that name in the URL.
No npm install, Composer install, or build step is needed.

### Demo login

| Role | Username | Password |
| --- | --- | --- |
| Administrator | `admin123` | `admin123` |
| Staff | `staff123` | `staff123` |

Login is a JavaScript demonstration: the role is selected through the URL.
There are no PHP sessions or server-side authentication checks yet. Staff
records added inside the site do not create login accounts.

## Features

- Dashboard with resource, availability, booking, and pending-payment counts.
- Add, edit, and remove boats, including optional images, from the administrator view.
- Set a per-day boat rate; each calendar day between departure and return is charged as one day.
- Prevent removal of boats or staff assigned to upcoming bookings.
- Boat-card selection for staff bookings.
- Client and staff management, with booking dropdowns using saved records.
- Booking capacity checks and boat/staff date-conflict checks.
- Cancellation history recording the selected staff member or administrator.
- Payment recording, partial payments, and outstanding balances.
- Admin and staff reports with daily, weekly, monthly, yearly, and custom date ranges.
- Payment history reports with one row per receipt, including repeated partial payments, payment date, method, and reference.
- Daily availability overview.
- Booking reports, filtered by departure dates, resource, client, and payment status, with browser printing.
- Payment history reports, filtered by payment date, resource, client, and booking payment status.

## Where records are saved

**The current site stores records in browser localStorage, not MySQL.**
The storage key is `boatRental.sharedRecords.v1`. Resources, clients, staff,
bookings, payments, and uploaded boat images are saved in that browser profile.

- Refreshing the page normally preserves saved records.
- Admin and staff in the same browser profile and origin share the records.
- Another browser, computer, host name, or port uses different storage.
- Clearing site data removes the browser records.
- GitHub receives the code and empty SQL schema, not your browser records.

The My Account form is still a layout-only form. Payment recording does not
charge cards or connect to payment providers. Cancellation does not issue refunds.

## Database files

The `database` folder contains the SQL schema prepared for later PHP/MySQL
integration. It includes no customer records, staff accounts, or sample data.

See [database setup](database/README.md) before importing. Importing the SQL
creates the tables; it does **not** connect the current pages to those tables
or transfer localStorage records into them.

## Project structure

```text
IT37/
├── index.php                       Login screen
├── main.php                        Shared admin/staff layout
├── main.js                         UI behavior and browser storage
├── styles.css                      Shared styles and print layout
├── assets/
│   └── boat-logo.png               Site logo
├── database/
│   ├── it37project.sql             Complete schema for a new database
│   ├── upgrade-admin-features.sql  Upgrade for the earlier corrected schema
│   └── README.md                   Database import instructions
└── docs/
    └── Boat-Rental-Code-Guide.pdf  Detailed explanation of the current code
```

The `.php` pages currently contain HTML. JavaScript handles the interactive
features. MySQL is optional for running this prototype and is required only
when importing or inspecting the supplied database schema.

## Deployment

Run locally through XAMPP/Apache or another PHP-capable server. GitHub stores
the project; GitHub Pages does not execute `.php` files.

Application tests and database imports were not run for this upload, as requested.

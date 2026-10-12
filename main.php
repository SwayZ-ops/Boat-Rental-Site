<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <title>Dashboard | Boat Rental</title>

        <link rel="stylesheet" href="styles.css">
        <script src="main.js" defer></script>
    </head>

    <body>
        <div class="admin-layout">
            <!-- Sidebar -->
            <aside class="sidebar" id="sidebar">
                <div class="brand">
                    <img class="brand-logo" src="assets/boat-logo.png" alt="Boat Rental speedboat logo" width="56" height="40">

                    <div class="brand-text">
                        <h2>BOAT RENTAL</h2>
                        <span>Management Portal</span>
                    </div>
                </div>

                <nav class="navigation" aria-label="Main navigation">
                    <div class="nav-group">
                        <p class="nav-label">OVERVIEW</p>
                        <a href="#dashboard" class="nav-item active" aria-current="page">
                            <span class="nav-icon" aria-hidden="true">◫</span>
                            Dashboard
                        </a>
                    </div>

                    <div class="nav-group">
                        <p class="nav-label">MANAGEMENT</p>
                        <a href="#resources" class="nav-item">
                            <span class="nav-icon" aria-hidden="true">◇</span>
                            Resources
                        </a>
                        <a href="#bookings" class="nav-item">
                            <span class="nav-icon" aria-hidden="true">□</span>
                            Bookings
                        </a>
                        <a href="#availability" class="nav-item">
                            <span class="nav-icon" aria-hidden="true">◷</span>
                            Availability
                        </a>
                        <a href="#payments" class="nav-item">
                            <span class="nav-icon" aria-hidden="true">₱</span>
                            Payments
                        </a>
                    </div>

                    <div class="nav-group">
                        <p class="nav-label">PEOPLE</p>
                        <a href="#clients" class="nav-item">
                            <span class="nav-icon" aria-hidden="true">○</span>
                            Clients
                        </a>
                        <a href="#staff" class="nav-item">
                            <span class="nav-icon" aria-hidden="true">◎</span>
                            Staff
                        </a>
                    </div>

                    <div class="nav-group">
                        <p class="nav-label">INSIGHTS</p>
                        <a href="#reports" class="nav-item">
                            <span class="nav-icon" aria-hidden="true">▥</span>
                            Reports
                        </a>
                    </div>
                </nav>

                <div class="sidebar-footer">
                    <a href="#account" class="nav-item">
                        <span class="nav-icon" aria-hidden="true">⚙</span>
                        My Account
                    </a>
                    <a href="index.php" class="nav-item">
                        <span class="nav-icon" aria-hidden="true">↗</span>
                        Logout
                    </a>
                </div>
            </aside>

            <main class="main-content">
                <header class="topbar">
                    <div class="topbar-heading">
                        <button id="menu-button" class="menu-button" type="button" aria-controls="sidebar" aria-expanded="false" aria-label="Toggle navigation">
                            ☰
                        </button>

                        <div>
                            <p class="eyebrow" id="portal-label">ADMINISTRATION</p>
                            <h1 id="page-title">Dashboard</h1>
                        </div>
                    </div>

                    <a class="profile" href="#account">
                        <div class="profile-info">
                            <strong id="profile-name">Administrator</strong>
                            <span id="profile-role">Admin</span>
                        </div>
                        <div class="profile-avatar" id="profile-letter">A</div>
                    </a>
                </header>

                <div class="page-content">
                    <!-- Dashboard -->
                    <section id="dashboard" class="screen" data-title="Dashboard">
                        <div class="dashboard-hero">
                            <div>
                                <p class="eyebrow">BOAT RENTAL MANAGEMENT</p>
                                <h2>Good day,<br><span id="welcome-name">Administrator.</span></h2>
                                <p class="hero-description">Manage your fleet, reservations, clients and rental operations from one workspace.</p>
                            </div>

                            <div class="hero-graphic" aria-hidden="true">
                                <div class="boat-shape boat-shape-one"></div>
                                <div class="boat-shape boat-shape-two"></div>
                            </div>
                        </div>

                        <div class="summary-grid">
                            <a class="summary-card" href="#resources">
                                <span class="eyebrow">TOTAL RESOURCES</span>
                                <span class="summary-value">—</span>
                                <span class="muted">Fleet inventory →</span>
                            </a>
                            <a class="summary-card" href="#availability">
                                <span class="eyebrow">AVAILABLE</span>
                                <span class="summary-value">—</span>
                                <span class="muted">View schedule →</span>
                            </a>
                            <a class="summary-card" href="#bookings">
                                <span class="eyebrow">BOOKINGS</span>
                                <span class="summary-value">—</span>
                                <span class="muted">View reservations →</span>
                            </a>
                            <a class="summary-card accent-card" href="#payments">
                                <span class="eyebrow">PENDING PAYMENTS</span>
                                <span class="summary-value">—</span>
                                <span class="muted">View payments →</span>
                            </a>
                        </div>

                        <div class="dashboard-grid">
                            <div class="panel">
                                <div class="panel-header">
                                    <div>
                                        <p class="eyebrow">RESERVATIONS</p>
                                        <h3>Upcoming Bookings</h3>
                                    </div>
                                    <a class="text-button" href="#bookings">View all →</a>
                                </div>

                                <div class="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Booking</th>
                                                <th>Client</th>
                                                <th>Resource</th>
                                                <th>Date</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td colspan="5" class="empty-state">Bookings will appear here.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <aside class="quick-panel">
                                <p class="eyebrow">QUICK ACTIONS</p>
                                <h2>Keep things<br>moving.</h2>
                                <div class="quick-links">
                                    <button type="button" data-form="bookings">New booking <span>→</span></button>
                                    <button type="button" data-form="resources" data-admin-only>Add resource <span>→</span></button>
                                    <a href="#payments">View payments <span>→</span></a>
                                    <a href="#reports">View reports <span>→</span></a>
                                </div>
                            </aside>
                        </div>
                    </section>

                    <!-- Resources -->
                    <section id="resources" class="screen" data-title="Resources" hidden>
                        <div class="section-header">
                            <div>
                                <p class="eyebrow">THE FLEET</p>
                                <h2>Resources</h2>
                            </div>
                            <button class="primary-button" type="button" data-form="resources" data-admin-only>+ Add resource</button>
                        </div>

                        <div class="panel">
                            <div class="list-toolbar">
                                <label>Search resources<input type="search" data-search placeholder="Resource name…"></label>
                                <label>
                                    Status
                                    <select data-filter>
                                        <option value="all">All statuses</option>
                                        <option>Available</option>
                                        <option>Booked</option>
                                        <option>Maintenance</option>
                                        <option>Inactive</option>
                                    </select>
                                </label>
                            </div>
                            <div class="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Resource</th>
                                            <th>Type</th>
                                            <th>Capacity</th>
                                            <th>Rate</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td colspan="6" class="empty-state" data-empty>No resources to display.</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    <!-- Bookings -->
                    <section id="bookings" class="screen" data-title="Bookings" hidden>
                        <div class="section-header">
                            <div>
                                <p class="eyebrow">RESERVATIONS</p>
                                <h2>Bookings</h2>
                            </div>
                            <button class="primary-button" type="button" data-form="bookings">+ New booking</button>
                        </div>

                        <div class="panel">
                            <div class="list-toolbar">
                                <label>Search bookings<input type="search" data-search placeholder="Booking or client…"></label>
                                <label>
                                    Status
                                    <select data-filter>
                                        <option value="all">All statuses</option>
                                        <option>Pending</option>
                                        <option>Confirmed</option>
                                        <option>Completed</option>
                                        <option>Cancelled</option>
                                    </select>
                                </label>
                            </div>
                            <div class="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Booking</th>
                                            <th>Client</th>
                                            <th>Resource</th>
                                            <th>Rental Date</th>
                                            <th>Status</th>
                                            <th>Booked By</th>
                                            <th>Assigned Staff</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td colspan="8" class="empty-state" data-empty>No bookings to display.</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    <section id="choose-boat" class="screen" data-title="Book a boat" hidden>
                        <div class="section-header">
                            <div>
                                <p class="eyebrow">EXPLORE THE FLEET</p>
                                <h2>Choose your boat</h2>
                            </div>
                            <a class="secondary-button" href="#bookings">View bookings →</a>
                        </div>

                        <div class="boat-catalog">
                            <aside class="boat-filters" aria-label="Filter boats">
                                <label>Search boats<input id="boat-search" type="search" placeholder="Boat name…"></label>
                                <label>Boat type<select id="boat-type"><option value="">All types</option></select></label>
                                <label>
                                    Capacity
                                    <select id="boat-capacity">
                                        <option value="0">Any capacity</option>
                                        <option value="2">2 or more guests</option>
                                        <option value="5">5 or more guests</option>
                                        <option value="10">10 or more guests</option>
                                        <option value="20">20 or more guests</option>
                                    </select>
                                </label>
                                <label>
                                    Fleet status
                                    <select id="boat-status">
                                        <option value="all">All boats</option>
                                        <option value="Available">Open for bookings</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </label>
                                <button class="text-button" id="reset-boat-filters" type="button">Clear filters</button>
                            </aside>

                            <div class="boat-results">
                                <p class="boat-results-count" id="boat-results-count" role="status"></p>
                                <div class="boat-card-grid" id="boat-card-grid"></div>
                            </div>
                        </div>
                    </section>

                    <!-- Availability -->
                    <section id="availability" class="screen" data-title="Availability" hidden>
                        <div class="section-header">
                            <div>
                                <p class="eyebrow">SCHEDULE</p>
                                <h2>Availability</h2>
                            </div>
                            <button class="primary-button" type="button" data-form="bookings">New booking →</button>
                        </div>

                        <div class="panel">
                            <div class="date-toolbar">
                                <button class="secondary-button" id="previous-day" type="button" aria-label="Previous day">←</button>
                                <label>Select date<input id="schedule-date" type="date"></label>
                                <button class="secondary-button" id="next-day" type="button" aria-label="Next day">→</button>
                                <button class="text-button" id="today-button" type="button">Today</button>
                            </div>
                            <h3 id="schedule-heading">Daily schedule</h3>
                            <div class="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Resource</th>
                                            <th>Morning</th>
                                            <th>Afternoon</th>
                                            <th>Evening</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td colspan="4" class="empty-state">No scheduled resources to display.</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    <!-- Payments -->
                    <section id="payments" class="screen" data-title="Payments" hidden>
                        <div class="section-header">
                            <div>
                                <p class="eyebrow">PAYMENTS</p>
                                <h2>Payment Overview</h2>
                            </div>
                            <button class="primary-button" type="button" data-form="payments">+ Record payment</button>
                        </div>

                        <div class="panel">
                            <div class="list-toolbar">
                                <label>Search payments<input type="search" data-search placeholder="Booking or reference…"></label>
                                <label>
                                    Status
                                    <select data-filter>
                                        <option value="all">All statuses</option>
                                        <option>Paid</option>
                                        <option>Unpaid</option>
                                        <option>Partial</option>
                                        <option>Cancelled</option>
                                    </select>
                                </label>
                            </div>
                            <div class="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Booking</th>
                                            <th>Client</th>
                                            <th>Amount</th>
                                            <th>Method</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td colspan="5" class="empty-state" data-empty>No payments to display.</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    <!-- Clients -->
                    <section id="clients" class="screen" data-title="Clients" hidden>
                        <div class="section-header">
                            <div>
                                <p class="eyebrow">PEOPLE</p>
                                <h2>Clients</h2>
                            </div>
                            <button class="primary-button" type="button" data-form="clients">+ Add client</button>
                        </div>

                        <div class="panel">
                            <div class="list-toolbar">
                                <label>Search clients<input type="search" data-search placeholder="Name or contact…"></label>
                            </div>
                            <div class="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Client</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Bookings</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td colspan="4" class="empty-state" data-empty>No clients to display.</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    <!-- Staff -->
                    <section id="staff" class="screen" data-title="Staff" hidden>
                        <div class="section-header">
                            <div>
                                <p class="eyebrow">PEOPLE</p>
                                <h2>Staff</h2>
                            </div>
                            <button class="primary-button" type="button" data-form="staff">+ Add staff member</button>
                        </div>

                        <div class="panel">
                            <div class="list-toolbar">
                                <label>Search staff<input type="search" data-search placeholder="Name or role…"></label>
                                <label>
                                    Status
                                    <select data-filter>
                                        <option value="all">All statuses</option>
                                        <option>Active</option>
                                        <option>Inactive</option>
                                    </select>
                                </label>
                            </div>
                            <div class="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Staff Member</th>
                                            <th>Role</th>
                                            <th>Phone</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td colspan="5" class="empty-state" data-empty>No staff to display.</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    <!-- Reports -->
                    <section id="reports" class="screen" data-title="Reports" hidden>
                        <div class="section-header">
                            <div>
                                <p class="eyebrow">INSIGHTS</p>
                                <h2>Reports</h2>
                            </div>
                            <button class="primary-button" id="print-button" type="button" disabled>Print report</button>
                        </div>

                        <div class="panel report-controls">
                            <form id="report-form" class="date-toolbar">
                                <label>Departure from<input id="report-from" type="date" required></label>
                                <label>Departure to<input id="report-to" type="date" required></label>
                                <label>Resource<select id="report-resource"><option value="">All resources</option></select></label>
                                <label>Client<select id="report-client"><option value="">All clients</option></select></label>
                                <label>
                                    Payment status
                                    <select id="report-payment-status">
                                        <option value="all">All payment statuses</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Partial">Partially paid</option>
                                        <option value="Unpaid">Unpaid</option>
                                        <option value="Cancelled">Cancelled bookings</option>
                                    </select>
                                </label>
                                <button class="primary-button" type="submit">Generate report</button>
                            </form>
                        </div>

                        <p id="report-period" class="report-period" role="status"></p>

                        <div id="report-results" hidden>
                            <div class="summary-grid">
                                <article class="summary-card">
                                    <p class="eyebrow">BOOKINGS</p>
                                    <div class="summary-value" id="report-booking-count">0</div>
                                </article>
                                <article class="summary-card">
                                    <p class="eyebrow">BOOKED VALUE</p>
                                    <div class="summary-value" id="report-booked-value">₱0.00</div>
                                    <span class="muted">Excludes cancelled bookings</span>
                                </article>
                                <article class="summary-card">
                                    <p class="eyebrow">TOTAL PAID</p>
                                    <div class="summary-value" id="report-payments">₱0.00</div>
                                    <span class="muted">All payments for these rentals</span>
                                </article>
                                <article class="summary-card">
                                    <p class="eyebrow">TOTAL TO BE PAID</p>
                                    <div class="summary-value" id="report-outstanding">₱0.00</div>
                                    <span class="muted">Excludes cancelled bookings</span>
                                </article>
                            </div>

                            <div class="panel">
                                <h3 id="report-table-title">Bookings and Payments</h3>
                                <div class="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Booking / Client</th>
                                                <th>Boat / Staff</th>
                                                <th>Rental dates</th>
                                                <th>Payment status</th>
                                                <th>Rental total</th>
                                                <th>Total paid</th>
                                                <th>To be paid</th>
                                                <th>Payment methods / cancellation</th>
                                            </tr>
                                        </thead>
                                        <tbody id="report-bookings"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Account -->
                    <section id="account" class="screen" data-title="My Account" hidden>
                        <div class="section-header">
                            <div>
                                <p class="eyebrow">ACCOUNT</p>
                                <h2>My Account</h2>
                            </div>
                        </div>

                        <div class="panel account-panel">
                            <form id="account-form">
                                <div class="form-grid">
                                    <label>Display name<input type="text" placeholder="Administrator"></label>
                                    <label>Username<input type="text" placeholder="Username"></label>
                                </div>
                                <div class="form-actions">
                                    <button class="primary-button" type="submit">Done</button>
                                    <a class="secondary-button" href="index.php">Back to login</a>
                                </div>
                            </form>
                        </div>
                    </section>

                    <footer class="page-footer">
                        <span>BOAT RENTAL / MANAGEMENT PORTAL</span>
                        <span id="portal-footer">ADMIN PORTAL</span>
                    </footer>
                </div>
            </main>
        </div>

        <!-- Reusable pop-up for the Add / New buttons. -->
        <dialog id="record-dialog" aria-labelledby="dialog-title">
            <div class="panel-header">
                <h3 id="dialog-title">New record</h3>
                <button class="close-button" type="button" data-close-dialog aria-label="Close form">×</button>
            </div>

            <p class="error-message" id="dialog-error" role="alert" hidden></p>

            <form id="preview-form">
                <div class="form-grid" id="dialog-fields"></div>
                <div class="form-actions">
                    <button class="primary-button" id="dialog-save" type="submit">Done</button>
                    <button class="secondary-button" type="button" data-close-dialog>Cancel</button>
                </div>
            </form>
        </dialog>

        <dialog id="cancel-dialog" aria-labelledby="cancel-title">
            <div class="panel-header">
                <h3 id="cancel-title">Cancel booking</h3>
                <button class="close-button" type="button" data-close-cancel aria-label="Close cancellation">×</button>
            </div>
            <p id="cancel-booking-label" class="report-period"></p>
            <p class="error-message" id="cancel-error" role="alert" hidden></p>
            <form id="cancel-form">
                <label>Cancelled by<select id="cancelled-by" required></select></label>
                <div class="form-actions">
                    <button class="primary-button" type="submit">Confirm cancellation</button>
                    <button class="secondary-button" type="button" data-close-cancel>Keep booking</button>
                </div>
            </form>
        </dialog>

        <div class="toast" id="toast" role="status" hidden></div>
    </body>
</html>

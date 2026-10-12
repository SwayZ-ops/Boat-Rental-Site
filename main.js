'use strict';

// The login below is a front-end demo: changing this URL role controls the visible workspace, not server security.
const portalRole = new URLSearchParams(window.location.search).get('role') === 'staff'
    ? 'staff'
    : 'admin';
// Reuse this Boolean for actions that only the administrator should see or run.
const isStaff = portalRole === 'staff';
// Admin and staff pages share one browser record set through this localStorage key.
const storageKey = 'boatRental.sharedRecords.v1';
// This element only exists on index.php, so login code is enabled only on that page.
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        // Read the current form values; trim accidental spaces from the username only.
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        // The error paragraph is hidden until a credential pair fails to match.
        const error = document.getElementById('login-error');

        if (username === 'admin123' && password === 'admin123') {
            window.location.href = 'main.php?role=admin';
        } else if (username === 'staff123' && password === 'staff123') {
            window.location.href = 'main.php?role=staff';
        } else {
            error.textContent = 'Incorrect username or password.';
            error.hidden = false;
        }
    });

    document.getElementById('show-password').addEventListener('change', function () {
        document.getElementById('password').type = this.checked ? 'text' : 'password';
    });
}

// These shared page elements are looked up once because navigation uses them repeatedly.
const screens = document.querySelectorAll('.screen');
const sidebar = document.getElementById('sidebar');
const menuButton = document.getElementById('menu-button');

// Close the mobile sidebar and keep its accessibility state in sync with its appearance.
function closeMenu() {
    if (sidebar) {
        sidebar.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
    }
}

// Read the URL hash, show its matching screen, then update the title and selected sidebar link.
function showScreen() {
    // The hash is the section name, such as #clients; use Dashboard when none is supplied.
    const requestedId = window.location.hash.slice(1) || 'dashboard';
    // Find the requested section, falling back to Dashboard if the hash is unknown.
    const selected = Array.from(screens).find(function (screen) {
        return screen.id === requestedId;
    }) || document.getElementById('dashboard');

    screens.forEach(function (screen) {
        // Only one screen is visible; the rest stay in the page but are hidden.
        screen.hidden = screen !== selected;
    });

    document.getElementById('page-title').textContent = selected.dataset.title;
    document.title = selected.dataset.title + ' | Boat Rental';

    document.querySelectorAll('.nav-item[href^="#"]').forEach(function (link) {
        // The boat picker is visually part of the booking flow, so highlight Bookings in the sidebar.
        const active = link.getAttribute('href') === '#' + (selected.id === 'choose-boat' ? 'bookings' : selected.id);
        link.classList.toggle('active', active);

        if (active) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });

    closeMenu();
    window.scrollTo(0, 0);
}

if (screens.length) {
    // Navigation is registered only on main.php, which contains the screen elements.
    showScreen();
    window.addEventListener('hashchange', showScreen);

    menuButton.addEventListener('click', function () {
        const open = sidebar.classList.toggle('is-open');
        menuButton.setAttribute('aria-expanded', String(open));
    });

    document.querySelectorAll('.sidebar a').forEach(function (link) {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });
}


// A single toast is reused so status messages do not stack up on the page.
let toastTimer;

// Show a temporary message and restart its four-second hide timer.
function showMessage(message) {
    // Clear the previous timer so a newer message stays visible for its full duration.
    const toast = document.getElementById('toast');

    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;

    toastTimer = setTimeout(function () {
        toast.hidden = true;
    }, 4000);
}


// Each form layout describes the fields that openRecordForm builds for that record type.
const formLayouts = {
    resources: {
        title: 'Add resource',
        // Each tuple is [label shown to the user, HTML input type, property saved on the record].
        fields: [
            ['Resource name', 'text', 'name'],
            ['Boat type', 'text', 'type'],
            ['Capacity', 'number', 'capacity'],
            ['Rate per hour (PHP)', 'number', 'rate'],
            ['Fleet status', 'select', 'status'],
            ['Resource image', 'file', 'image']
        ]
    },
    bookings: {
        title: 'New booking',
        // Booking dropdown values are saved record IDs; dates and guest count are saved directly.
        fields: [
            ['Client', 'select', 'clientId'],
            ['Resource', 'select', 'resourceId'],
            ['Departure', 'datetime-local', 'start'],
            ['Return', 'datetime-local', 'end'],
            ['Assigned staff', 'select', 'staffId'],
            ['Guests', 'number', 'guests']
        ]
    },
    payments: {
        title: 'Record payment',
        // A receipt points to a booking and stores its amount, method, and optional reference.
        fields: [
            ['Booking', 'select', 'bookingId'],
            ['Amount (PHP)', 'number', 'amount'],
            ['Payment method', 'select', 'method'],
            ['Reference number (optional)', 'text', 'reference']
        ]
    },
    clients: {
        title: 'Add client',
        // These contact fields make the client selectable on later booking forms.
        fields: [
            ['Full name', 'text', 'name'],
            ['Email', 'email', 'email'],
            ['Phone', 'tel', 'phone'],
            ['Address', 'text', 'address']
        ]
    },
    staff: {
        title: 'Add staff member',
        // Active staff appear in booking choices; inactive staff remain in historical records.
        fields: [
            ['Full name', 'text', 'name'],
            ['Role', 'text', 'role'],
            ['Phone', 'tel', 'phone'],
            ['Email', 'email', 'email'],
            ['Status', 'select', 'status']
        ]
    }
};

// The same native dialog is reused for resources, bookings, clients, staff, and payments.
const dialog = document.getElementById('record-dialog');

// Connect every Add/New button to the shared form, using its data-form value as the record type.
document.querySelectorAll('[data-form]').forEach(function (button) {
    button.addEventListener('click', function () {
        openRecordForm(button.dataset.form);
    });
});

// Close buttons inside the dialog simply dismiss it; saving is handled by the form submit listener.
document.querySelectorAll('[data-close-dialog]').forEach(function (button) {
    button.addEventListener('click', function () {
        dialog.close();
    });
});

// This form is created inside the reusable dialog and routes saves to the selected record handler.
const previewForm = document.getElementById('preview-form');

if (previewForm) {
    previewForm.addEventListener('submit', function (event) {
        event.preventDefault();

        if (['resources', 'bookings', 'clients', 'staff', 'payments'].includes(dialog.dataset.kind)) {
            savePortalRecord();
            return;
        }

        dialog.close();
        previewForm.reset();
        showMessage('Saved.');
    });
}

// Search and status controls redraw data tables when their current section supports live filtering.
document.querySelectorAll('.panel').forEach(function (panel) {
    // These three lookups find the filter controls and initial empty row inside this panel.
    const search = panel.querySelector('[data-search]');
    const filter = panel.querySelector('[data-filter]');
    const empty = panel.querySelector('[data-empty]');

    if (!empty) {
        return;
    }

    // Keep the original empty message so it can be restored when the user clears filters.
    const originalMessage = empty.textContent;

    // Refresh real data tables; for static tables, only adjust the empty-state wording.
    function updateEmptyMessage() {
        if (panel.closest('#resources, #bookings, #clients, #staff, #payments')) {
            renderPortal();
            return;
        }

        const text = search ? search.value.trim() : '';
        const status = filter ? filter.value : 'all';

        if (text || status !== 'all') {
            empty.textContent = 'No records match the selected filters.';
        } else {
            empty.textContent = originalMessage;
        }
    }

    if (search) {
        search.addEventListener('input', updateEmptyMessage);
    }

    if (filter) {
        filter.addEventListener('change', updateEmptyMessage);
    }
});

// Convert a date to the YYYY-MM-DD format expected by date inputs and report filters.
function dateValue(date) {
    // Date inputs need a zero-padded month and day to keep string comparisons reliable.
    // Store the parts separately because Date months start at zero while displayed months start at one.
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return year + '-' + month + '-' + day;
}

// Turn a stored date value into a readable label without shifting it across time zones.
function displayDate(value) {
    // Add midday because midnight ISO dates can display as the previous day in some time zones.
    return new Date(value + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

// The schedule controls are present only on the Availability screen.
const scheduleDate = document.getElementById('schedule-date');

if (scheduleDate) {
    function updateSchedule() {
        // Keep the heading aligned with the date picker, then redraw the schedule table.
        document.getElementById('schedule-heading').textContent = scheduleDate.value
            ? 'Schedule for ' + displayDate(scheduleDate.value)
            : 'Select a date';

        renderPortal();
    }

    function changeDay(amount) {
        // Start from the selected day, or today, and move by one day in either direction.
        const date = scheduleDate.value
            ? new Date(scheduleDate.value + 'T12:00:00')
            : new Date();

        date.setDate(date.getDate() + amount);
        scheduleDate.value = dateValue(date);
        updateSchedule();
    }

    scheduleDate.value = dateValue(new Date());
    updateSchedule();

    scheduleDate.addEventListener('change', updateSchedule);
    document.getElementById('previous-day').addEventListener('click', function () {
        changeDay(-1);
    });
    document.getElementById('next-day').addEventListener('click', function () {
        changeDay(1);
    });
    document.getElementById('today-button').addEventListener('click', function () {
        scheduleDate.value = dateValue(new Date());
        updateSchedule();
    });
}

// The report controls and print button exist only on the Reports screen.
const reportForm = document.getElementById('report-form');

if (reportForm) {
    // Default the report to the current month through today so it works immediately.
    const today = new Date();
    document.getElementById('report-from').value = dateValue(new Date(today.getFullYear(), today.getMonth(), 1));
    document.getElementById('report-to').value = dateValue(today);

    reportForm.addEventListener('input', function () {
        // Any changed filter makes the previous result stale until Generate report is pressed again.
        const heading = document.getElementById('report-period');
        delete heading.dataset.from;
        delete heading.dataset.to;
        heading.textContent = '';
        document.getElementById('report-results').hidden = true;
        document.getElementById('print-button').disabled = true;
    });

    reportForm.addEventListener('submit', function (event) {
        event.preventDefault();

        // Keep date values as YYYY-MM-DD so an invalid or backwards range is easy to reject.
        const from = document.getElementById('report-from').value;
        const to = document.getElementById('report-to').value;
        const heading = document.getElementById('report-period');

        if (!from || !to || from > to) {
            delete heading.dataset.from;
            delete heading.dataset.to;
            document.getElementById('report-results').hidden = true;
            document.getElementById('print-button').disabled = true;
            heading.textContent = 'The end date must be on or after the start date.';
        } else {
            heading.dataset.from = from;
            heading.dataset.to = to;
            // Store both each dropdown's ID and its visible label for filtering and the printed heading.
            const resource = document.getElementById('report-resource');
            const client = document.getElementById('report-client');
            heading.dataset.resource = resource.value;
            heading.dataset.client = client.value;
            heading.dataset.resourceLabel = resource.selectedOptions[0].textContent;
            heading.dataset.clientLabel = client.selectedOptions[0].textContent;
            const paymentStatus = document.getElementById('report-payment-status');
            heading.dataset.paymentStatus = paymentStatus.value;
            heading.dataset.paymentLabel = paymentStatus.selectedOptions[0].textContent;
            renderPortal();
        }
    });

    document.getElementById('print-button').addEventListener('click', function () {
        if (!document.getElementById('report-results').hidden) {
            window.print();
        }
    });
}

const accountForm = document.getElementById('account-form');

if (accountForm) {
    // The account screen is a visual placeholder; it currently does not save account changes.
    accountForm.addEventListener('submit', function (event) {
        event.preventDefault();
        showMessage('Saved.');
    });
}



// Read and validate every saved list before a screen or form uses the shared records.
function readRecords() {
    // localStorage returns null before the first save; an empty set keeps every screen renderable.
    const saved = localStorage.getItem(storageKey);

    if (!saved) {
        return { resources: [], bookings: [], clients: [], staff: [], payments: [] };
    }

    // Parse the JSON text back into normal JavaScript arrays and record objects.
    const records = JSON.parse(saved);

    // Older browser saves may not contain lists added later, so initialize those lists as empty.
    if (records.clients === undefined) {
        records.clients = [];
    }

    if (records.staff === undefined) {
        records.staff = [];
    }

    if (records.payments === undefined) {
        records.payments = [];
    }

    // Reject damaged or unexpected storage instead of letting later code fail in confusing ways.
    if (!Array.isArray(records.resources) || !Array.isArray(records.bookings) || !Array.isArray(records.clients) || !Array.isArray(records.staff) || !Array.isArray(records.payments)) {
        throw new Error('The saved browser records could not be read.');
    }

    return records;
}

// Save all record lists together, then redraw the dashboard, tables, reports, and schedule.
function writeRecords(records) {
    // Keep the current demo data in this browser until database storage is connected.
    localStorage.setItem(storageKey, JSON.stringify(records));
    renderPortal();
}

// Read an uploaded image into a data URL so it can be stored with its resource in localStorage.
function readImage(file) {
    // FileReader works asynchronously, so return a Promise that the save handler can await.
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();

        reader.onload = function () {
            resolve(reader.result);
        };

        reader.onerror = function () {
            reject(new Error('The image could not be read. Choose the file again.'));
        };

        reader.onabort = function () {
            reject(new Error('Image reading was cancelled. Choose the file again.'));
        };

        reader.readAsDataURL(file);
    });
}

// Give a new resource, booking, client, staff member, or payment a stable unique identifier.
function newId() {
    return window.crypto.randomUUID();
}

// Display a number as Philippine pesos with two decimal places and thousands separators.
function money(amount) {
    // Number() accepts either a numeric amount or numeric text from a form field.
    return '₱' + Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Format a saved date and time for tables, summaries, and cancellation details.
function dateTime(value) {
    return new Date(value).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

// Return true when two time ranges intersect; touching endpoints alone do not count as overlap.
function overlaps(start, end, otherStart, otherEnd) {
    // Parse both endpoints so stored strings and Date objects can be compared consistently.
    return new Date(start) < new Date(otherEnd) && new Date(end) > new Date(otherStart);
}

// Build a dropdown option with textContent so labels are treated as text, not HTML.
function addOption(select, value, text) {
    // The option value stores an ID or status while its visible text can contain more detail.
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    select.appendChild(option);
}

// A staff member can be assigned only when active and not already booked during this time range.
function staffIsAvailable(records, member, start, end) {
    // One matching reservation is enough to make this staff member unavailable for the range.
    return member.status === 'Active' && !records.bookings.some(function (booking) {
        return booking.staffId === member.id && booking.status !== 'Cancelled'
            && overlaps(start, end, booking.start, booking.end);
    });
}

// Rebuild the booking staff dropdown whenever the selected rental dates change.
function updateStaffOptions() {
    // Remember the selection so refreshing the options does not clear a still-valid choice.
    const select = previewForm.elements.namedItem('staffId');
    const selectedId = select.value;
    // These dates are checked against each active staff member's existing bookings.
    const start = previewForm.elements.namedItem('start').value;
    const end = previewForm.elements.namedItem('end').value;
    // Remove old choices before adding staff who match the latest date inputs.
    select.replaceChildren();
    addOption(select, '', 'Choose available staff…');

    try {
        // Read fresh data in case another action changed staff availability after this dialog opened.
        const records = readRecords();
        const available = records.staff.filter(function (member) {
            return staffIsAvailable(records, member, start, end);
        }).sort(function (first, second) {
            return first.name.localeCompare(second.name);
        });

        available.forEach(function (member) {
            addOption(select, member.id, member.name + ' · ' + member.role + ' · ' + member.phone);
        });

        if (available.some(function (member) { return member.id === selectedId; })) {
            select.value = selectedId;
        }

        if (!available.length) {
            select.options[0].textContent = 'No staff available for these dates';
        }
    } catch (error) {
        showMessage('Staff could not be loaded. Close the form and try again.');
    }
}

// Build and open the shared Add/Edit/Booking/Payment dialog using the requested record type.
function openRecordForm(kind, editId = '', resourceId = '') {
    // Staff start a booking by choosing a boat card; admins can open the booking form directly.
    if (kind === 'bookings' && isStaff && !resourceId) {
        window.location.hash = 'choose-boat';
        renderPortal();
        return;
    }

    if (kind === 'resources' && isStaff) {
        showMessage('Only the administrator can add or edit resources.');
        return;
    }

    let records;

    try {
        records = readRecords();
    } catch (error) {
        showMessage('Browser storage is unavailable. Records were not changed.');
        return;
    }

    // For edits, load the selected saved object so its current values can fill the form fields.
    const existing = editId ? records[kind].find(function (record) {
        return record.id === editId;
    }) : null;

    if (editId && !existing) {
        showMessage('This record no longer exists.');
        return;
    }

    if (kind === 'bookings' && !records.clients.length) {
        showMessage('Add a client on the Clients page before creating a booking.');
        window.location.hash = 'clients';
        return;
    }

    if (kind === 'bookings' && !records.resources.some(function (resource) {
        return resource.status === 'Available';
    })) {
        showMessage('The administrator needs to add an available resource before you can book.');
        window.location.hash = 'resources';
        return;
    }

    if (kind === 'bookings' && !records.staff.some(function (member) {
        return member.status === 'Active';
    })) {
        showMessage('Add an active staff member on the Staff page before creating a booking.');
        window.location.hash = 'staff';
        return;
    }

    if (kind === 'payments' && !records.bookings.some(function (booking) {
        return booking.status !== 'Cancelled' && paymentBalance(records, booking) > 0;
    })) {
        showMessage('No bookings have an outstanding balance.');
        return;
    }

    // The layout supplies field names and types; the branches below add record-specific options.
    // Reuse the common dialog and build its fields from the chosen layout description.
    const layout = formLayouts[kind];
    const fields = document.getElementById('dialog-fields');
    // These record types have real validation and storage logic in savePortalRecord.
    const sharedForm = ['resources', 'bookings', 'clients', 'staff', 'payments'].includes(kind);

    dialog.dataset.kind = kind;
    dialog.dataset.editId = editId;
    document.getElementById('dialog-title').textContent = editId
        ? (kind === 'staff' ? 'Edit staff member' : kind === 'clients' ? 'Edit client' : 'Edit resource')
        : layout.title;
    document.getElementById('dialog-error').hidden = true;
    document.getElementById('dialog-save').textContent = sharedForm ? 'Save' : 'Done';
    fields.replaceChildren();

    layout.fields.forEach(function (field) {
        // Each field tuple contains its label, input type, and matching property name.
        const label = document.createElement('label');
        const input = document.createElement(field[1] === 'select' ? 'select' : 'input');
        label.textContent = field[0];
        input.name = field[2] || '';
        // Files and optional references are the only shared-form fields allowed to stay blank.
        input.required = sharedForm && field[1] !== 'file' && field[2] !== 'reference';

        if (field[1] === 'select') {
            if (field[2] === 'resourceId') {
                addOption(input, '', 'Choose a resource…');

                records.resources.filter(function (resource) {
                    return resource.status === 'Available';
                }).forEach(function (resource) {
                    addOption(input, resource.id, resource.name + ' · ' + resource.capacity + ' guests · ' + money(resource.rate) + '/hr');
                });

                input.value = resourceId;
            } else if (field[2] === 'clientId') {
                addOption(input, '', 'Choose a client…');

                records.clients.slice().sort(function (first, second) {
                    return first.name.localeCompare(second.name);
                }).forEach(function (client) {
                    addOption(input, client.id, client.name + ' · ' + client.email + ' · ' + client.phone);
                });
            } else if (field[2] === 'bookingId') {
                addOption(input, '', 'Choose a booking…');
                records.bookings.filter(function (booking) {
                    return booking.status !== 'Cancelled' && paymentBalance(records, booking) > 0;
                }).forEach(function (booking) {
                    addOption(input, booking.id, 'BK-' + booking.id.slice(0, 8).toUpperCase() + ' · ' + booking.client + ' · Balance ' + money(paymentBalance(records, booking) / 100));
                });
            } else if (field[2] === 'method') {
                addOption(input, '', 'Choose a payment method…');
                ['Cash', 'GCash', 'Bank transfer', 'Card'].forEach(function (method) {
                    addOption(input, method, method);
                });
            } else if (field[2] === 'staffId') {
                addOption(input, '', 'Choose available staff…');
            } else {
                const statuses = kind === 'staff' ? ['Active', 'Inactive'] : ['Available', 'Maintenance', 'Inactive'];
                statuses.forEach(function (status) {
                    addOption(input, status, status);
                });
            }
        } else {
            // Text, date, number, and file controls use the input type declared in the layout.
            input.type = field[1];
            input.maxLength = 150;

            if (field[1] === 'file') {
                input.accept = 'image/*';
                input.removeAttribute('maxlength');
            }

            if (input.type === 'number') {
                const currency = field[2] === 'rate' || field[2] === 'amount';
                input.min = currency ? '0.01' : '1';
                input.step = currency ? '0.01' : '1';
                input.max = field[2] === 'amount' ? '9999999999' : (currency ? '999999.99' : '1000');
            }
        }

        // File inputs cannot be prefilled by browsers, so existing photos are retained separately.
        if (existing && field[2] && field[1] !== 'file') {
            input.value = existing[field[2]];
        }

        label.appendChild(input);
        fields.appendChild(label);
    });

    if (kind === 'bookings') {
        updateStaffOptions();
        previewForm.elements.namedItem('start').addEventListener('change', updateStaffOptions);
        previewForm.elements.namedItem('end').addEventListener('change', updateStaffOptions);
    }

    dialog.showModal();
}

// Validate one dialog submission, update the chosen record list, and save the result.
async function savePortalRecord() {
    // Keep references to the inline error text and button so duplicate saves can be prevented.
    const errorBox = document.getElementById('dialog-error');
    const saveButton = document.getElementById('dialog-save');

    if (saveButton.disabled) {
        return;
    }

    saveButton.disabled = true;
    errorBox.hidden = true;

    try {
        // Read current storage and turn submitted fields into a simple name-to-value object.
        let records = readRecords();
        const values = Object.fromEntries(new FormData(previewForm));
        // The dialog remembers what kind of form it opened and which existing item is being edited.
        const kind = dialog.dataset.kind;
        const editId = dialog.dataset.editId;

        // Resource validation includes optional image loading and protection for future bookings.
        if (kind === 'resources') {
            if (isStaff) {
                throw new Error('Only the administrator can add or edit resources.');
            }

            // Convert numeric text fields before applying number and currency rules.
            const capacity = Number(values.capacity);
            const rate = Number(values.rate);
            // A file is present only when the user chose one in the image picker.
            const imageInput = previewForm.querySelector('[name="image"]');
            const imageFile = imageInput && imageInput.files ? imageInput.files[0] : null;

            if (!values.name.trim() || !values.type.trim()) {
                throw new Error('Enter the resource name and boat type.');
            }

            if (!Number.isInteger(capacity) || capacity < 1 || capacity > 1000 || !Number.isFinite(rate) || rate <= 0 || rate > 999999.99) {
                throw new Error('Enter a valid capacity and hourly rate.');
            }

            if (imageFile && !imageFile.type.startsWith('image/')) {
                throw new Error('Choose an image file.');
            }

            if (imageFile && imageFile.size > 2 * 1024 * 1024) {
                throw new Error('Choose an image smaller than 2 MB.');
            }

            // Wait for the chosen image to finish reading before building the resource object.
            const uploadedImage = imageFile ? await readImage(imageFile) : '';
            records = readRecords();
            const index = records.resources.findIndex(function (resource) {
                return resource.id === editId;
            });

            if (editId && index === -1) {
                throw new Error('This resource no longer exists. Close the form and try again.');
            }

            const existing = editId ? records.resources[index] : null;

            // Only non-cancelled rentals that have not ended can block a fleet change.
            const futureBookings = records.bookings.filter(function (booking) {
                return booking.resourceId === editId && booking.status !== 'Cancelled' && new Date(booking.end) > new Date();
            });

            if (futureBookings.length && values.status !== 'Available') {
                throw new Error('Cancel the resource’s upcoming bookings before changing its availability.');
            }

            if (futureBookings.some(function (booking) { return booking.guests > capacity; })) {
                throw new Error('The new capacity is lower than an upcoming booking’s guest count.');
            }

            // Keep the resource ID stable so its existing bookings remain linked to it.
            const resource = {
                id: editId || newId(),
                name: values.name.trim(),
                type: values.type.trim(),
                capacity: capacity,
                rate: Math.round(rate * 100) / 100,
                status: values.status,
                // Keep the existing photo when the edit form has no new file selected.
                image: imageFile ? uploadedImage : (existing ? existing.image || '' : '')
            };

            if (editId) {
                records.resources[index] = resource;
            } else {
                records.resources.push(resource);
            }
        // A payment is a receipt attached to a booking; it never changes the saved rental price.
        } else if (kind === 'payments') {
            // Match the selected booking and convert the typed payment into integer cents.
            const booking = records.bookings.find(function (item) { return item.id === values.bookingId; });
            const amount = Number(values.amount);
            // Compare integer cents so decimal currency values do not accumulate floating-point errors.
            const cents = Math.round(amount * 100);

            if (!booking || booking.status === 'Cancelled') {
                throw new Error('Choose a booking that has not been cancelled.');
            }

            if (!Number.isFinite(amount) || cents <= 0 || cents > paymentBalance(records, booking)) {
                throw new Error('Enter a payment greater than zero and no more than the outstanding balance.');
            }

            if (!['Cash', 'GCash', 'Bank transfer', 'Card'].includes(values.method)) {
                throw new Error('Choose a payment method.');
            }

            records.payments.push({
                id: newId(),
                bookingId: booking.id,
                amount: cents / 100,
                method: values.method,
                reference: values.reference.trim(),
                createdAt: new Date().toISOString()
            });
        // Trim client input, then replace an existing client or add a new one.
        } else if (kind === 'clients') {
            const name = values.name.trim();
            const email = values.email.trim();
            const phone = values.phone.trim();
            const address = values.address.trim();

            if (!name || !email || !phone || !address) {
                throw new Error('Enter the client’s name, email, phone, and address.');
            }

            // The index locates an existing client for edits while preserving its ID.
            const index = records.clients.findIndex(function (client) {
                return client.id === editId;
            });

            if (editId && index === -1) {
                throw new Error('This client no longer exists.');
            }

            const client = {
                id: editId || newId(),
                name: name,
                email: email,
                phone: phone,
                address: address
            };

            if (editId) {
                records.clients[index] = client;
            } else {
                records.clients.push(client);
            }
        // Save staff records for the booking dropdown and availability checks used for reservations.
        } else if (kind === 'staff') {
            const name = values.name.trim();
            const role = values.role.trim();
            const phone = values.phone.trim();
            const email = values.email.trim();

            if (!name || !role || !phone || !email || !['Active', 'Inactive'].includes(values.status)) {
                throw new Error('Enter the staff member’s details and select a valid status.');
            }

            // A blank editId means create a new staff record; otherwise find the saved row.
            const index = records.staff.findIndex(function (member) {
                return member.id === editId;
            });

            if (editId && index === -1) {
                throw new Error('This staff member no longer exists.');
            }

            // Keep contact details, role, and active state together in one staff object.
            const member = {
                id: editId || newId(),
                name: name,
                role: role,
                phone: phone,
                email: email,
                status: values.status
            };

            if (editId) {
                records.staff[index] = member;
            } else {
                records.staff.push(member);
            }
        // A booking connects one saved client, boat, and available staff member for a time range.
        } else if (kind === 'bookings') {
            // Resolve each dropdown ID to its full saved record before checking the reservation.
            const client = records.clients.find(function (item) {
                return item.id === values.clientId;
            });
            const resource = records.resources.find(function (item) {
                return item.id === values.resourceId;
            });
            // Date objects let the code validate the range and calculate whole billable hours.
            const start = new Date(values.start);
            const end = new Date(values.end);
            // Convert text from the guest input and resolve the assigned staff record.
            const guests = Number(values.guests);
            const member = records.staff.find(function (item) {
                return item.id === values.staffId;
            });

            if (!resource || resource.status !== 'Available') {
                throw new Error('Choose an available resource.');
            }

            if (!client) {
                throw new Error('Choose a client registered on the Clients page.');
            }

            if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) {
                throw new Error('Return time must be after departure.');
            }

            if (!member || !staffIsAvailable(records, member, values.start, values.end)) {
                updateStaffOptions();
                throw new Error('Choose an active staff member available for these dates.');
            }

            if (!Number.isInteger(guests) || guests < 1 || guests > resource.capacity) {
                throw new Error('Guest count must be between 1 and ' + resource.capacity + '.');
            }

            // A matching boat reservation is a conflict only if it is not cancelled and overlaps.
            const conflict = records.bookings.some(function (booking) {
                return booking.resourceId === resource.id && booking.status !== 'Cancelled'
                    && overlaps(values.start, values.end, booking.start, booking.end);
            });

            if (conflict) {
                throw new Error('This resource is already booked for those times.');
            }

            // Round partial hours up so any started rental hour is included in the price.
            const hours = Math.ceil((end - start) / 3600000);

            if (hours > 24 * 365) {
                throw new Error('Choose a rental period shorter than one year.');
            }

            // Save readable name snapshots as well as IDs so old bookings remain understandable.
            // Save the calculated price now so later boat rate edits do not change rental history.
            records.bookings.push({
                id: newId(),
                clientId: client.id,
                client: client.name,
                staffId: member.id,
                staffName: member.name,
                resourceId: resource.id,
                resourceName: resource.name,
                start: values.start,
                end: values.end,
                guests: guests,
                total: Math.round(resource.rate * 100) * hours / 100,
                status: 'Confirmed',
                bookedBy: isStaff ? 'staff123' : 'admin123',
                bookedRole: portalRole,
                createdAt: new Date().toISOString(),
                cancelledBy: '',
                cancelledAt: ''
            });
        }

        // Saving redraws every screen from the new data; then close and clear the dialog.
        writeRecords(records);
        dialog.close();
        previewForm.reset();
        if (kind === 'bookings' && isStaff) {
            window.location.hash = 'bookings';
        }
        // Pick a clear confirmation message after the save and screen redraw succeed.
        const messages = {
            resources: 'Resource saved. Staff can now see it.',
            bookings: 'Booking saved. It is now visible in the admin and staff views.',
            clients: 'Client saved.',
            staff: 'Staff member saved.',
            payments: 'Payment recorded.'
        };
        showMessage(messages[kind]);
    } catch (error) {
        // Show validation/storage errors inside the dialog and allow the user to correct the form.
        errorBox.textContent = error.name === 'QuotaExceededError' || error.name === 'SecurityError'
            ? 'Browser storage is unavailable or full. The record was not saved.'
            : error.message;
        errorBox.hidden = false;
    } finally {
        // Re-enable Save whether the operation succeeded or stopped with an error.
        saveButton.disabled = false;
    }
}

// Open the cancellation dialog for one booking and record who approved the cancellation.
function cancelBooking(id) {
    try {
        // Reload the booking so an old table button cannot cancel a booking twice.
        const records = readRecords();
        const booking = records.bookings.find(function (item) { return item.id === id; });

        if (!booking || booking.status === 'Cancelled') {
            showMessage('This booking was already cancelled or is no longer available.');
            renderPortal();
            return;
        }

        // Staff can select an active staff member; only admins also get the admin option.
        const cancelDialog = document.getElementById('cancel-dialog');
        const select = document.getElementById('cancelled-by');
        select.replaceChildren();
        addOption(select, '', 'Choose who is cancelling…');

        if (!isStaff) {
            addOption(select, 'admin', 'Administrator (admin123)');
        }

        records.staff.filter(function (member) {
            return member.status === 'Active';
        }).forEach(function (member) {
            addOption(select, member.id, member.name + ' · ' + member.role);
        });

        if (select.options.length === 1) {
            showMessage('Add an active staff member before cancelling a booking.');
            window.location.hash = 'staff';
            return;
        }

        cancelDialog.dataset.bookingId = id;
        document.getElementById('cancel-booking-label').textContent = 'BK-' + booking.id.slice(0, 8).toUpperCase() + ' · ' + booking.client + ' · ' + booking.resourceName;
        document.getElementById('cancel-error').hidden = true;
        cancelDialog.showModal();
    } catch (error) {
        showMessage('The booking could not be loaded. Try again.');
    }
}

const cancelForm = document.getElementById('cancel-form');

if (cancelForm) {
    // Wire close buttons separately from submit so closing never changes booking data.
    document.querySelectorAll('[data-close-cancel]').forEach(function (button) {
        button.addEventListener('click', function () {
            document.getElementById('cancel-dialog').close();
        });
    });

    cancelForm.addEventListener('submit', function (event) {
        event.preventDefault();
        // Show a fresh inline error for this attempt and only hide the dialog after a successful save.
        const errorBox = document.getElementById('cancel-error');
        errorBox.hidden = true;

        try {
            const records = readRecords();
            const cancelDialog = document.getElementById('cancel-dialog');
            const booking = records.bookings.find(function (item) {
                return item.id === cancelDialog.dataset.bookingId;
            });
            // The dropdown value is either the admin marker or the selected staff member's ID.
            const selected = document.getElementById('cancelled-by').value;
            const admin = selected === 'admin' && !isStaff;
            const member = records.staff.find(function (item) {
                return item.id === selected && item.status === 'Active';
            });

            if (!booking || booking.status === 'Cancelled') {
                throw new Error('This booking was already cancelled or no longer exists.');
            }

            if (!admin && !member) {
                throw new Error('Select an active staff member or the administrator.');
            }

            booking.status = 'Cancelled';
            booking.cancelledBy = admin ? 'Administrator (admin123)' : member.name;
            booking.cancelledByStaffId = admin ? '' : member.id;
            booking.cancelledByRole = admin ? 'admin' : 'staff';
            booking.cancelledAt = new Date().toISOString();
            writeRecords(records);
            cancelDialog.close();
            showMessage('Booking cancelled by ' + booking.cancelledBy + '.');
        } catch (error) {
            errorBox.textContent = error.name === 'QuotaExceededError' || error.name === 'SecurityError'
                ? 'The cancellation could not be saved. Check browser storage and try again.'
                : error.message;
            errorBox.hidden = false;
        }
    });
}

// Remove an unused client, boat, or staff record while protecting future reservations.
function removeManagedRecord(kind, id) {
    // These labels are reused in confirmation, error, and success messages.
    const labels = { resources: 'resource', clients: 'client', staff: 'staff member' };
    const label = labels[kind] || 'record';

    if (!window.confirm('Remove this ' + label + '?')) {
        return;
    }

    try {
        const records = readRecords();
        // Find the selected object in the matching list by its stable ID.
        const collection = records[kind];
        const index = collection.findIndex(function (record) {
            return record.id === id;
        });

        if (index === -1) {
            showMessage('This ' + label + ' no longer exists.');
            renderPortal();
            return;
        }

        // Keep future reservations assigned to an existing boat or staff member.
        if (kind === 'resources' || kind === 'staff') {
            const hasUpcomingBooking = records.bookings.some(function (booking) {
                const assigned = kind === 'resources' ? booking.resourceId === id : booking.staffId === id;
                return assigned && booking.status !== 'Cancelled' && new Date(booking.end) > new Date();
            });

            if (hasUpcomingBooking) {
                showMessage(kind === 'resources'
                    ? 'Cancel upcoming bookings for this resource before removing it.'
                    : 'Cancel or reassign this staff member’s upcoming bookings before removing them.');
                return;
            }
        }

        // Past bookings retain their saved details after the current record is removed.
        collection.splice(index, 1);
        writeRecords(records);
        renderPortal();
        showMessage('Removed. Existing bookings keep their saved ' + label + ' details.');
    } catch (error) {
        showMessage(error.name === 'QuotaExceededError' || error.name === 'SecurityError'
            ? 'Browser storage is unavailable. The record was not removed.'
            : error.message);
    }
}

// Add all receipt amounts for one booking and return the total in integer cents.
function receivedPayment(records, bookingId) {
    return records.payments.filter(function (payment) {
        return payment.bookingId === bookingId;
    }).reduce(function (total, payment) {
        return total + Math.round(Number(payment.amount) * 100);
    }, 0);
}

// Subtract receipts from the booking price and prevent the balance from going below zero.
function paymentBalance(records, booking) {
    return Math.max(0, Math.round(Number(booking.total) * 100) - receivedPayment(records, booking.id));
}

// Derive payment status from the booking cancellation state and its saved receipts.
function bookingPaymentStatus(records, booking) {
    if (booking.status === 'Cancelled') {
        return 'Cancelled';
    }

    if (paymentBalance(records, booking) === 0) {
        return 'Paid';
    }

    return receivedPayment(records, booking.id) > 0 ? 'Partial' : 'Unpaid';
}

// Rebuild the payment table from bookings and receipts so balances stay current.
function renderPayments(records) {
    const body = document.querySelector('#payments tbody');
    // Clear old rows before rebuilding the current payment view.
    body.replaceChildren();

    // Reverse a copy so newest bookings show first without changing stored array order.
    records.bookings.slice().reverse().forEach(function (booking) {
        // Each booking row gathers only the payment records connected to that booking ID.
        const payments = records.payments.filter(function (payment) { return payment.bookingId === booking.id; });
        // These totals determine the amount shown and the derived payment-status badge.
        const paid = receivedPayment(records, booking.id);

        if (booking.status === 'Cancelled' && !payments.length) {
            return;
        }

        // Use the same booking reference displayed by the Bookings and Reports screens.
        const status = bookingPaymentStatus(records, booking);
        const reference = 'BK-' + booking.id.slice(0, 8).toUpperCase();
        const references = payments.map(function (payment) { return payment.reference; }).filter(Boolean).join(', ');

        if (!matchesFilters('payments', [reference, booking.client, references].join(' '), status)) {
            return;
        }

        const row = document.createElement('tr');
        addCell(row, reference, references);
        addCell(row, booking.client);
        addCell(row, money(paid / 100), booking.status === 'Cancelled' ? 'Booking cancelled' : 'Balance: ' + money(paymentBalance(records, booking) / 100));
        addCell(row, Array.from(new Set(payments.map(function (payment) { return payment.method; }))).join(', ') || '—');
        addStatus(row, status);
        body.appendChild(row);
    });

    emptyTable(body, 5, 'No payments or balances match this view.');
}

// Fill resource/client report dropdowns while keeping any selection that still exists.
function updateReportFilters(records) {
    // Include saved booking names so removed clients and boats remain filterable in old reports.
    const resources = new Map(records.resources.map(function (resource) {
        return [resource.id, resource.name];
    }));
    const clients = new Map(records.clients.map(function (client) {
        return [client.id, client.name + (client.phone ? ' · ' + client.phone : '')];
    }));

    records.bookings.forEach(function (booking) {
        if (booking.resourceId && !resources.has(booking.resourceId)) {
            resources.set(booking.resourceId, booking.resourceName);
        }

        const clientKey = booking.clientId || 'name:' + booking.client;
        if (!clients.has(clientKey)) {
            clients.set(clientKey, booking.client + (booking.clientId ? '' : ' (older bookings)'));
        }
    });

    // Each tuple supplies a select ID, its default label, and the ID-to-name choices to display.
    [
        ['report-resource', 'All resources', resources],
        ['report-client', 'All clients', clients]
    ].forEach(function (filter) {
        // Each tuple gives the dropdown ID, placeholder text, and map of available choices.
        const select = document.getElementById(filter[0]);
        const selected = select.value;
        const options = Array.from(filter[2]).sort(function (first, second) {
            return first[1].localeCompare(second[1]);
        });
        // The signature avoids rebuilding identical options and losing the current user selection.
        const signature = JSON.stringify(options);

        if (select.dataset.options === signature) {
            return;
        }

        select.replaceChildren();
        addOption(select, '', filter[1]);
        options.forEach(function (option) { addOption(select, option[0], option[1]); });
        select.value = filter[2].has(selected) ? selected : '';
        select.dataset.options = signature;
    });
}

// Filter bookings, calculate summary totals, and build the combined bookings-and-payments report.
function renderReport(records) {
    const heading = document.getElementById('report-period');
    // The submit handler stores dates, IDs, and display labels here for the renderer to reuse.
    const from = heading.dataset.from;
    const to = heading.dataset.to;
    const resourceId = heading.dataset.resource || '';
    const clientId = heading.dataset.client || '';
    const paymentFilter = heading.dataset.paymentStatus || 'all';

    if (!from || !to) {
        return;
    }

    // Keep rows that match the departure range, optional boat/client, and selected payment state.
    const bookings = records.bookings.filter(function (booking) {
        const departure = dateValue(new Date(booking.start));
        const clientKey = booking.clientId || 'name:' + booking.client;
        const paymentStatus = bookingPaymentStatus(records, booking);
        const matchesPayment = paymentFilter === 'all' || paymentFilter === paymentStatus;
        return departure >= from && departure <= to
            && (!resourceId || booking.resourceId === resourceId)
            && (!clientId || clientKey === clientId)
            && matchesPayment;
    }).sort(function (first, second) {
        return new Date(first.start) - new Date(second.start);
    });
    // Add all money totals as integer cents, then format the final values as pesos.
    let bookedValue = 0;
    let received = 0;
    let outstanding = 0;
    const body = document.getElementById('report-bookings');
    body.replaceChildren();

    bookings.forEach(function (booking) {
        // Cancelled bookings remain listed but do not add rental value or outstanding balance.
        const cancelled = booking.status === 'Cancelled';
        // Derive receipt and remaining-balance values for this individual booking.
        const paid = receivedPayment(records, booking.id);
        const balance = cancelled ? 0 : paymentBalance(records, booking);
        bookedValue += cancelled ? 0 : Math.round(Number(booking.total) * 100);
        received += paid;
        outstanding += balance;

        const row = document.createElement('tr');
        addCell(row, 'BK-' + booking.id.slice(0, 8).toUpperCase(), booking.client);
        addCell(row, booking.resourceName, booking.staffName || '—');
        addCell(row, dateTime(booking.start), 'to ' + dateTime(booking.end));
        addStatus(row, bookingPaymentStatus(records, booking));
        addCell(row, money(Number(booking.total)));
        addCell(row, money(paid / 100));
        addCell(row, money(balance / 100));
        // Collect unique receipt methods to avoid repeating the same method in the summary cell.
        const methods = records.payments.filter(function (payment) {
            return payment.bookingId === booking.id;
        }).map(function (payment) { return payment.method; });
        const cancellation = booking.cancelledBy
            ? 'Cancelled by ' + booking.cancelledBy + (booking.cancelledAt ? ' · ' + dateTime(booking.cancelledAt) : '')
            : '';
        addCell(row, Array.from(new Set(methods)).join(', ') || '—', cancellation);
        body.appendChild(row);
    });

    emptyTable(body, 8, 'No bookings match the selected dates and filters.');
    document.getElementById('report-booking-count').textContent = bookings.length;
    document.getElementById('report-booked-value').textContent = money(bookedValue / 100);
    document.getElementById('report-payments').textContent = money(received / 100);
    document.getElementById('report-outstanding').textContent = money(outstanding / 100);
    document.getElementById('report-table-title').textContent = 'Bookings and Payments';
    heading.textContent = 'Bookings departing ' + displayDate(from) + ' – ' + displayDate(to)
        + ' · Resource: ' + (heading.dataset.resourceLabel || 'All resources')
        + ' · Client: ' + (heading.dataset.clientLabel || 'All clients')
        + ' · Payment status: ' + (heading.dataset.paymentLabel || 'All payment statuses');
    document.getElementById('report-results').hidden = false;
    document.getElementById('print-button').disabled = false;
}

// Add a text-only table cell and optionally place a smaller second line beneath it.
function addCell(row, text, detail = '') {
    // textContent prevents saved names or contact details from being interpreted as HTML.
    const cell = document.createElement('td');
    cell.textContent = text;

    if (detail) {
        // Put secondary information on a smaller second line without adding another column.
        const small = document.createElement('small');
        small.textContent = detail;
        cell.appendChild(small);
    }

    row.appendChild(cell);
    return cell;
}

// Add a colored status badge whose CSS class is selected from the status text.
function addStatus(row, status) {
    // The blank cell becomes the badge container after its status-specific class is applied.
    const cell = addCell(row, '');
    const badge = document.createElement('span');
    badge.className = 'status-badge status-' + status.toLowerCase();
    badge.textContent = status;
    cell.appendChild(badge);
    return cell;
}

// Add a small table button and connect its click to the supplied action function.
function addAction(cell, text, action, danger = false) {
    // Danger actions receive a separate class so removal and cancellation can be colored red.
    const button = document.createElement('button');
    button.type = 'button';
    button.className = danger ? 'table-action danger-action' : 'table-action';
    button.textContent = text;
    button.addEventListener('click', action);
    cell.appendChild(button);
}

// Insert one spanning message row only when a table currently has no data rows.
function emptyTable(body, count, text) {
    // The column count must match the table header so the message fills the entire row.
    if (!body.children.length) {
        // Use one safe text cell that spans the table instead of leaving a confusing blank panel.
        const row = document.createElement('tr');
        const cell = addCell(row, text);
        cell.colSpan = count;
        cell.className = 'empty-state';
        body.appendChild(row);
    }
}

// Check a row's searchable text and status against the controls in its section.
function matchesFilters(sectionId, text, status) {
    // data-search and data-filter are shared attributes, so the same check works for several tables.
    const section = document.getElementById(sectionId);
    const search = section.querySelector('[data-search]').value.trim().toLowerCase();
    const filterInput = section.querySelector('[data-filter]');
    const filter = filterInput ? filterInput.value : 'all';
    return text.toLowerCase().includes(search) && (filter === 'all' || status === filter);
}

// Draw the staff boat-selection cards using the current search, type, capacity, and status filters.
function renderBoatCatalog(records) {
    // These controls are rebuilt from current resources so new boat types appear automatically.
    const grid = document.getElementById('boat-card-grid');
    const typeSelect = document.getElementById('boat-type');
    // Unique boat types become the filter menu choices.
    const types = Array.from(new Set(records.resources.map(function (resource) {
        return resource.type;
    }))).sort();
    // Cache the option list signature to preserve the chosen type when nothing has changed.
    const typeSignature = JSON.stringify(types);

    if (typeSelect.dataset.types !== typeSignature) {
        const selectedType = typeSelect.value;
        typeSelect.replaceChildren();
        addOption(typeSelect, '', 'All types');
        types.forEach(function (type) { addOption(typeSelect, type, type); });
        typeSelect.value = types.includes(selectedType) ? selectedType : '';
        typeSelect.dataset.types = typeSignature;
    }

    // Read the four filters once, then use them to decide which boats become cards.
    const search = document.getElementById('boat-search').value.trim().toLowerCase();
    const capacity = Number(document.getElementById('boat-capacity').value);
    const status = document.getElementById('boat-status').value;
    // Filter the full fleet; hidden boats remain in storage and are not deleted by search.
    const boats = records.resources.filter(function (resource) {
        return (resource.name + ' ' + resource.type).toLowerCase().includes(search)
            && (!typeSelect.value || resource.type === typeSelect.value)
            && resource.capacity >= capacity
            && (status === 'all' || resource.status === status);
    });

    document.getElementById('boat-results-count').textContent = boats.length + (boats.length === 1 ? ' boat' : ' boats');
    grid.replaceChildren();

    boats.forEach(function (resource) {
        // Build each card from safe DOM elements instead of inserting saved text as HTML.
        const card = document.createElement('article');
        card.className = 'boat-card';
        const media = document.createElement('div');
        media.className = 'boat-card-media';
        const placeholder = document.createElement('span');
        placeholder.className = 'boat-photo-placeholder';
        placeholder.textContent = 'No photo available';
        media.appendChild(placeholder);

        if (resource.image) {
            const photo = document.createElement('img');
            photo.src = resource.image;
            photo.alt = resource.name;
            photo.loading = 'lazy';
            placeholder.hidden = true;
            photo.addEventListener('error', function () {
                photo.hidden = true;
                placeholder.hidden = false;
            });
            media.appendChild(photo);
        }

        const content = document.createElement('div');
        content.className = 'boat-card-content';
        const heading = document.createElement('h3');
        heading.textContent = resource.name;
        const badges = document.createElement('div');
        badges.className = 'boat-card-badges';
        const type = document.createElement('span');
        type.textContent = resource.type;
        const badge = document.createElement('span');
        badge.className = 'status-badge status-' + resource.status.toLowerCase();
        badge.textContent = resource.status === 'Available' ? 'Open for bookings' : resource.status;
        badges.append(type, badge);

        const specs = document.createElement('dl');
        specs.className = 'boat-card-specs';
        [['Capacity', resource.capacity + ' guests'], ['Rate per hour', money(resource.rate)]].forEach(function (spec) {
            const group = document.createElement('div');
            const label = document.createElement('dt');
            label.textContent = spec[0];
            const value = document.createElement('dd');
            value.textContent = spec[1];
            group.append(label, value);
            specs.appendChild(group);
        });

        // The card button is disabled unless the boat is saved as Available.
        const book = document.createElement('button');
        book.type = 'button';
        book.className = 'primary-button';
        book.disabled = resource.status !== 'Available';
        book.textContent = book.disabled ? 'Unavailable' : 'Book this boat →';
        book.setAttribute('aria-label', book.disabled ? resource.name + ' is unavailable' : 'Book ' + resource.name);
        book.addEventListener('click', function () {
            openRecordForm('bookings', '', resource.id);
        });

        content.append(heading, badges, specs, book);
        card.append(media, content);
        grid.appendChild(card);
    });

    if (!boats.length) {
        const empty = document.createElement('p');
        empty.className = 'boat-catalog-empty';
        empty.textContent = records.resources.length ? 'No boats match your filters.' : 'No boats available yet.';
        grid.appendChild(empty);
    }
}

// Rebuild every management view and summary from the latest shared browser records.
function renderPortal() {
    // index.php does not have these screens, so this renderer safely exits on the login page.
    if (!document.getElementById('resources')) {
        return;
    }

    let records;

    try {
        records = readRecords();
    } catch (error) {
        showMessage('Records could not be loaded.');
        return;
    }

    // Active excludes cancelled rentals and is reused for availability and dashboard calculations.
    const active = records.bookings.filter(function (booking) {
        return booking.status !== 'Cancelled';
    });
    const resourceBody = document.querySelector('#resources tbody');
    resourceBody.replaceChildren();

    records.resources.forEach(function (resource) {
        // A boat can display Booked during a live rental even if its saved fleet status is Available.
        const inUse = active.some(function (booking) {
            return booking.resourceId === resource.id
                && new Date(booking.start) <= new Date() && new Date(booking.end) > new Date();
        });
        const status = resource.status === 'Available' && inUse ? 'Booked' : resource.status;

        if (!matchesFilters('resources', resource.name + ' ' + resource.type, status)) {
            return;
        }

        const row = document.createElement('tr');
        const nameCell = addCell(row, resource.name);

        if (resource.image) {
            const thumbnail = document.createElement('img');
            thumbnail.className = 'resource-thumb';
            thumbnail.src = resource.image;
            thumbnail.alt = resource.name;
            nameCell.prepend(thumbnail);
        }

        addCell(row, resource.type);
        addCell(row, resource.capacity + ' guests');
        addCell(row, money(resource.rate) + ' / hour');
        addStatus(row, status);
        const actions = addCell(row, '');

        if (resource.status === 'Available') {
            addAction(actions, 'Book', function () { openRecordForm('bookings', '', resource.id); });
        }

        if (!isStaff) {
            // Only administrators can change or remove shared fleet resources.
            addAction(actions, 'Edit', function () { openRecordForm('resources', resource.id); });
            addAction(actions, 'Remove', function () { removeManagedRecord('resources', resource.id); }, true);
        }

        resourceBody.appendChild(row);
    });

    emptyTable(resourceBody, 6, records.resources.length ? 'No resources match the selected filters.' : 'The administrator can add resources here.');

    const bookingBody = document.querySelector('#bookings tbody');
    bookingBody.replaceChildren();

    records.bookings.slice().reverse().forEach(function (booking) {
        const reference = 'BK-' + booking.id.slice(0, 8).toUpperCase();

        if (!matchesFilters('bookings', [reference, booking.client, booking.resourceName, booking.bookedBy, booking.staffName].join(' '), booking.status)) {
            return;
        }

        const row = document.createElement('tr');
        addCell(row, reference, booking.guests + ' guests');
        addCell(row, booking.client);
        addCell(row, booking.resourceName, money(booking.total));
        addCell(row, dateTime(booking.start), 'to ' + dateTime(booking.end));
        const statusCell = addStatus(row, booking.status);

        if (booking.cancelledBy) {
            const detail = document.createElement('small');
            detail.textContent = 'Cancelled by ' + booking.cancelledBy + (booking.cancelledAt ? ' · ' + dateTime(booking.cancelledAt) : '');
            statusCell.appendChild(detail);
        }

        addCell(row, booking.bookedBy, booking.bookedRole === 'staff' ? 'Staff' : 'Administrator');
        addCell(row, booking.staffName || '—');
        const actions = addCell(row, '');

        if (booking.status !== 'Cancelled') {
            addAction(actions, 'Cancel booking', function () { cancelBooking(booking.id); }, true);
        } else {
            actions.textContent = '—';
        }

        bookingBody.appendChild(row);
    });

    emptyTable(bookingBody, 8, records.bookings.length ? 'No bookings match the selected filters.' : 'No bookings yet. Choose New booking to start.');

    const clientBody = document.querySelector('#clients tbody');
    clientBody.replaceChildren();

    records.clients.forEach(function (client) {
        if (!matchesFilters('clients', [client.name, client.email, client.phone, client.address].join(' '), '')) {
            return;
        }

        const row = document.createElement('tr');
        // Count all bookings for this client, including completed and cancelled history.
        const bookingCount = records.bookings.filter(function (booking) {
            return booking.clientId === client.id;
        }).length;

        addCell(row, client.name, client.address);
        addCell(row, client.email);
        addCell(row, client.phone);
        addCell(row, bookingCount);
        const actions = addCell(row, '');
        addAction(actions, 'Edit', function () { openRecordForm('clients', client.id); });
        addAction(actions, 'Remove', function () { removeManagedRecord('clients', client.id); }, true);
        clientBody.appendChild(row);
    });

    emptyTable(clientBody, 5, records.clients.length ? 'No clients match your search.' : 'No clients to display.');

    const staffBody = document.querySelector('#staff tbody');
    staffBody.replaceChildren();

    records.staff.forEach(function (member) {
        if (!matchesFilters('staff', [member.name, member.role, member.phone, member.email].join(' '), member.status)) {
            return;
        }

        const row = document.createElement('tr');
        addCell(row, member.name, member.email);
        addCell(row, member.role);
        addCell(row, member.phone);
        addStatus(row, member.status);
        const actions = addCell(row, '');
        addAction(actions, 'Edit', function () { openRecordForm('staff', member.id); });
        addAction(actions, 'Remove', function () { removeManagedRecord('staff', member.id); }, true);
        staffBody.appendChild(row);
    });

    emptyTable(staffBody, 5, records.staff.length ? 'No staff match the selected filters.' : 'No staff to display.');

    // Upcoming includes active reservations whose return time has not passed, ordered by departure.
    const upcoming = active.filter(function (booking) {
        return new Date(booking.end) > new Date();
    }).sort(function (first, second) {
        return new Date(first.start) - new Date(second.start);
    });
    const dashboardBody = document.querySelector('#dashboard tbody');
    dashboardBody.replaceChildren();

    upcoming.slice(0, 5).forEach(function (booking) {
        const row = document.createElement('tr');
        addCell(row, 'BK-' + booking.id.slice(0, 8).toUpperCase());
        addCell(row, booking.client, 'Booked by ' + booking.bookedBy);
        addCell(row, booking.resourceName);
        addCell(row, dateTime(booking.start));
        addStatus(row, booking.status);
        dashboardBody.appendChild(row);
    });

    emptyTable(dashboardBody, 5, 'No upcoming bookings.');

    // Count boats that are both enabled for booking and not currently in use.
    const availableNow = records.resources.filter(function (resource) {
        return resource.status === 'Available' && !active.some(function (booking) {
            return booking.resourceId === resource.id
                && new Date(booking.start) <= new Date() && new Date(booking.end) > new Date();
        });
    }).length;
    const cards = document.querySelectorAll('#dashboard .summary-value');
    cards[0].textContent = records.resources.length;
    cards[1].textContent = availableNow;
    cards[2].textContent = upcoming.length;
    cards[3].textContent = active.filter(function (booking) {
        return paymentBalance(records, booking) > 0;
    }).length;

    renderSchedule(records, active);
    renderBoatCatalog(records);
    renderPayments(records);
    updateReportFilters(records);
    renderReport(records);
}

// Draw the selected day's morning, afternoon, and evening booking blocks for every boat.
function renderSchedule(records, activeBookings) {
    // The chosen date comes from the date input and is refreshed by its navigation buttons.
    const body = document.querySelector('#availability tbody');
    // day is an empty string until the user chooses a date in the schedule control.
    const day = document.getElementById('schedule-date').value;
    body.replaceChildren();

    if (day) {
        records.resources.forEach(function (resource) {
            const row = document.createElement('tr');
            addCell(row, resource.name);

            // Each pair defines one schedule block as its start and end hour on the chosen day.
            [[0, 12], [12, 18], [18, 24]].forEach(function (period) {
                const start = new Date(day + 'T00:00:00');
                const end = new Date(day + 'T00:00:00');
                start.setHours(period[0]);
                end.setHours(period[1]);

                // A block is booked if any active reservation overlaps its time range.
                const booked = activeBookings.some(function (booking) {
                    return booking.resourceId === resource.id && overlaps(start, end, booking.start, booking.end);
                });
                const status = resource.status !== 'Available' ? resource.status : (booked ? 'Booked' : 'Available');
                addStatus(row, status);
            });

            body.appendChild(row);
        });
    }

    emptyTable(body, 4, day ? 'No resources have been added yet.' : 'Select a date to view availability.');
}

// Attach boat-catalog filter events only on the management page where those controls exist.
if (screens.length) {
    document.getElementById('boat-search').addEventListener('input', renderPortal);
    ['boat-type', 'boat-capacity', 'boat-status'].forEach(function (id) {
        document.getElementById(id).addEventListener('change', renderPortal);
    });
    document.getElementById('reset-boat-filters').addEventListener('click', function () {
        document.getElementById('boat-search').value = '';
        document.getElementById('boat-type').value = '';
        document.getElementById('boat-capacity').value = '0';
        document.getElementById('boat-status').value = 'all';
        renderPortal();
    });

    // Use one role label to keep the top bar, welcome text, and account placeholders in sync.
    const roleName = isStaff ? 'Staff' : 'Administrator';
    document.getElementById('portal-label').textContent = isStaff ? 'STAFF WORKSPACE' : 'ADMINISTRATION';
    document.getElementById('profile-name').textContent = roleName;
    document.getElementById('profile-role').textContent = isStaff ? 'Staff' : 'Admin';
    document.getElementById('profile-letter').textContent = isStaff ? 'S' : 'A';
    document.getElementById('welcome-name').textContent = roleName + '.';
    document.getElementById('portal-footer').textContent = isStaff ? 'STAFF PORTAL' : 'ADMIN PORTAL';
    document.querySelectorAll('[data-admin-only]').forEach(function (button) {
        button.hidden = isStaff;
    });

    // The account form is not saved yet; these placeholders only show the current demo identity.
    const accountInputs = document.querySelectorAll('#account-form input');
    accountInputs[0].placeholder = roleName;
    accountInputs[1].placeholder = isStaff ? 'staff123' : 'admin123';

    renderPortal();

    // Refresh another open tab when it changes the shared browser data key.
    window.addEventListener('storage', function (event) {
        if (event.key === storageKey || event.key === null) {
            renderPortal();
        }
    });

    // Also refresh when returning to this tab after changing records elsewhere.
    window.addEventListener('focus', renderPortal);
}

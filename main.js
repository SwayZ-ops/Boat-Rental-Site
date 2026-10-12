'use strict';

// Fixed username password Login admin123/admin123 staff123/staff123
const portalRole = new URLSearchParams(window.location.search).get('role') === 'staff'
    ? 'staff'
    : 'admin';
const isStaff = portalRole === 'staff';
const storageKey = 'boatRental.sharedRecords.v1';
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
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

// for the sidebar and navi
const screens = document.querySelectorAll('.screen');
const sidebar = document.getElementById('sidebar');
const menuButton = document.getElementById('menu-button');

function closeMenu() {
    if (sidebar) {
        sidebar.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
    }
}

function showScreen() {
    const requestedId = window.location.hash.slice(1) || 'dashboard';
    const selected = Array.from(screens).find(function (screen) {
        return screen.id === requestedId;
    }) || document.getElementById('dashboard');

    screens.forEach(function (screen) {
        screen.hidden = screen !== selected;
    });

    document.getElementById('page-title').textContent = selected.dataset.title;
    document.title = selected.dataset.title + ' | Boat Rental';

    document.querySelectorAll('.nav-item[href^="#"]').forEach(function (link) {
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


let toastTimer;

function showMessage(message) {
    const toast = document.getElementById('toast');

    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;

    toastTimer = setTimeout(function () {
        toast.hidden = true;
    }, 4000);
}


const formLayouts = {
    resources: {
        title: 'Add resource',
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
        fields: [
            ['Booking', 'select', 'bookingId'],
            ['Amount (PHP)', 'number', 'amount'],
            ['Payment method', 'select', 'method'],
            ['Reference number (optional)', 'text', 'reference']
        ]
    },
    clients: {
        title: 'Add client',
        fields: [
            ['Full name', 'text', 'name'],
            ['Email', 'email', 'email'],
            ['Phone', 'tel', 'phone'],
            ['Address', 'text', 'address']
        ]
    },
    staff: {
        title: 'Add staff member',
        fields: [
            ['Full name', 'text', 'name'],
            ['Role', 'text', 'role'],
            ['Phone', 'tel', 'phone'],
            ['Email', 'email', 'email'],
            ['Status', 'select', 'status']
        ]
    }
};

const dialog = document.getElementById('record-dialog');

document.querySelectorAll('[data-form]').forEach(function (button) {
    button.addEventListener('click', function () {
        openRecordForm(button.dataset.form);
    });
});

document.querySelectorAll('[data-close-dialog]').forEach(function (button) {
    button.addEventListener('click', function () {
        dialog.close();
    });
});

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

// Empty table after search
document.querySelectorAll('.panel').forEach(function (panel) {
    const search = panel.querySelector('[data-search]');
    const filter = panel.querySelector('[data-filter]');
    const empty = panel.querySelector('[data-empty]');

    if (!empty) {
        return;
    }

    const originalMessage = empty.textContent;

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

// dates
function dateValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return year + '-' + month + '-' + day;
}

function displayDate(value) {
    return new Date(value + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

const scheduleDate = document.getElementById('schedule-date');

if (scheduleDate) {
    function updateSchedule() {
        document.getElementById('schedule-heading').textContent = scheduleDate.value
            ? 'Schedule for ' + displayDate(scheduleDate.value)
            : 'Select a date';

        renderPortal();
    }

    function changeDay(amount) {
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

// reports and print buttons
const reportForm = document.getElementById('report-form');

if (reportForm) {
    const today = new Date();
    document.getElementById('report-from').value = dateValue(new Date(today.getFullYear(), today.getMonth(), 1));
    document.getElementById('report-to').value = dateValue(today);

    reportForm.addEventListener('input', function () {
        const heading = document.getElementById('report-period');
        delete heading.dataset.from;
        delete heading.dataset.to;
        heading.textContent = '';
        document.getElementById('report-results').hidden = true;
        document.getElementById('print-button').disabled = true;
    });

    reportForm.addEventListener('submit', function (event) {
        event.preventDefault();

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
    accountForm.addEventListener('submit', function (event) {
        event.preventDefault();
        showMessage('Saved.');
    });
}



function readRecords() {
    const saved = localStorage.getItem(storageKey);

    if (!saved) {
        return { resources: [], bookings: [], clients: [], staff: [], payments: [] };
    }

    const records = JSON.parse(saved);

    if (records.clients === undefined) {
        records.clients = [];
    }

    if (records.staff === undefined) {
        records.staff = [];
    }

    if (records.payments === undefined) {
        records.payments = [];
    }

    if (!Array.isArray(records.resources) || !Array.isArray(records.bookings) || !Array.isArray(records.clients) || !Array.isArray(records.staff) || !Array.isArray(records.payments)) {
        throw new Error('The saved browser records could not be read.');
    }

    return records;
}

function writeRecords(records) {
    localStorage.setItem(storageKey, JSON.stringify(records));
    renderPortal();
}

function readImage(file) {
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

function newId() {
    return window.crypto.randomUUID();
}

function money(amount) {
    return '₱' + Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function dateTime(value) {
    return new Date(value).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

function overlaps(start, end, otherStart, otherEnd) {
    return new Date(start) < new Date(otherEnd) && new Date(end) > new Date(otherStart);
}

function addOption(select, value, text) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    select.appendChild(option);
}

function staffIsAvailable(records, member, start, end) {
    return member.status === 'Active' && !records.bookings.some(function (booking) {
        return booking.staffId === member.id && booking.status !== 'Cancelled'
            && overlaps(start, end, booking.start, booking.end);
    });
}

function updateStaffOptions() {
    const select = previewForm.elements.namedItem('staffId');
    const selectedId = select.value;
    const start = previewForm.elements.namedItem('start').value;
    const end = previewForm.elements.namedItem('end').value;
    select.replaceChildren();
    addOption(select, '', 'Choose available staff…');

    try {
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

function openRecordForm(kind, editId = '', resourceId = '') {
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

    const layout = formLayouts[kind];
    const fields = document.getElementById('dialog-fields');
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
        const label = document.createElement('label');
        const input = document.createElement(field[1] === 'select' ? 'select' : 'input');
        label.textContent = field[0];
        input.name = field[2] || '';
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

async function savePortalRecord() {
    const errorBox = document.getElementById('dialog-error');
    const saveButton = document.getElementById('dialog-save');

    if (saveButton.disabled) {
        return;
    }

    saveButton.disabled = true;
    errorBox.hidden = true;

    try {
        // reads the records
        let records = readRecords();
        const values = Object.fromEntries(new FormData(previewForm));
        const kind = dialog.dataset.kind;
        const editId = dialog.dataset.editId;

        if (kind === 'resources') {
            if (isStaff) {
                throw new Error('Only the administrator can add or edit resources.');
            }

            const capacity = Number(values.capacity);
            const rate = Number(values.rate);
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

            const uploadedImage = imageFile ? await readImage(imageFile) : '';
            records = readRecords();
            const index = records.resources.findIndex(function (resource) {
                return resource.id === editId;
            });

            if (editId && index === -1) {
                throw new Error('This resource no longer exists. Close the form and try again.');
            }

            const existing = editId ? records.resources[index] : null;

            const futureBookings = records.bookings.filter(function (booking) {
                return booking.resourceId === editId && booking.status !== 'Cancelled' && new Date(booking.end) > new Date();
            });

            if (futureBookings.length && values.status !== 'Available') {
                throw new Error('Cancel the resource’s upcoming bookings before changing its availability.');
            }

            if (futureBookings.some(function (booking) { return booking.guests > capacity; })) {
                throw new Error('The new capacity is lower than an upcoming booking’s guest count.');
            }

            const resource = {
                id: editId || newId(),
                name: values.name.trim(),
                type: values.type.trim(),
                capacity: capacity,
                rate: Math.round(rate * 100) / 100,
                status: values.status,
                image: imageFile ? uploadedImage : (existing ? existing.image || '' : '')
            };

            if (editId) {
                records.resources[index] = resource;
            } else {
                records.resources.push(resource);
            }
        } else if (kind === 'payments') {
            const booking = records.bookings.find(function (item) { return item.id === values.bookingId; });
            const amount = Number(values.amount);
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
        } else if (kind === 'clients') {
            const name = values.name.trim();
            const email = values.email.trim();
            const phone = values.phone.trim();
            const address = values.address.trim();

            if (!name || !email || !phone || !address) {
                throw new Error('Enter the client’s name, email, phone, and address.');
            }

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
        } else if (kind === 'staff') {
            const name = values.name.trim();
            const role = values.role.trim();
            const phone = values.phone.trim();
            const email = values.email.trim();

            if (!name || !role || !phone || !email || !['Active', 'Inactive'].includes(values.status)) {
                throw new Error('Enter the staff member’s details and select a valid status.');
            }

            const index = records.staff.findIndex(function (member) {
                return member.id === editId;
            });

            if (editId && index === -1) {
                throw new Error('This staff member no longer exists.');
            }

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
        } else if (kind === 'bookings') {
            const client = records.clients.find(function (item) {
                return item.id === values.clientId;
            });
            const resource = records.resources.find(function (item) {
                return item.id === values.resourceId;
            });
            const start = new Date(values.start);
            const end = new Date(values.end);
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

            const conflict = records.bookings.some(function (booking) {
                return booking.resourceId === resource.id && booking.status !== 'Cancelled'
                    && overlaps(values.start, values.end, booking.start, booking.end);
            });

            if (conflict) {
                throw new Error('This resource is already booked for those times.');
            }

            const hours = Math.ceil((end - start) / 3600000);

            if (hours > 24 * 365) {
                throw new Error('Choose a rental period shorter than one year.');
            }

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

        writeRecords(records);
        dialog.close();
        previewForm.reset();
        if (kind === 'bookings' && isStaff) {
            window.location.hash = 'bookings';
        }
        const messages = {
            resources: 'Resource saved. Staff can now see it.',
            bookings: 'Booking saved. It is now visible in the admin and staff views.',
            clients: 'Client saved.',
            staff: 'Staff member saved.',
            payments: 'Payment recorded.'
        };
        showMessage(messages[kind]);
    } catch (error) {
        errorBox.textContent = error.name === 'QuotaExceededError' || error.name === 'SecurityError'
            ? 'Browser storage is unavailable or full. The record was not saved.'
            : error.message;
        errorBox.hidden = false;
    } finally {
        saveButton.disabled = false;
    }
}

function cancelBooking(id) {
    try {
        const records = readRecords();
        const booking = records.bookings.find(function (item) { return item.id === id; });

        if (!booking || booking.status === 'Cancelled') {
            showMessage('This booking was already cancelled or is no longer available.');
            renderPortal();
            return;
        }

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
    document.querySelectorAll('[data-close-cancel]').forEach(function (button) {
        button.addEventListener('click', function () {
            document.getElementById('cancel-dialog').close();
        });
    });

    cancelForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const errorBox = document.getElementById('cancel-error');
        errorBox.hidden = true;

        try {
            const records = readRecords();
            const cancelDialog = document.getElementById('cancel-dialog');
            const booking = records.bookings.find(function (item) {
                return item.id === cancelDialog.dataset.bookingId;
            });
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

function removeManagedRecord(kind, id) {
    const label = kind === 'clients' ? 'client' : 'staff member';

    if (!window.confirm('Remove this ' + label + '?')) {
        return;
    }

    try {
        const records = readRecords();
        const collection = records[kind];
        const index = collection.findIndex(function (record) {
            return record.id === id;
        });

        if (index === -1) {
            showMessage('This ' + label + ' no longer exists.');
            renderPortal();
            return;
        }

        if (kind === 'staff') {
            const hasUpcomingBooking = records.bookings.some(function (booking) {
                return booking.staffId === id && booking.status !== 'Cancelled' && new Date(booking.end) > new Date();
            });

            if (hasUpcomingBooking) {
                showMessage('Cancel or reassign this staff member’s upcoming bookings before removing them.');
                return;
            }
        }

        collection.splice(index, 1);
        writeRecords(records);
        renderPortal();
        showMessage(kind === 'clients'
            ? 'Client removed. Existing bookings keep their saved client details.'
            : 'Staff member removed. Existing bookings keep their saved staff details.');
    } catch (error) {
        showMessage(error.name === 'QuotaExceededError' || error.name === 'SecurityError'
            ? 'Browser storage is unavailable. The record was not removed.'
            : error.message);
    }
}

function receivedPayment(records, bookingId) {
    return records.payments.filter(function (payment) {
        return payment.bookingId === bookingId;
    }).reduce(function (total, payment) {
        return total + Math.round(Number(payment.amount) * 100);
    }, 0);
}

function paymentBalance(records, booking) {
    return Math.max(0, Math.round(Number(booking.total) * 100) - receivedPayment(records, booking.id));
}

function bookingPaymentStatus(records, booking) {
    if (booking.status === 'Cancelled') {
        return 'Cancelled';
    }

    if (paymentBalance(records, booking) === 0) {
        return 'Paid';
    }

    return receivedPayment(records, booking.id) > 0 ? 'Partial' : 'Unpaid';
}

function renderPayments(records) {
    const body = document.querySelector('#payments tbody');
    body.replaceChildren();

    records.bookings.slice().reverse().forEach(function (booking) {
        const payments = records.payments.filter(function (payment) { return payment.bookingId === booking.id; });
        const paid = receivedPayment(records, booking.id);

        if (booking.status === 'Cancelled' && !payments.length) {
            return;
        }

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

function updateReportFilters(records) {
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

    [
        ['report-resource', 'All resources', resources],
        ['report-client', 'All clients', clients]
    ].forEach(function (filter) {
        const select = document.getElementById(filter[0]);
        const selected = select.value;
        const options = Array.from(filter[2]).sort(function (first, second) {
            return first[1].localeCompare(second[1]);
        });
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

function renderReport(records) {
    const heading = document.getElementById('report-period');
    const from = heading.dataset.from;
    const to = heading.dataset.to;
    const resourceId = heading.dataset.resource || '';
    const clientId = heading.dataset.client || '';
    const paymentFilter = heading.dataset.paymentStatus || 'all';

    if (!from || !to) {
        return;
    }

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
    let bookedValue = 0;
    let received = 0;
    let outstanding = 0;
    const body = document.getElementById('report-bookings');
    body.replaceChildren();

    bookings.forEach(function (booking) {
        const cancelled = booking.status === 'Cancelled';
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

//table cells for enetred names
function addCell(row, text, detail = '') {
    const cell = document.createElement('td');
    cell.textContent = text;

    if (detail) {
        const small = document.createElement('small');
        small.textContent = detail;
        cell.appendChild(small);
    }

    row.appendChild(cell);
    return cell;
}

function addStatus(row, status) {
    const cell = addCell(row, '');
    const badge = document.createElement('span');
    badge.className = 'status-badge status-' + status.toLowerCase();
    badge.textContent = status;
    cell.appendChild(badge);
    return cell;
}

function addAction(cell, text, action, danger = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = danger ? 'table-action danger-action' : 'table-action';
    button.textContent = text;
    button.addEventListener('click', action);
    cell.appendChild(button);
}

function emptyTable(body, count, text) {
    if (!body.children.length) {
        const row = document.createElement('tr');
        const cell = addCell(row, text);
        cell.colSpan = count;
        cell.className = 'empty-state';
        body.appendChild(row);
    }
}

function matchesFilters(sectionId, text, status) {
    const section = document.getElementById(sectionId);
    const search = section.querySelector('[data-search]').value.trim().toLowerCase();
    const filterInput = section.querySelector('[data-filter]');
    const filter = filterInput ? filterInput.value : 'all';
    return text.toLowerCase().includes(search) && (filter === 'all' || status === filter);
}

function renderBoatCatalog(records) {
    const grid = document.getElementById('boat-card-grid');
    const typeSelect = document.getElementById('boat-type');
    const types = Array.from(new Set(records.resources.map(function (resource) {
        return resource.type;
    }))).sort();
    const typeSignature = JSON.stringify(types);

    if (typeSelect.dataset.types !== typeSignature) {
        const selectedType = typeSelect.value;
        typeSelect.replaceChildren();
        addOption(typeSelect, '', 'All types');
        types.forEach(function (type) { addOption(typeSelect, type, type); });
        typeSelect.value = types.includes(selectedType) ? selectedType : '';
        typeSelect.dataset.types = typeSignature;
    }

    const search = document.getElementById('boat-search').value.trim().toLowerCase();
    const capacity = Number(document.getElementById('boat-capacity').value);
    const status = document.getElementById('boat-status').value;
    const boats = records.resources.filter(function (resource) {
        return (resource.name + ' ' + resource.type).toLowerCase().includes(search)
            && (!typeSelect.value || resource.type === typeSelect.value)
            && resource.capacity >= capacity
            && (status === 'all' || resource.status === status);
    });

    document.getElementById('boat-results-count').textContent = boats.length + (boats.length === 1 ? ' boat' : ' boats');
    grid.replaceChildren();

    boats.forEach(function (resource) {
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

function renderPortal() {
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

    const active = records.bookings.filter(function (booking) {
        return booking.status !== 'Cancelled';
    });
    const resourceBody = document.querySelector('#resources tbody');
    resourceBody.replaceChildren();

    records.resources.forEach(function (resource) {
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
            addAction(actions, 'Edit', function () { openRecordForm('resources', resource.id); });
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

function renderSchedule(records, activeBookings) {
    const body = document.querySelector('#availability tbody');
    const day = document.getElementById('schedule-date').value;
    body.replaceChildren();

    if (day) {
        records.resources.forEach(function (resource) {
            const row = document.createElement('tr');
            addCell(row, resource.name);

            [[0, 12], [12, 18], [18, 24]].forEach(function (period) {
                const start = new Date(day + 'T00:00:00');
                const end = new Date(day + 'T00:00:00');
                start.setHours(period[0]);
                end.setHours(period[1]);

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

    const accountInputs = document.querySelectorAll('#account-form input');
    accountInputs[0].placeholder = roleName;
    accountInputs[1].placeholder = isStaff ? 'staff123' : 'admin123';

    renderPortal();

    window.addEventListener('storage', function (event) {
        if (event.key === storageKey || event.key === null) {
            renderPortal();
        }
    });

    window.addEventListener('focus', renderPortal);
}

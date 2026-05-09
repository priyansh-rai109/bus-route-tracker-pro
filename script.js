// --- SPA Routing & Navigation ---
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.app-view');

function switchView(targetId) {
    views.forEach(view => view.classList.remove('active'));
    const targetView = document.getElementById(`view-${targetId}`);
    if (targetView) targetView.classList.add('active');

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-target') === targetId) {
            item.classList.add('active');
        }
    });

    if(targetId !== 'dashboard') {
        showNotification('Module Loaded', `Accessing ${targetId.toUpperCase()} tactical interface...`, 'info');
    }
}

navItems.forEach(item => {
    item.addEventListener('click', () => {
        switchView(item.getAttribute('data-target'));
    });
});

// --- Role Switcher ---
function switchRole(role, element) {
    const tabs = document.querySelectorAll('.role-tab');
    tabs.forEach(t => t.classList.remove('active'));
    element.classList.add('active');
    showNotification('Identity Verified', `Privileges granted for: ${role.toUpperCase()}`, 'info');
}

// --- Notifications ---
const popup = document.getElementById('notif-popup');
const notifTitle = document.getElementById('notif-title');
const notifMsg = document.getElementById('notif-msg');
const notifIcon = document.getElementById('notif-icon');
let hideTimeout;

function showNotification(title, message, type = 'info') {
    clearTimeout(hideTimeout);
    notifTitle.innerText = title;
    notifMsg.innerText = message;
    
    popup.classList.remove('sos');
    if (type === 'sos') {
        popup.classList.add('sos');
        notifIcon.innerHTML = '<i class="ti ti-alert-octagon"></i>';
    } else {
        notifIcon.innerHTML = '<i class="ti ti-info-square-rounded"></i>';
    }

    popup.classList.add('show');
    hideTimeout = setTimeout(() => popup.classList.remove('show'), 4000);
}

// --- SOS Trigger ---
function triggerSOS() {
    showNotification('EMERGENCY SOS', 'IMMEDIATE ACTION REQUIRED: GPS tracking locked. Security dispatched.', 'sos');
    document.body.style.animation = 'none';
    document.body.offsetHeight;
    document.body.style.animation = 'pulse 0.2s 5';
}

// --- Dashboard Logic ---
function selectBus(element, busId) {
    const rows = document.querySelectorAll('.bus-row');
    rows.forEach(r => r.classList.remove('selected'));
    element.classList.add('selected');
    showNotification(`TRACKING ${busId}`, `Satellite handshake established. Coordinates: ${(Math.random() * 100).toFixed(4)}°N, ${(Math.random() * 100).toFixed(4)}°E`, 'info');
}

setInterval(() => {
    document.querySelectorAll('.bus-speed').forEach(speed => {
        if (!speed.innerText.includes('0 km/h')) {
            const current = parseInt(speed.innerText);
            const delta = Math.floor(Math.random() * 5) - 2;
            speed.innerText = `${Math.max(20, Math.min(60, current + delta))} km/h`;
        }
    });
}, 3000);

let etaSeconds = 165;
setInterval(() => {
    etaSeconds -= 3;
    if (etaSeconds <= 1) etaSeconds = 300; 
    const el = document.getElementById('eta-timer');
    if(el) el.innerText = `${Math.floor(etaSeconds / 60).toString().padStart(2, '0')}:${(etaSeconds % 60).toString().padStart(2, '0')}`;
}, 3000);

function updateDate() {
    const el = document.getElementById('current-date');
    if(el) el.innerHTML = `<i class="ti ti-clock"></i> ${new Date().toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
}
updateDate();
setInterval(updateDate, 1000);

// ==========================================
// --- MOCK DATA GENERATORS ---
// ==========================================

// Students
const students = Array.from({length: 45}, (_, i) => ({
    id: `STU${1000 + i}`,
    name: ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Ayaan", "Krishna"][i % 8] + " " + ["Sharma", "Gupta", "Singh", "Patel", "Kumar", "Joshi"][i % 6],
    route: ["JT-01", "JT-02", "JT-03"][i % 3],
    stop: ["Sector A-10", "Sector B-22", "Sector C-05", "Main Gate"][i % 4],
    status: Math.random() > 0.8 ? (Math.random() > 0.5 ? "Dropped" : "Missed") : "On Board",
    time: `07:${10 + Math.floor(Math.random() * 40)} AM`,
    parent: `Guardian ${i}`,
    contact: `+91 9${Math.floor(Math.random() * 899999999 + 100000000)}`
}));

// Drivers
const drivers = [
    { name: "Ramesh Kumar", license: "DL-14-2015-894", route: "JT-01 ALPHA", rating: 4.8, status: "Active" },
    { name: "Suresh Singh", license: "DL-14-2018-112", route: "JT-02 BETA", rating: 4.9, status: "Active" },
    { name: "Mohammad Ali", license: "DL-14-2012-445", route: "JT-03 GAMMA", rating: 4.7, status: "Active" },
    { name: "Vikram Das", license: "DL-14-2020-999", route: "JT-04 DELTA", rating: 4.5, status: "Standby" },
    { name: "Prakash Rao", license: "DL-14-2016-333", route: "Unassigned", rating: 4.2, status: "Off Duty" },
];

// Routes
const routes = [
    { id: "JT-01 ALPHA", start: "Sector A-10", end: "JIET Campus", dist: "14.5 km", time: "45 mins", status: "Optimal" },
    { id: "JT-02 BETA", start: "Sector B-22", end: "JIET Campus", dist: "18.2 km", time: "55 mins", status: "Heavy Traffic" },
    { id: "JT-03 GAMMA", start: "Sector C-05", end: "JIET Campus", dist: "12.0 km", time: "35 mins", status: "Optimal" },
    { id: "JT-04 DELTA", start: "City Station", end: "JIET Campus", dist: "22.4 km", time: "1h 10m", status: "Standby" },
];

// Alerts
const alerts = [
    { time: "Just now", type: "warn", msg: "JT-02 Beta experiencing 5-minute delay due to traffic at Residency Rd." },
    { time: "10 mins ago", type: "info", msg: "Student STU1024 manually flagged as 'On Board' by Driver Suresh." },
    { time: "1 hour ago", type: "ok", msg: "Morning fleet initialization complete. All diagnostics green." },
    { time: "2 hours ago", type: "warn", msg: "Low fuel warning on JT-04 Delta. Scheduled for refuel." },
    { time: "Yesterday", type: "info", msg: "System firmware updated to v4.2.1." },
];

// ==========================================
// --- RENDER FUNCTIONS ---
// ==========================================

function renderStudents(data) {
    const tbody = document.getElementById('students-tbody');
    if(!tbody) return;
    tbody.innerHTML = data.map(s => {
        let sc = s.status === 'On Board' ? 'var(--accent)' : (s.status === 'Dropped' ? 'var(--text-muted)' : 'var(--danger)');
        let bg = s.status === 'On Board' ? 'rgba(0,255,209,0.1)' : (s.status === 'Dropped' ? 'rgba(255,255,255,0.05)' : 'rgba(255,59,59,0.1)');
        return `<tr>
            <td style="font-family:'Orbitron';color:var(--primary)">${s.id}</td>
            <td style="font-weight:500">${s.name}</td>
            <td><span style="border:1px solid var(--glass-border);padding:4px 8px;border-radius:6px;font-size:11px">${s.route}</span></td>
            <td>${s.stop}</td>
            <td><span class="status-pill" style="color:${sc};background:${bg};border:1px solid ${sc}40">${s.status}</span></td>
            <td><button class="btn-icon" onclick="openStudentModal('${s.id}')"><i class="ti ti-eye"></i></button></td>
        </tr>`;
    }).join('');
}

function renderDrivers() {
    const grid = document.getElementById('drivers-container');
    if(!grid) return;
    grid.innerHTML = drivers.map(d => `
        <div class="driver-card">
            <div class="driver-avatar"><i class="ti ti-steering-wheel"></i></div>
            <h3 class="orbitron mb-10">${d.name}</h3>
            <p class="text-muted mb-10">License: ${d.license}</p>
            <div class="driver-rating">
                <i class="ti ti-star-filled"></i><i class="ti ti-star-filled"></i><i class="ti ti-star-filled"></i><i class="ti ti-star-filled"></i><i class="ti ti-star-half-filled"></i>
                <br>${d.rating} / 5.0
            </div>
            <div style="margin-top:15px; padding-top:15px; border-top: 1px solid var(--glass-border);">
                <p style="font-size:12px; color:var(--text-main)">Assigned: <span class="orbitron" style="color:var(--primary)">${d.route}</span></p>
                <p style="font-size:12px; color:${d.status==='Active'?'var(--accent)':'var(--text-muted)'}; margin-top:5px;">Status: ${d.status}</p>
            </div>
        </div>
    `).join('');
}

function renderRoutes() {
    const grid = document.getElementById('routes-container');
    if(!grid) return;
    grid.innerHTML = routes.map(r => `
        <div class="route-card" style="border-left-color: ${r.status==='Optimal'?'var(--accent)':(r.status==='Standby'?'var(--text-muted)':'var(--warning)')}">
            <h3 class="orbitron mb-10 text-primary">${r.id}</h3>
            <div class="route-path">
                <span>${r.start}</span>
                <div class="route-line-ui"></div>
                <span>${r.end}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:20px; font-size:12px;">
                <div><i class="ti ti-route" style="color:var(--primary)"></i> ${r.dist}</div>
                <div><i class="ti ti-clock" style="color:var(--accent)"></i> ${r.time}</div>
                <div style="color:${r.status==='Optimal'?'var(--accent)':(r.status==='Standby'?'var(--text-muted)':'var(--warning)')}">${r.status}</div>
            </div>
        </div>
    `).join('');
}

function renderAlerts() {
    const tl = document.getElementById('alerts-timeline');
    if(!tl) return;
    tl.innerHTML = alerts.map(a => `
        <div class="timeline-item">
            <div class="timeline-dot" style="background: ${a.type==='warn'?'var(--warning)':(a.type==='info'?'var(--primary)':'var(--accent)')}; border-color:var(--bg-deep)"></div>
            <div class="timeline-content">
                <span class="text-muted" style="font-size:10px; display:block; margin-bottom:5px;">${a.time}</span>
                <p style="font-size:13px; color:var(--text-main)">${a.msg}</p>
            </div>
        </div>
    `).join('');
}

function renderMapNodes() {
    const list = document.getElementById('map-node-list');
    if(!list) return;
    list.innerHTML = routes.map(r => `
        <div style="display:flex; align-items:center; gap:10px; margin-top:15px; font-size:12px;">
            <div class="live-badge" style="padding:2px 6px; font-size:8px;"><div class="dot"></div></div>
            <span>${r.id}</span>
            <span style="margin-left:auto; color:var(--primary)">${(Math.random()*40+20).toFixed(0)} km/h</span>
        </div>
    `).join('');
}

function simulateScan() {
    const feed = document.getElementById('scan-feed');
    if(!feed) return;
    const s = students[Math.floor(Math.random() * students.length)];
    const el = document.createElement('div');
    el.style.cssText = "display:flex; align-items:center; gap:15px; padding:10px; background:rgba(0,255,209,0.1); border:1px solid var(--accent); border-radius:12px; margin-bottom:10px; animation: slideIn 0.3s forwards;";
    el.innerHTML = `
        <i class="ti ti-scan" style="font-size:24px; color:var(--accent)"></i>
        <div>
            <div style="font-weight:600; font-size:14px;">${s.name}</div>
            <div style="font-size:11px; color:var(--text-muted)">ID: ${s.id} | Route: ${s.route}</div>
        </div>
        <div class="orbitron" style="margin-left:auto; color:var(--accent); font-size:12px;">VERIFIED</div>
    `;
    feed.prepend(el);
    if(feed.children.length > 5) feed.removeChild(feed.lastChild);
    showNotification('Biometric Scan', `${s.name} verified and boarded.`, 'info');
}

// Student Search & Filter
function filterStudents() {
    const term = document.getElementById('student-search').value.toLowerCase();
    const rf = document.getElementById('route-filter').value;
    renderStudents(students.filter(s => 
        (s.name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term)) &&
        (rf === 'all' || s.route === rf)
    ));
}

document.getElementById('student-search')?.addEventListener('input', filterStudents);
document.getElementById('route-filter')?.addEventListener('change', filterStudents);

// Student Modal
function openStudentModal(id) {
    const s = students.find(x => x.id === id);
    if(!s) return;
    document.getElementById('modal-initial').innerText = s.name.charAt(0);
    document.getElementById('modal-name').innerText = s.name;
    document.getElementById('modal-id').innerText = `ID: ${s.id}`;
    
    const stat = document.getElementById('modal-status');
    stat.innerText = s.status;
    stat.style.color = s.status === 'On Board' ? 'var(--accent)' : (s.status === 'Dropped' ? 'var(--text-main)' : 'var(--danger)');
    stat.style.background = s.status === 'On Board' ? 'rgba(0,255,209,0.1)' : (s.status === 'Dropped' ? 'rgba(255,255,255,0.1)' : 'rgba(255,59,59,0.1)');
    stat.style.borderColor = s.status === 'On Board' ? 'rgba(0,255,209,0.3)' : (s.status === 'Dropped' ? 'rgba(255,255,255,0.3)' : 'rgba(255,59,59,0.3)');

    document.getElementById('modal-route').innerText = s.route;
    document.getElementById('modal-stop').innerText = s.stop;
    document.getElementById('modal-time').innerText = s.time;
    document.getElementById('modal-parent').innerText = s.parent;
    document.getElementById('modal-contact').innerText = s.contact;
    document.getElementById('student-modal').classList.add('show');
}

function closeModal() {
    document.getElementById('student-modal').classList.remove('show');
}

// Init
window.addEventListener('load', () => {
    document.querySelectorAll('.progress-fill, .chart-bar').forEach(el => {
        const final = el.style.height || el.style.width;
        if(el.style.width) { el.style.width = '0%'; setTimeout(()=>el.style.width=final, 500); }
    });
    
    renderStudents(students);
    renderDrivers();
    renderRoutes();
    renderAlerts();
    renderMapNodes();
    
    // Initial scan populates
    for(let i=0; i<3; i++) setTimeout(simulateScan, i*500);
});

// ==========================================
// --- ADD ROUTE LOGIC ---
// ==========================================

function openAddRouteModal() {
    document.getElementById('add-route-modal').classList.add('show');
}

function closeAddRouteModal() {
    document.getElementById('add-route-modal').classList.remove('show');
    document.getElementById('add-route-form').reset();
}

function submitNewRoute(e) {
    e.preventDefault();
    
    const newRoute = {
        id: document.getElementById('new-route-id').value.toUpperCase(),
        start: document.getElementById('new-route-start').value,
        end: document.getElementById('new-route-end').value,
        dist: document.getElementById('new-route-dist').value,
        time: document.getElementById('new-route-time').value,
        status: "Optimal"
    };
    
    // Add to array
    routes.push(newRoute);
    
    // Re-render
    renderRoutes();
    renderMapNodes();
    
    // Show Notification
    showNotification('Route Deployed', `New transit corridor ${newRoute.id} is now active.`, 'info');
    
    closeAddRouteModal();
}

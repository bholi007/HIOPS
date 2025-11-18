// Hospital Internal Operations System (HIOPS)
// In-memory data storage with localStorage sync

// Session management
let currentUser = {
  role: null, // 'reception' or 'doctor'
  doctorId: null,
  doctorName: null
};

const systemConfig = {
  hospitalName: 'City Medical Center',
  hospitalLocation: 'Porbandar, Gujarat',
  currency: 'INR',
  tokenPrefix: 'D'
};

// Database tables
let doctors = [
  { doctor_id: 1, doctor_name: 'Dr. Sharma', specialization: 'General Physician', is_active: true },
  { doctor_id: 2, doctor_name: 'Dr. Patel', specialization: 'Cardiologist', is_active: true },
  { doctor_id: 3, doctor_name: 'Dr. Kumar', specialization: 'Pediatrician', is_active: true }
];

let patientVisits = [
  {
    patient_id: 1,
    name: 'Arjun Singh',
    contact_number: '9876543210',
    date_of_visit: '2025-11-18T09:30:00',
    last_visit_date: '2025-05-10',
    case_type: 'Old Case',
    last_illness_diagnosis: 'Common Fever',
    last_suggested_medicine: 'Paracetamol 500mg',
    doctor_id: 1,
    doctor_name: 'Dr. Sharma',
    final_charge_amount: null,
    payment_status: 'Waiting',
    current_token_number: 'D1-001',
    current_diagnosis: null,
    current_treatment: null,
    consultation_status: 'Waiting'
  },
  {
    patient_id: 2,
    name: 'Priya Desai',
    contact_number: '9988776655',
    date_of_visit: '2025-11-18T10:00:00',
    last_visit_date: null,
    case_type: 'New Case',
    last_illness_diagnosis: null,
    last_suggested_medicine: null,
    doctor_id: 1,
    doctor_name: 'Dr. Sharma',
    current_token_number: 'D1-002',
    current_diagnosis: null,
    current_treatment: null,
    final_charge_amount: null,
    payment_status: 'Waiting',
    payment_method: null,
    consultation_status: 'Waiting'
  },
  {
    patient_id: 3,
    name: 'Rajesh Patel',
    contact_number: '9123456789',
    date_of_visit: '2025-11-18T09:45:00',
    last_visit_date: '2024-12-15',
    case_type: 'Old Case',
    last_illness_diagnosis: 'Hypertension',
    last_suggested_medicine: 'Amlodipine 5mg',
    doctor_id: 2,
    doctor_name: 'Dr. Patel',
    current_token_number: 'D2-001',
    current_diagnosis: 'High BP - under control',
    current_treatment: 'Continue Amlodipine 5mg, daily',
    final_charge_amount: 600,
    payment_status: 'In Consultation',
    payment_method: null,
    consultation_status: 'In Consultation'
  },
  {
    patient_id: 4,
    name: 'Sneha Mehta',
    contact_number: '9898989898',
    date_of_visit: '2025-11-18T08:30:00',
    last_visit_date: '2025-10-01',
    case_type: 'Old Case',
    last_illness_diagnosis: 'Migraine',
    last_suggested_medicine: 'Sumatriptan 50mg',
    doctor_id: 3,
    doctor_name: 'Dr. Kumar',
    current_token_number: 'D3-001',
    current_diagnosis: 'Recurring migraine',
    current_treatment: 'Sumatriptan 100mg, as needed',
    final_charge_amount: 450,
    payment_status: 'Pending Payment',
    payment_method: null,
    consultation_status: 'Completed'
  },
  {
    patient_id: 5,
    name: 'Amit Shah',
    contact_number: '9765432109',
    date_of_visit: '2025-11-18T08:00:00',
    last_visit_date: '2025-09-20',
    case_type: 'Old Case',
    last_illness_diagnosis: 'Diabetes checkup',
    last_suggested_medicine: 'Metformin 500mg',
    doctor_id: 1,
    doctor_name: 'Dr. Sharma',
    current_token_number: 'D1-003',
    current_diagnosis: 'Diabetes - stable',
    current_treatment: 'Continue Metformin, diet control',
    final_charge_amount: 500,
    payment_status: 'Paid',
    payment_method: 'Cash',
    consultation_status: 'Completed'
  }
];

let patients = [
  {
    patient_id: 1,
    name: 'Arjun Singh',
    contact_number: '9876543210',
    last_visit_date: '2025-05-10',
    last_illness_diagnosis: 'Common Fever',
    last_suggested_medicine: 'Paracetamol 500mg'
  }
];

let tokenCounters = {
  1: 3,
  2: 1,
  3: 1
};

let currentDoctorId = null;
let currentPatientVisit = null;
let receiptCounter = 1000;
let receipts = [];
let archivedPatients = [];

// Login credentials
const credentials = {
  reception: { username: 'reception', password: 'reception123' },
  doctor: { password: 'doctor123' }
};

// Login/Logout Functions
function showLoginForm(role) {
  document.getElementById('login-selection').classList.add('hidden');
  if (role === 'reception') {
    document.getElementById('reception-login-form').classList.remove('hidden');
    document.getElementById('doctor-login-form').classList.add('hidden');
  } else {
    document.getElementById('doctor-login-form').classList.remove('hidden');
    document.getElementById('reception-login-form').classList.add('hidden');
  }
}

function backToLoginSelection() {
  document.getElementById('login-selection').classList.remove('hidden');
  document.getElementById('reception-login-form').classList.add('hidden');
  document.getElementById('doctor-login-form').classList.add('hidden');
}

function loginReception(event) {
  event.preventDefault();
  const username = document.getElementById('reception-username').value.trim();
  const password = document.getElementById('reception-password').value;
  
  if (username === credentials.reception.username && password === credentials.reception.password) {
    currentUser.role = 'reception';
    showApp();
  } else {
    alert('Invalid username or password');
  }
}

function loginDoctor(event) {
  event.preventDefault();
  const doctorId = parseInt(document.getElementById('doctor-select').value);
  const password = document.getElementById('doctor-password').value;
  
  if (password === credentials.doctor.password) {
    const doctor = findDoctorById(doctorId);
    currentUser.role = 'doctor';
    currentUser.doctorId = doctorId;
    currentUser.doctorName = doctor.doctor_name;
    showApp();
  } else {
    alert('Invalid password');
  }
}

function showApp() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');
  
  // STRICT ROLE-BASED UI SETUP
  // Hide all role-specific elements first
  document.getElementById('nav-reception').classList.add('hidden');
  document.getElementById('nav-doctor').classList.add('hidden');
  document.getElementById('mobile-nav-reception').classList.add('hidden');
  document.getElementById('mobile-nav-doctor').classList.add('hidden');
  document.getElementById('reception-card').classList.add('hidden');
  document.getElementById('doctor-card').classList.add('hidden');
  
  const roleBadge = document.getElementById('role-badge');
  
  // Show ONLY appropriate navigation based on role
  if (currentUser.role === 'reception') {
    document.getElementById('nav-reception').classList.remove('hidden');
    document.getElementById('mobile-nav-reception').classList.remove('hidden');
    document.getElementById('reception-card').classList.remove('hidden');
    // Apply reception theme
    document.documentElement.style.setProperty('--role-theme-color', '#2563eb');
    roleBadge.textContent = '🏥 Reception';
    roleBadge.style.display = 'inline-block';
  } else if (currentUser.role === 'doctor') {
    document.getElementById('nav-doctor').classList.remove('hidden');
    document.getElementById('mobile-nav-doctor').classList.remove('hidden');
    document.getElementById('doctor-card').classList.remove('hidden');
    // Apply doctor theme
    document.documentElement.style.setProperty('--role-theme-color', '#059669');
    roleBadge.textContent = '👨‍⚕️ ' + currentUser.doctorName;
    roleBadge.style.display = 'inline-block';
  }
  
  updateDashboardStats();
  saveToStorage();
  startSyncTimer();
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    // Clear ALL session data
    currentUser = { role: null, doctorId: null, doctorName: null };
    currentDoctorId = null;
    currentPatientVisit = null;
    window.currentPaymentVisit = null;
    
    // Hide all modules and reset UI
    document.querySelectorAll('.module').forEach(m => m.classList.add('hidden'));
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('app-screen').classList.add('hidden');
    
    // Reset theme
    document.documentElement.style.removeProperty('--role-theme-color');
    
    backToLoginSelection();
    stopSyncTimer();
  }
}

// Data persistence and sync
let syncInterval = null;

function saveToStorage() {
  try {
    const data = {
      patients: patients,
      patientVisits: patientVisits,
      tokenCounters: tokenCounters,
      receipts: receipts,
      archivedPatients: archivedPatients,
      receiptCounter: receiptCounter,
      timestamp: Date.now()
    };
    const dataStr = JSON.stringify(data);
    // Using in-memory storage as localStorage is not available
    window.hiopsData = dataStr;
  } catch (e) {
    console.log('Storage not available, using in-memory mode');
  }
}

function loadFromStorage() {
  try {
    const dataStr = window.hiopsData;
    if (dataStr) {
      const data = JSON.parse(dataStr);
      patients = data.patients || patients;
      patientVisits = data.patientVisits || patientVisits;
      tokenCounters = data.tokenCounters || tokenCounters;
      receipts = data.receipts || receipts;
      archivedPatients = data.archivedPatients || archivedPatients;
      receiptCounter = data.receiptCounter || receiptCounter;
    }
  } catch (e) {
    console.log('Could not load data');
  }
}

function startSyncTimer() {
  // Simulate cross-device sync by checking for data changes every 2 seconds
  syncInterval = setInterval(() => {
    loadFromStorage();
    // Refresh current view if needed
    const activeModule = document.querySelector('.module:not(.hidden)');
    if (activeModule) {
      const moduleId = activeModule.id;
      if (moduleId === 'dashboard-module') updateDashboardStats();
      else if (moduleId === 'reception-module') updateQueueStatus();
      else if (moduleId === 'doctor-module' && currentDoctorId) updateDoctorQueue();
    }
  }, 2000);
}

function stopSyncTimer() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

// ACCESS CONTROL CONFIGURATION
const accessControl = {
  reception: {
    allowed_screens: ['login', 'dashboard', 'reception', 'reception_dashboard', 'register_patient', 'view_queues_readonly', 'process_payments', 'reports'],
    denied_screens: ['doctor', 'doctor_dashboard', 'consultation', 'doctor_queue', 'doctor_history'],
    canSee: {
      patientNames: true,
      patientContacts: true,
      medicalDetails: false,
      paymentDetails: true
    }
  },
  doctor: {
    allowed_screens: ['login', 'dashboard', 'doctor', 'doctor_dashboard', 'doctor_queue', 'consultation', 'doctor_history'],
    denied_screens: ['reception', 'reception_dashboard', 'register_patient', 'process_payments', 'reports'],
    canSee: {
      patientNames: false,
      patientContacts: false,
      medicalDetails: true,
      paymentDetails: false
    }
  }
};

// Utility Functions
function getCurrentDate() {
  return '2025-11-18';
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function calculateDaysDifference(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function determineCaseType(lastVisitDate, currentDate) {
  if (!lastVisitDate) {
    return 'New Case';
  }
  const daysDiff = calculateDaysDifference(lastVisitDate, currentDate);
  return daysDiff > 365 ? 'New Case' : 'Old Case';
}

function generateToken(doctorId) {
  const counter = tokenCounters[doctorId];
  tokenCounters[doctorId]++;
  return `${systemConfig.tokenPrefix}${doctorId}-${String(counter).padStart(3, '0')}`;
}

function findPatientByContact(contactNumber) {
  return patients.find(p => p.contact_number === contactNumber);
}

function findDoctorById(doctorId) {
  return doctors.find(d => d.doctor_id === doctorId);
}

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

// Access Control Function
function checkAccess(requiredRole) {
  if (currentUser.role !== requiredRole) {
    return false;
  }
  return true;
}

function showAccessDeniedMessage(requiredRole) {
  alert(`Access Denied - This section is for ${requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1)} only`);
}

// Navigation with Access Control
function showModule(moduleName) {
  // ACCESS CONTROL CHECK
  if (moduleName === 'reception' && !checkAccess('reception')) {
    showAccessDeniedMessage('reception');
    showModule('dashboard');
    return;
  }
  
  if (moduleName === 'doctor' && !checkAccess('doctor')) {
    showAccessDeniedMessage('doctor');
    showModule('dashboard');
    return;
  }
  
  // Hide all modules
  const modules = document.querySelectorAll('.module');
  modules.forEach(m => m.classList.add('hidden'));
  
  // Hide all reception sub-views
  ['reception-register', 'reception-queue', 'reception-payment', 'reception-reports'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  // Update nav buttons
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => btn.classList.remove('active'));
  const mobileNavButtons = document.querySelectorAll('.mobile-nav-item');
  mobileNavButtons.forEach(btn => btn.classList.remove('active'));

  // Show selected module
  document.getElementById(`${moduleName}-module`).classList.remove('hidden');
  
  // Update active nav button
  if (event && event.target) {
    event.target.classList.add('active');
  }

  // Refresh module data
  if (moduleName === 'dashboard') {
    updateDashboardStats();
  } else if (moduleName === 'reception') {
    updateReceptionModule();
  } else if (moduleName === 'doctor') {
    updateDoctorModule();
  }
}

function showReceptionView(viewName) {
  // ACCESS CONTROL CHECK
  if (!checkAccess('reception')) {
    showAccessDeniedMessage('reception');
    showModule('dashboard');
    return;
  }
  
  ['reception-register', 'reception-queue', 'reception-payment', 'reception-reports'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  
  const viewId = `reception-${viewName}`;
  document.getElementById(viewId).classList.remove('hidden');
  
  if (viewName === 'register') {
    updateReceptionModule();
  } else if (viewName === 'queue') {
    updateAllQueuesDisplay();
  } else if (viewName === 'payment') {
    updatePendingPaymentsList();
  } else if (viewName === 'reports') {
    updateReportsView();
  }
}

// Dashboard Module
function updateDashboardStats() {
  const today = getCurrentDate();
  const todayVisits = patientVisits.filter(v => v.date_of_visit === today);
  
  // Role-specific stats
  let pendingConsultations, pendingPayments, completed;
  
  if (currentUser.role === 'doctor' && currentUser.doctorId) {
    // Doctor sees only their own stats
    pendingConsultations = patientVisits.filter(v => v.doctor_id === currentUser.doctorId && v.consultation_status === 'Waiting');
    pendingPayments = patientVisits.filter(v => v.doctor_id === currentUser.doctorId && v.payment_status === 'Pending Payment' && v.consultation_status === 'Completed');
    completed = patientVisits.filter(v => v.doctor_id === currentUser.doctorId && v.payment_status === 'Paid');
  } else {
    // Reception sees all stats
    pendingConsultations = patientVisits.filter(v => v.consultation_status === 'Waiting');
    pendingPayments = patientVisits.filter(v => v.payment_status === 'Pending Payment' && v.consultation_status === 'Completed');
    completed = patientVisits.filter(v => v.payment_status === 'Paid');
  }

  document.getElementById('stat-total-visits').textContent = todayVisits.length;
  document.getElementById('stat-pending-consultations').textContent = pendingConsultations.length;
  document.getElementById('stat-pending-payments').textContent = pendingPayments.length;
  document.getElementById('stat-completed').textContent = completed.length;
}

// Reception Module
function updateReceptionModule() {
  // Populate doctor dropdown
  const doctorSelect = document.getElementById('patient-doctor');
  if (doctorSelect) {
    doctorSelect.innerHTML = '<option value="">-- Select Doctor --</option>';
    doctors.filter(d => d.is_active).forEach(doctor => {
      const option = document.createElement('option');
      option.value = doctor.doctor_id;
      option.textContent = `${doctor.doctor_name} - ${doctor.specialization}`;
      doctorSelect.appendChild(option);
    });
  }

  // Update queue status
  updateQueueStatus();
}

function updateAllQueuesDisplay() {
  // ACCESS CONTROL CHECK
  if (!checkAccess('reception')) {
    showAccessDeniedMessage('reception');
    showModule('dashboard');
    return;
  }
  
  const container = document.getElementById('all-queues-display');
  container.innerHTML = '';
  
  const infoBox = document.createElement('div');
  infoBox.style.padding = 'var(--space-16)';
  infoBox.style.background = 'var(--color-bg-2)';
  infoBox.style.borderRadius = 'var(--radius-base)';
  infoBox.style.marginBottom = 'var(--space-20)';
  infoBox.style.fontSize = 'var(--font-size-sm)';
  infoBox.innerHTML = '<strong>ℹ️ Reception Queue View:</strong> Read-only access - Shows token numbers and status only. Medical details are hidden for privacy.';
  container.appendChild(infoBox);
  
  doctors.forEach(doctor => {
    const doctorQueue = patientVisits.filter(v => v.doctor_id === doctor.doctor_id);
    const waiting = doctorQueue.filter(v => v.consultation_status === 'Waiting');
    const inConsult = doctorQueue.filter(v => v.consultation_status === 'In Consultation');
    const completed = doctorQueue.filter(v => v.consultation_status === 'Completed');
    const paid = doctorQueue.filter(v => v.payment_status === 'Paid');
    
    const card = document.createElement('div');
    card.className = 'card';
    card.style.padding = 'var(--space-20)';
    card.style.marginBottom = 'var(--space-16)';
    card.innerHTML = `
      <h4 style="margin-bottom: var(--space-16);">${doctor.doctor_name} - ${doctor.specialization}</h4>
      <div style="display: flex; gap: var(--space-12); flex-wrap: wrap; margin-bottom: var(--space-16);">
        <span class="status status--warning">${waiting.length} Waiting</span>
        <span class="status status--info">${inConsult.length} In Consultation</span>
        <span class="status status--error">${completed.length - paid.length} Pending Payment</span>
        <span class="status status--success">${paid.length} Completed</span>
      </div>
      <div style="display: flex; gap: var(--space-8); flex-wrap: wrap;">
        ${waiting.map(v => `<span class="token-badge">${v.current_token_number}</span>`).join('')}
      </div>
      <div style="margin-top: var(--space-12); font-size: var(--font-size-xs); color: var(--color-text-secondary);">
        <em>Patient names and medical details hidden - Reception view only</em>
      </div>
    `;
    container.appendChild(card);
  });
}

function showReportTab(tabName) {
  // Update tab buttons
  ['tab-summary', 'tab-payment-history', 'tab-patient-history'].forEach(id => {
    const btn = document.getElementById(id);
    if (id === `tab-${tabName}`) {
      btn.style.borderBottom = '3px solid var(--color-primary)';
      btn.style.background = 'var(--color-bg-1)';
    } else {
      btn.style.borderBottom = 'none';
      btn.style.background = 'var(--color-secondary)';
    }
  });
  
  // Show/hide tab content
  ['report-tab-summary', 'report-tab-payment-history', 'report-tab-patient-history'].forEach(id => {
    const tab = document.getElementById(id);
    if (id === `report-tab-${tabName}`) {
      tab.classList.remove('hidden');
    } else {
      tab.classList.add('hidden');
    }
  });
  
  // Load data for the selected tab
  if (tabName === 'payment-history') {
    loadReceiptHistory();
  } else if (tabName === 'patient-history') {
    loadPatientHistory();
  }
}

function updateReportsView() {
  const today = getCurrentDate();
  const todayVisits = patientVisits.filter(v => v.date_of_visit.startsWith(today));
  const paidVisits = todayVisits.filter(v => v.payment_status === 'Paid');
  const pendingPayments = todayVisits.filter(v => v.payment_status === 'Pending Payment');
  
  const totalRevenue = paidVisits.reduce((sum, v) => sum + (v.final_charge_amount || 0), 0);
  
  document.getElementById('report-registrations').textContent = todayVisits.length;
  document.getElementById('report-payments').textContent = paidVisits.length;
  document.getElementById('report-revenue').textContent = formatCurrency(totalRevenue);
  document.getElementById('report-pending').textContent = pendingPayments.length;
  
  // Patient list
  const patientList = document.getElementById('patient-list');
  patientList.innerHTML = '';
  
  if (todayVisits.length === 0) {
    patientList.innerHTML = '<div class="empty-state">No patients registered today</div>';
    return;
  }
  
  todayVisits.forEach(visit => {
    const item = document.createElement('div');
    item.style.padding = 'var(--space-12)';
    item.style.border = '1px solid var(--color-border)';
    item.style.borderRadius = 'var(--radius-base)';
    item.style.marginBottom = 'var(--space-8)';
    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-8);">
        <div>
          <div style="font-weight: var(--font-weight-medium);">${visit.current_token_number} - ${visit.name}</div>
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">${visit.doctor_name} | ${visit.contact_number}</div>
        </div>
        <div style="display: flex; gap: var(--space-8); align-items: center;">
          <span class="status ${visit.payment_status === 'Paid' ? 'status--success' : 'status--error'}">${visit.payment_status}</span>
          ${visit.final_charge_amount ? `<strong>${formatCurrency(visit.final_charge_amount)}</strong>` : ''}
        </div>
      </div>
    `;
    patientList.appendChild(item);
  });
}

function loadReceiptHistory() {
  const container = document.getElementById('receipt-history-list');
  
  if (receipts.length === 0) {
    container.innerHTML = '<div class="empty-state">No payment receipts found</div>';
    return;
  }
  
  // Sort by timestamp (newest first)
  const sortedReceipts = [...receipts].sort((a, b) => b.timestamp - a.timestamp);
  
  let html = `
    <table style="width: 100%; border-collapse: collapse; font-size: var(--font-size-sm);">
      <thead>
        <tr style="background: var(--color-bg-1); text-align: left;">
          <th style="padding: var(--space-12); border: 1px solid var(--color-border);">Date</th>
          <th style="padding: var(--space-12); border: 1px solid var(--color-border);">Receipt No</th>
          <th style="padding: var(--space-12); border: 1px solid var(--color-border);">Patient Name</th>
          <th style="padding: var(--space-12); border: 1px solid var(--color-border);">Token</th>
          <th style="padding: var(--space-12); border: 1px solid var(--color-border);">Doctor</th>
          <th style="padding: var(--space-12); border: 1px solid var(--color-border);">Amount</th>
          <th style="padding: var(--space-12); border: 1px solid var(--color-border);">Payment</th>
          <th style="padding: var(--space-12); border: 1px solid var(--color-border);">Actions</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  sortedReceipts.forEach(receipt => {
    html += `
      <tr style="border-bottom: 1px solid var(--color-border);">
        <td style="padding: var(--space-8); border: 1px solid var(--color-border);">${receipt.date_time.split(',')[0]}</td>
        <td style="padding: var(--space-8); border: 1px solid var(--color-border); font-family: var(--font-family-mono); font-size: var(--font-size-xs);">${receipt.receipt_number}</td>
        <td style="padding: var(--space-8); border: 1px solid var(--color-border);">${receipt.patient_name}</td>
        <td style="padding: var(--space-8); border: 1px solid var(--color-border);">${receipt.token_number}</td>
        <td style="padding: var(--space-8); border: 1px solid var(--color-border);">${receipt.doctor_name}</td>
        <td style="padding: var(--space-8); border: 1px solid var(--color-border); font-weight: var(--font-weight-medium);">${formatCurrency(receipt.consultation_fee)}</td>
        <td style="padding: var(--space-8); border: 1px solid var(--color-border);">${receipt.payment_method}</td>
        <td style="padding: var(--space-8); border: 1px solid var(--color-border);">
          <div style="display: flex; gap: var(--space-4);">
            <button class="btn btn--sm" onclick="viewReceiptDetail('${receipt.receipt_number}')" style="padding: var(--space-4) var(--space-8); font-size: var(--font-size-xs);">View</button>
            <button class="btn btn--primary btn--sm" onclick="reprintReceipt('${receipt.receipt_number}')" style="padding: var(--space-4) var(--space-8); font-size: var(--font-size-xs);">Reprint</button>
          </div>
        </td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  container.innerHTML = html;
}

function filterReceiptHistory() {
  const searchTerm = document.getElementById('receipt-search').value.toLowerCase();
  const fromDate = document.getElementById('receipt-from-date').value;
  const toDate = document.getElementById('receipt-to-date').value;
  
  let filtered = [...receipts];
  
  // Filter by search term
  if (searchTerm) {
    filtered = filtered.filter(r => 
      r.patient_name.toLowerCase().includes(searchTerm) ||
      r.token_number.toLowerCase().includes(searchTerm) ||
      r.receipt_number.toLowerCase().includes(searchTerm)
    );
  }
  
  // Filter by date range
  if (fromDate) {
    filtered = filtered.filter(r => {
      const receiptDate = new Date(r.timestamp);
      return receiptDate >= new Date(fromDate);
    });
  }
  
  if (toDate) {
    filtered = filtered.filter(r => {
      const receiptDate = new Date(r.timestamp);
      return receiptDate <= new Date(toDate);
    });
  }
  
  // Display filtered results
  const container = document.getElementById('receipt-history-list');
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state">No receipts match your search criteria</div>';
    return;
  }
  
  // Sort by timestamp (newest first)
  filtered.sort((a, b) => b.timestamp - a.timestamp);
  
  let html = `
    <table style="width: 100%; border-collapse: collapse; font-size: var(--font-size-sm);">
      <thead>
        <tr style="background: var(--color-bg-1); text-align: left;">
          <th style="padding: var(--space-12); border: 1px solid var(--color-border);">Date</th>
          <th style="padding: var(--space-12); border: 1px solid var(--color-border);">Receipt No</th>
          <th style="padding: var(--space-12); border: 1px solid var(--color-border);">Patient Name</th>
          <th style="padding: var(--space-12); border: 1px solid var(--color-border);">Token</th>
          <th style="padding: var(--space-12); border: 1px solid var(--color-border);">Doctor</th>
          <th style="padding: var(--space-12); border: 1px solid var(--color-border);">Amount</th>
          <th style="padding: var(--space-12); border: 1px solid var(--color-border);">Payment</th>
          <th style="padding: var(--space-12); border: 1px solid var(--color-border);">Actions</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  filtered.forEach(receipt => {
    html += `
      <tr style="border-bottom: 1px solid var(--color-border);">
        <td style="padding: var(--space-8); border: 1px solid var(--color-border);">${receipt.date_time.split(',')[0]}</td>
        <td style="padding: var(--space-8); border: 1px solid var(--color-border); font-family: var(--font-family-mono); font-size: var(--font-size-xs);">${receipt.receipt_number}</td>
        <td style="padding: var(--space-8); border: 1px solid var(--color-border);">${receipt.patient_name}</td>
        <td style="padding: var(--space-8); border: 1px solid var(--color-border);">${receipt.token_number}</td>
        <td style="padding: var(--space-8); border: 1px solid var(--color-border);">${receipt.doctor_name}</td>
        <td style="padding: var(--space-8); border: 1px solid var(--color-border); font-weight: var(--font-weight-medium);">${formatCurrency(receipt.consultation_fee)}</td>
        <td style="padding: var(--space-8); border: 1px solid var(--color-border);">${receipt.payment_method}</td>
        <td style="padding: var(--space-8); border: 1px solid var(--color-border);">
          <div style="display: flex; gap: var(--space-4);">
            <button class="btn btn--sm" onclick="viewReceiptDetail('${receipt.receipt_number}')" style="padding: var(--space-4) var(--space-8); font-size: var(--font-size-xs);">View</button>
            <button class="btn btn--primary btn--sm" onclick="reprintReceipt('${receipt.receipt_number}')" style="padding: var(--space-4) var(--space-8); font-size: var(--font-size-xs);">Reprint</button>
          </div>
        </td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  container.innerHTML = html;
}

function loadPatientHistory() {
  // Active patients list
  const activeContainer = document.getElementById('active-patients-list');
  const activePatients = [...patientVisits];
  
  if (activePatients.length === 0) {
    activeContainer.innerHTML = '<div class="empty-state">No active patient records</div>';
  } else {
    activeContainer.innerHTML = '';
    activePatients.sort((a, b) => new Date(b.date_of_visit) - new Date(a.date_of_visit)).forEach(visit => {
      const item = document.createElement('div');
      item.style.padding = 'var(--space-12)';
      item.style.border = '1px solid var(--color-border)';
      item.style.borderRadius = 'var(--radius-base)';
      item.style.marginBottom = 'var(--space-8)';
      item.style.background = 'var(--color-surface)';
      item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-8);">
          <div>
            <div style="font-weight: var(--font-weight-medium);">${visit.name}</div>
            <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
              ${visit.contact_number} | ${formatDate(visit.date_of_visit)} | ${visit.doctor_name}
            </div>
          </div>
          <div style="display: flex; gap: var(--space-8); align-items: center;">
            <span class="status ${visit.case_type === 'New Case' ? 'status--info' : 'status--warning'}">${visit.case_type}</span>
            <span class="status ${visit.payment_status === 'Paid' ? 'status--success' : 'status--error'}">${visit.payment_status}</span>
          </div>
        </div>
      `;
      activeContainer.appendChild(item);
    });
  }
  
  // Archived patients list
  const archivedContainer = document.getElementById('archived-patients-list');
  
  if (archivedPatients.length === 0) {
    archivedContainer.innerHTML = '<div class="empty-state">No archived records</div>';
  } else {
    archivedContainer.innerHTML = '';
    archivedPatients.sort((a, b) => new Date(b.date_of_visit) - new Date(a.date_of_visit)).forEach(visit => {
      const item = document.createElement('div');
      item.style.padding = 'var(--space-12)';
      item.style.border = '1px solid var(--color-border)';
      item.style.borderRadius = 'var(--radius-base)';
      item.style.marginBottom = 'var(--space-8)';
      item.style.background = 'var(--color-bg-2)';
      item.style.opacity = '0.8';
      item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-8);">
          <div>
            <div style="font-weight: var(--font-weight-medium);">${visit.name} <span style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">(ARCHIVED)</span></div>
            <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
              ${visit.contact_number} | ${formatDate(visit.date_of_visit)} | ${visit.doctor_name}
            </div>
          </div>
          <div style="display: flex; gap: var(--space-8); align-items: center;">
            <span class="status ${visit.case_type === 'New Case' ? 'status--info' : 'status--warning'}">${visit.case_type}</span>
          </div>
        </div>
      `;
      archivedContainer.appendChild(item);
    });
  }
}

let currentReceiptForModal = null;

function viewReceiptDetail(receiptNumber) {
  const receipt = receipts.find(r => r.receipt_number === receiptNumber);
  if (!receipt) return;
  
  currentReceiptForModal = receipt;
  
  const modalContent = document.getElementById('modal-receipt-content');
  modalContent.innerHTML = `
    <div style="max-width: 280px; margin: 0 auto; padding: 10px; box-sizing: border-box; font-family: 'Courier New', monospace; font-size: 11pt; line-height: 1.5; border: 2px solid var(--color-border); border-radius: var(--radius-base);">
      <div style="width: 100%; box-sizing: border-box;">
        <div style="text-align: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #333;">
          <div style="width: 100%; text-align: center; font-size: 14px; font-weight: bold; margin-bottom: 4px; overflow: hidden;">═════════════════════════</div>
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 4px;">CITY MEDICAL CENTER</div>
          <div style="font-size: 12px; margin-bottom: 4px;">Porbandar, Gujarat</div>
          <div style="width: 100%; text-align: center; font-size: 14px; font-weight: bold; overflow: hidden;">═════════════════════════</div>
        </div>
        
        <div style="text-align: center; font-size: 14px; font-weight: bold; margin: 12px 0;">PAYMENT RECEIPT</div>
        
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px;">
            <span>Date:</span>
            <span>${receipt.date_time}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px;">
            <span>Receipt No:</span>
            <span>${receipt.receipt_number}</span>
          </div>
        </div>
        
        <div style="border-top: 1px dashed #333; margin: 8px 0; padding-top: 8px;">
          <div style="font-weight: bold; margin-bottom: 8px;">Patient Details:</div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px;">
            <span>Name:</span>
            <span>${receipt.patient_name}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px;">
            <span>Contact:</span>
            <span>${receipt.contact_number}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px;">
            <span>Token:</span>
            <span>${receipt.token_number}</span>
          </div>
        </div>
        
        <div style="border-top: 1px dashed #333; margin: 8px 0; padding-top: 8px;">
          <div style="font-weight: bold; margin-bottom: 8px;">Consultation Details:</div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px;">
            <span>Doctor:</span>
            <span>${receipt.doctor_name}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px;">
            <span>Case Type:</span>
            <span>${receipt.case_type}</span>
          </div>
        </div>
        
        <div style="border-top: 1px dashed #333; margin: 8px 0; padding-top: 8px;">
          <div style="font-weight: bold; margin-bottom: 8px;">Payment Details:</div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px;">
            <span>Consultation Fee:</span>
            <span>${formatCurrency(receipt.consultation_fee)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px;">
            <span>Payment Method:</span>
            <span>${receipt.payment_method}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; font-weight: bold; border-top: 2px solid #333; margin-top: 6px;">
            <span>Payment Status:</span>
            <span>PAID ✓</span>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 12px; padding-top: 8px; border-top: 1px solid #333;">
          <div style="width: 100%; text-align: center; font-size: 14px; font-weight: bold; margin-bottom: 4px; overflow: hidden;">═════════════════════════</div>
          <div style="font-size: 12px;">Thank you for visiting!</div>
          <div style="width: 100%; text-align: center; font-size: 14px; font-weight: bold; margin-top: 4px; overflow: hidden;">═════════════════════════</div>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('receipt-detail-modal').style.display = 'flex';
}

function closeReceiptModal() {
  document.getElementById('receipt-detail-modal').style.display = 'none';
  currentReceiptForModal = null;
}

function reprintFromModal() {
  if (currentReceiptForModal) {
    reprintReceipt(currentReceiptForModal.receipt_number);
  }
}

function reprintReceipt(receiptNumber) {
  const receipt = receipts.find(r => r.receipt_number === receiptNumber);
  if (!receipt) {
    alert('Receipt not found');
    return;
  }
  
  // Populate receipt content for printing
  document.getElementById('receipt-number').textContent = receipt.receipt_number;
  document.getElementById('receipt-date').textContent = receipt.date_time;
  document.getElementById('receipt-token').textContent = receipt.token_number;
  document.getElementById('receipt-patient').textContent = receipt.patient_name;
  document.getElementById('receipt-contact').textContent = receipt.contact_number;
  document.getElementById('receipt-doctor').textContent = receipt.doctor_name;
  document.getElementById('receipt-case-type').textContent = receipt.case_type;
  document.getElementById('receipt-method').textContent = receipt.payment_method;
  document.getElementById('receipt-amount').textContent = formatCurrency(receipt.consultation_fee);
  
  // Trigger print
  window.print();
}

function updateQueueStatus() {
  const queueStatus = document.getElementById('queue-status');
  queueStatus.innerHTML = '';

  doctors.forEach(doctor => {
    const doctorQueue = patientVisits.filter(v => v.doctor_id === doctor.doctor_id && v.consultation_status === 'Waiting');
    const queueItem = document.createElement('div');
    queueItem.style.marginBottom = 'var(--space-12)';
    queueItem.innerHTML = `
      <div style="font-weight: var(--font-weight-medium);">${doctor.doctor_name}</div>
      <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
        ${doctorQueue.length} patient(s) waiting
      </div>
    `;
    queueStatus.appendChild(queueItem);
  });
}

function registerPatient(event) {
  event.preventDefault();

  // ACCESS CONTROL CHECK
  if (!checkAccess('reception')) {
    showAccessDeniedMessage('reception');
    return;
  }

  const name = document.getElementById('patient-name').value.trim();
  const contact = document.getElementById('patient-contact').value.trim();
  const doctorId = parseInt(document.getElementById('patient-doctor').value);

  if (!name || !contact || !doctorId) {
    alert('Please fill all required fields');
    return;
  }

  const currentDate = getCurrentDate();
  const existingPatient = findPatientByContact(contact);
  const doctor = findDoctorById(doctorId);

  let caseType = 'New Case';
  let lastVisitDate = null;
  let lastDiagnosis = null;
  let lastMedicine = null;
  let patientId;

  if (existingPatient) {
    patientId = existingPatient.patient_id;
    
    // Check both active and archived records for last visit
    const lastVisit = findLastVisitAllRecords(contact);
    if (lastVisit) {
      lastVisitDate = lastVisit.date_of_visit.split('T')[0];
      lastDiagnosis = lastVisit.current_diagnosis || lastVisit.last_illness_diagnosis;
      lastMedicine = lastVisit.current_treatment || lastVisit.last_suggested_medicine;
      caseType = determineCaseType(lastVisitDate, currentDate);
    } else {
      lastVisitDate = existingPatient.last_visit_date;
      lastDiagnosis = existingPatient.last_illness_diagnosis;
      lastMedicine = existingPatient.last_suggested_medicine;
      caseType = determineCaseType(lastVisitDate, currentDate);
    }
  } else {
    patientId = patients.length + 1;
    const newPatient = {
      patient_id: patientId,
      name: name,
      contact_number: contact,
      last_visit_date: null,
      last_illness_diagnosis: null,
      last_suggested_medicine: null
    };
    patients.push(newPatient);
  }

  const token = generateToken(doctorId);

  const newVisit = {
    patient_id: patientId,
    name: name,
    contact_number: contact,
    date_of_visit: currentDate + 'T' + new Date().toTimeString().slice(0,8),
    last_visit_date: lastVisitDate,
    case_type: caseType,
    last_illness_diagnosis: lastDiagnosis,
    last_suggested_medicine: lastMedicine,
    doctor_id: doctorId,
    doctor_name: doctor.doctor_name,
    final_charge_amount: null,
    payment_status: 'Waiting',
    current_token_number: token,
    current_diagnosis: null,
    current_treatment: null,
    consultation_status: 'Waiting',
    payment_method: null
  };

  patientVisits.push(newVisit);

  // Display result
  document.getElementById('generated-token').textContent = token;
  document.getElementById('case-type-badge').textContent = caseType;
  document.getElementById('case-type-badge').className = `status ${caseType === 'New Case' ? 'status--info' : 'status--warning'}`;
  document.getElementById('result-patient-name').textContent = name;
  document.getElementById('result-doctor-name').textContent = doctor.doctor_name;
  document.getElementById('registration-result').classList.remove('hidden');

  // Reset form
  document.getElementById('registration-form').reset();

  // Update queue status
  updateQueueStatus();
  updateDashboardStats();
  saveToStorage();
}

// Doctor Module
function updateDoctorModule() {
  // If doctor is already logged in, go directly to workspace
  if (currentUser.role === 'doctor' && currentUser.doctorId) {
    currentDoctorId = currentUser.doctorId;
    document.getElementById('doctor-selection').classList.add('hidden');
    document.getElementById('doctor-workspace').classList.remove('hidden');
    document.getElementById('consultation-area').classList.add('hidden');
    updateDoctorQueue();
  } else {
    // Reset doctor selection
    currentDoctorId = null;
    document.getElementById('doctor-selection').classList.remove('hidden');
    document.getElementById('doctor-workspace').classList.add('hidden');
    document.getElementById('consultation-area').classList.add('hidden');

    // Populate doctor selector
    const doctorSelector = document.getElementById('doctor-selector');
    doctorSelector.innerHTML = '';

    doctors.filter(d => d.is_active).forEach(doctor => {
      const btn = document.createElement('button');
      btn.className = 'doctor-btn';
      btn.onclick = () => selectDoctor(doctor.doctor_id);
      btn.innerHTML = `
        <div class="doctor-btn-title">${doctor.doctor_name}</div>
        <div class="doctor-btn-spec">${doctor.specialization}</div>
      `;
      doctorSelector.appendChild(btn);
    });
  }
}

function selectDoctor(doctorId) {
  // ACCESS CONTROL CHECK
  if (!checkAccess('doctor')) {
    showAccessDeniedMessage('doctor');
    showModule('dashboard');
    return;
  }
  
  currentDoctorId = doctorId;
  document.getElementById('doctor-selection').classList.add('hidden');
  document.getElementById('doctor-workspace').classList.remove('hidden');
  updateDoctorQueue();
}

function updateDoctorQueue() {
  // ACCESS CONTROL CHECK
  if (!checkAccess('doctor')) {
    showAccessDeniedMessage('doctor');
    showModule('dashboard');
    return;
  }
  
  const queueContainer = document.getElementById('doctor-queue');
  const waitingPatients = patientVisits.filter(
    v => v.doctor_id === currentDoctorId && v.consultation_status === 'Waiting'
  );

  if (waitingPatients.length === 0) {
    queueContainer.innerHTML = '<div class="empty-state">No patients in queue</div>';
    return;
  }

  queueContainer.innerHTML = '';
  
  const infoBox = document.createElement('div');
  infoBox.style.padding = 'var(--space-12)';
  infoBox.style.background = 'var(--color-bg-3)';
  infoBox.style.borderRadius = 'var(--radius-base)';
  infoBox.style.marginBottom = 'var(--space-16)';
  infoBox.style.fontSize = 'var(--font-size-sm)';
  infoBox.innerHTML = '<strong>ℹ️ Doctor View:</strong> Patient names and contact details are hidden for privacy. Use token numbers only.';
  queueContainer.appendChild(infoBox);
  
  waitingPatients.forEach(visit => {
    const queueItem = document.createElement('div');
    queueItem.className = 'queue-item';
    queueItem.innerHTML = `
      <div>
        <span class="token-badge">${visit.current_token_number}</span>
        <span class="status ${visit.case_type === 'New Case' ? 'status--info' : 'status--warning'}" style="margin-left: var(--space-8);">
          ${visit.case_type}
        </span>
      </div>
      <button class="btn btn--primary btn--sm" onclick="callNextToken('${visit.current_token_number}')">Call Token</button>
    `;
    queueContainer.appendChild(queueItem);
  });
}

function callNextToken(token) {
  // ACCESS CONTROL CHECK
  if (!checkAccess('doctor')) {
    showAccessDeniedMessage('doctor');
    return;
  }
  
  const visit = patientVisits.find(v => v.current_token_number === token);
  if (!visit) return;

  currentPatientVisit = visit;
  visit.consultation_status = 'In Consultation';
  visit.payment_status = 'In Consultation';

  // Display patient context
  document.getElementById('consult-token').textContent = visit.current_token_number;
  document.getElementById('consult-case-type').textContent = visit.case_type;

  if (visit.case_type === 'Old Case' && visit.last_visit_date) {
    document.getElementById('old-case-context').classList.remove('hidden');
    document.getElementById('consult-last-visit').textContent = formatDate(visit.last_visit_date);
    document.getElementById('consult-prev-diagnosis').textContent = visit.last_illness_diagnosis || 'N/A';
    document.getElementById('consult-prev-medicine').textContent = visit.last_suggested_medicine || 'N/A';
  } else {
    document.getElementById('old-case-context').classList.add('hidden');
  }

  // Clear form
  document.getElementById('consultation-form').reset();

  // Show consultation area
  document.getElementById('consultation-area').classList.remove('hidden');
  
  saveToStorage();
}

function submitConsultation(event) {
  event.preventDefault();

  // ACCESS CONTROL CHECK
  if (!checkAccess('doctor')) {
    showAccessDeniedMessage('doctor');
    return;
  }

  if (!currentPatientVisit) return;

  const diagnosis = document.getElementById('diagnosis').value.trim();
  const treatment = document.getElementById('treatment').value.trim();
  const chargeAmount = parseFloat(document.getElementById('charge-amount').value);

  if (!diagnosis || !treatment || !chargeAmount) {
    alert('Please fill all required fields');
    return;
  }

  // Update visit
  currentPatientVisit.current_diagnosis = diagnosis;
  currentPatientVisit.current_treatment = treatment;
  currentPatientVisit.final_charge_amount = chargeAmount;
  currentPatientVisit.consultation_status = 'Completed';
  currentPatientVisit.payment_status = 'Pending Payment';

  // Update patient record
  const patient = patients.find(p => p.patient_id === currentPatientVisit.patient_id);
  if (patient) {
    patient.last_visit_date = currentPatientVisit.date_of_visit.split('T')[0];
    patient.last_illness_diagnosis = diagnosis;
    patient.last_suggested_medicine = treatment;
  }

  alert('Consultation completed successfully! Patient sent to billing.');

  // Reset
  currentPatientVisit = null;
  document.getElementById('consultation-area').classList.add('hidden');
  updateDoctorQueue();
  updateDashboardStats();
  saveToStorage();
}



function updatePendingPaymentsList() {
  const pendingList = document.getElementById('pending-payments-list');
  const pendingPayments = patientVisits.filter(
    v => v.payment_status === 'Pending' && v.consultation_status === 'Completed'
  );

  if (pendingPayments.length === 0) {
    pendingList.innerHTML = '<div class="empty-state">No pending payments</div>';
    return;
  }

  pendingList.innerHTML = '';
  pendingPayments.forEach(visit => {
    const item = document.createElement('div');
    item.style.marginBottom = 'var(--space-8)';
    item.style.padding = 'var(--space-12)';
    item.style.border = '1px solid var(--color-border)';
    item.style.borderRadius = 'var(--radius-base)';
    item.style.cursor = 'pointer';
    item.onclick = () => {
      document.getElementById('payment-search').value = visit.current_token_number;
      lookupPayment({ preventDefault: () => {} });
    };
    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: var(--font-weight-medium);">${visit.current_token_number} - ${visit.name}</div>
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">${visit.contact_number}</div>
        </div>
        <div style="font-weight: var(--font-weight-bold); color: var(--color-primary);">
          ${formatCurrency(visit.final_charge_amount)}
        </div>
      </div>
    `;
    pendingList.appendChild(item);
  });
}

function lookupPayment(event) {
  event.preventDefault();

  // ACCESS CONTROL CHECK
  if (!checkAccess('reception')) {
    showAccessDeniedMessage('reception');
    return;
  }

  const searchTerm = document.getElementById('payment-search').value.trim().toLowerCase();
  if (!searchTerm) {
    alert('Please enter a token number or patient name');
    return;
  }

  const visit = patientVisits.find(
    v => v.current_token_number.toLowerCase() === searchTerm || 
         v.name.toLowerCase().includes(searchTerm)
  );

  if (!visit) {
    alert('Patient not found');
    return;
  }

  if (visit.consultation_status !== 'Completed') {
    alert('Consultation not yet completed for this patient');
    return;
  }

  // Display payment details
  document.getElementById('payment-token').textContent = visit.current_token_number;
  document.getElementById('payment-name').textContent = visit.name;
  document.getElementById('payment-contact').textContent = visit.contact_number;
  document.getElementById('payment-case-type').textContent = visit.case_type;
  document.getElementById('payment-amount').textContent = formatCurrency(visit.final_charge_amount);

  const statusBadge = document.createElement('span');
  statusBadge.className = `status ${visit.payment_status === 'Paid' ? 'status--success' : 'status--error'}`;
  statusBadge.textContent = visit.payment_status;
  document.getElementById('payment-status-display').innerHTML = '';
  document.getElementById('payment-status-display').appendChild(statusBadge);

  // Show/hide payment form based on status
  if (visit.payment_status === 'Paid') {
    document.getElementById('payment-form-area').style.display = 'none';
  } else {
    document.getElementById('payment-form-area').style.display = 'block';
    document.getElementById('payment-form').reset();
  }

  document.getElementById('payment-details').classList.remove('hidden');
  document.getElementById('receipt-display').classList.add('hidden');

  // Store current visit for payment processing
  window.currentPaymentVisit = visit;
}

function processPayment(event) {
  event.preventDefault();

  // ACCESS CONTROL CHECK
  if (!checkAccess('reception')) {
    showAccessDeniedMessage('reception');
    return;
  }

  const visit = window.currentPaymentVisit;
  if (!visit) return;

  const paymentMethod = document.getElementById('payment-method').value;
  if (!paymentMethod) {
    alert('Please select a payment method');
    return;
  }

  // Update payment status
  visit.payment_status = 'Paid';
  visit.payment_method = paymentMethod;
  visit.payment_date = getCurrentDate();

  // Generate receipt with full details
  const now = new Date();
  const dateTimeString = now.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) + ', ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const receiptNo = `RCP-${getCurrentDate().replace(/-/g, '')}-${String(receiptCounter++).padStart(3, '0')}`;
  
  document.getElementById('receipt-number').textContent = receiptNo;
  document.getElementById('receipt-date').textContent = dateTimeString;
  document.getElementById('receipt-token').textContent = visit.current_token_number;
  document.getElementById('receipt-patient').textContent = visit.name;
  document.getElementById('receipt-contact').textContent = visit.contact_number;
  document.getElementById('receipt-doctor').textContent = visit.doctor_name;
  document.getElementById('receipt-case-type').textContent = visit.case_type;
  document.getElementById('receipt-method').textContent = paymentMethod;
  document.getElementById('receipt-amount').textContent = formatCurrency(visit.final_charge_amount);
  
  // Store receipt data for sharing/reprinting
  visit.receipt_number = receiptNo;
  visit.receipt_date = dateTimeString;
  
  // Save to receipt history
  saveReceiptToHistory({
    receipt_number: receiptNo,
    date_time: dateTimeString,
    patient_id: visit.patient_id,
    patient_name: visit.name,
    contact_number: visit.contact_number,
    token_number: visit.current_token_number,
    doctor_name: visit.doctor_name,
    case_type: visit.case_type,
    consultation_fee: visit.final_charge_amount,
    payment_method: paymentMethod
  });

  // Show receipt
  document.getElementById('receipt-display').classList.remove('hidden');
  document.getElementById('payment-details').classList.add('hidden');

  // Update pending list
  updatePendingPaymentsList();
  updateDashboardStats();
  saveToStorage();

  alert('Payment processed successfully!');
}

// Archive old records (older than 1 year)
function archiveOldRecords() {
  const currentDate = new Date();
  const oneYearAgo = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));
  
  // Find visits older than 1 year
  const toArchive = patientVisits.filter(visit => {
    const visitDate = new Date(visit.date_of_visit);
    return visitDate < oneYearAgo;
  });
  
  if (toArchive.length > 0) {
    // Move to archive
    archivedPatients.push(...toArchive);
    
    // Remove from active
    patientVisits = patientVisits.filter(visit => {
      const visitDate = new Date(visit.date_of_visit);
      return visitDate >= oneYearAgo;
    });
    
    console.log(`Archived ${toArchive.length} records older than 1 year`);
    saveToStorage();
  }
}

// Find last visit from both active and archived records
function findLastVisitAllRecords(contactNumber) {
  // Check active records first
  let lastVisit = patientVisits
    .filter(p => p.contact_number === contactNumber)
    .sort((a, b) => new Date(b.date_of_visit) - new Date(a.date_of_visit))[0];
  
  // If not found or check archive for older visits
  if (!lastVisit && archivedPatients.length > 0) {
    lastVisit = archivedPatients
      .filter(p => p.contact_number === contactNumber)
      .sort((a, b) => new Date(b.date_of_visit) - new Date(a.date_of_visit))[0];
  }
  
  return lastVisit;
}

// Save receipt to history
function saveReceiptToHistory(receiptData) {
  receipts.push({
    receipt_number: receiptData.receipt_number,
    date_time: receiptData.date_time,
    timestamp: Date.now(),
    patient_id: receiptData.patient_id,
    patient_name: receiptData.patient_name,
    contact_number: receiptData.contact_number,
    token_number: receiptData.token_number,
    doctor_name: receiptData.doctor_name,
    case_type: receiptData.case_type,
    consultation_fee: receiptData.consultation_fee,
    payment_method: receiptData.payment_method,
    payment_status: 'Paid'
  });
  saveToStorage();
}

// Initialize app
function initializeApp() {
  loadFromStorage();
  // Run archive process on startup
  archiveOldRecords();
  
  // CRITICAL: Hide all modals by default
  document.querySelectorAll('.modal, [id$="-modal"]').forEach(modal => {
    modal.style.display = 'none';
  });
  
  // Ensure receipt modal is hidden
  const receiptModal = document.getElementById('receipt-detail-modal');
  if (receiptModal) {
    receiptModal.style.display = 'none';
  }
  
  // App starts at login screen
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('app-screen').classList.add('hidden');
  
  // Set up modal close handlers
  setupModalHandlers();
}

// Share receipt function for mobile devices
function shareReceipt() {
  const visit = window.currentPaymentVisit;
  if (!visit) return;
  
  const receiptText = `
═══════════════════════════════════
CITY MEDICAL CENTER
Porbandar, Gujarat
═══════════════════════════════════

PAYMENT RECEIPT

Date: ${document.getElementById('receipt-date').textContent}
Receipt No: ${document.getElementById('receipt-number').textContent}

───────────────────────────────────
Patient Details:
───────────────────────────────────
Name: ${visit.name}
Contact: ${visit.contact_number}
Token: ${visit.current_token_number}

───────────────────────────────────
Consultation Details:
───────────────────────────────────
Doctor: ${visit.doctor_name}
Case Type: ${visit.case_type}

───────────────────────────────────
Payment Details:
───────────────────────────────────
Consultation Fee: ${formatCurrency(visit.final_charge_amount)}
Payment Method: ${visit.payment_method}
Payment Status: PAID ✓

═══════════════════════════════════
Thank you for visiting!
═══════════════════════════════════
  `.trim();
  
  // Try native share API for mobile
  if (navigator.share) {
    navigator.share({
      title: 'Payment Receipt - City Medical Center',
      text: receiptText
    }).catch(err => {
      console.log('Share failed:', err);
      fallbackCopyReceipt(receiptText);
    });
  } else {
    fallbackCopyReceipt(receiptText);
  }
}

function fallbackCopyReceipt(text) {
  // Create temporary textarea to copy text
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    alert('Receipt copied to clipboard! You can now paste it in WhatsApp, SMS, or email.');
  } catch (err) {
    alert('Could not copy receipt. Please use the Print option instead.');
  }
  
  document.body.removeChild(textarea);
}

// Set up modal event handlers
function setupModalHandlers() {
  const modal = document.getElementById('receipt-detail-modal');
  if (!modal) return;
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeReceiptModal();
    }
  });
  
  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeReceiptModal();
    }
  });
}

// Run initialization
initializeApp();
// ============================================================
// VITASYNC — Data Store
// LocalStorage-backed store with mock data for Metropolitan Hospital
// ============================================================

import type {
  User, Ward, Nurse, ShiftType, ShiftRequirement,
  LeaveRequest, Roster, Assignment, SwapRequest,
  Notification, ConstraintConfig, SystemLog,
} from '../types';

const STORAGE_KEY = 'vitasync_metropolitan_hospital_pro';

// ============================================================
// MOCK DATA — Metropolitan Hospital
// ============================================================

const INITIAL_USERS: User[] = [
  { id: 'u1', email: 'manager@metrohospital.go.ke', full_name: 'Grace Wanjiku', phone: '+254700001001', role: 'manager', is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'u2', email: 'nurse1@metrohospital.go.ke', full_name: 'James Ochieng', phone: '+254700001002', role: 'nurse', is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'u3', email: 'nurse2@metrohospital.go.ke', full_name: 'Mary Akinyi', phone: '+254700001003', role: 'nurse', is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'u4', email: 'nurse3@metrohospital.go.ke', full_name: 'Peter Kamau', phone: '+254700001004', role: 'nurse', is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'u5', email: 'nurse4@metrohospital.go.ke', full_name: 'Faith Njeri', phone: '+254700001005', role: 'nurse', is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 'u12', email: 'admin@metrohospital.go.ke', full_name: 'Admin User', phone: '+254700001099', role: 'admin', is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
];

const INITIAL_WARDS: Ward[] = [
  { id: 'w1', name: 'General Ward A', location: 'Block A, 2nd Floor', min_night_staff: 2, min_morning_staff: 4, min_afternoon_staff: 3 },
  { id: 'w2', name: 'ICU', location: 'Block B, 1st Floor', min_night_staff: 3, min_morning_staff: 5, min_afternoon_staff: 4 },
  { id: 'w3', name: 'Paediatric Ward', location: 'Block C, 3rd Floor', min_night_staff: 2, min_morning_staff: 3, min_afternoon_staff: 3 },
  { id: 'w4', name: 'Maternity Ward', location: 'Block A, 1st Floor', min_night_staff: 3, min_morning_staff: 4, min_afternoon_staff: 4 },
];

const INITIAL_NURSES: Nurse[] = [
  { id: 'n1', user_id: 'u2', ward_id: 'w1', employee_id: 'MH-NRS-001', seniority: 5, max_hours_per_week: 45, skills: ['IV Therapy', 'Wound Care'], created_at: '2025-01-01T00:00:00Z', full_name: 'James Ochieng', email: 'nurse1@metrohospital.go.ke', phone: '+254700001002' },
  { id: 'n2', user_id: 'u3', ward_id: 'w1', employee_id: 'MH-NRS-002', seniority: 3, max_hours_per_week: 40, skills: ['Medication', 'Patient Assessment'], created_at: '2025-01-01T00:00:00Z', full_name: 'Mary Akinyi', email: 'nurse2@metrohospital.go.ke', phone: '+254700001003' },
  { id: 'n3', user_id: 'u4', ward_id: 'w2', employee_id: 'MH-NRS-003', seniority: 8, max_hours_per_week: 45, skills: ['Critical Care', 'Ventilators'], created_at: '2025-01-01T00:00:00Z', full_name: 'Peter Kamau', email: 'nurse3@metrohospital.go.ke', phone: '+254700001004' },
  { id: 'n4', user_id: 'u5', ward_id: 'w2', employee_id: 'MH-NRS-004', seniority: 4, max_hours_per_week: 40, skills: ['ECG', 'ICU Care'], created_at: '2025-01-01T00:00:00Z', full_name: 'Faith Njeri', email: 'nurse4@metrohospital.go.ke', phone: '+254700001005' },
];

const INITIAL_SHIFT_TYPES: ShiftType[] = [
  { id: 'st1', name: 'Morning', start_time: '06:00', end_time: '14:00', duration_hours: 8 },
  { id: 'st2', name: 'Afternoon', start_time: '14:00', end_time: '22:00', duration_hours: 8 },
  { id: 'st3', name: 'Night', start_time: '22:00', end_time: '06:00', duration_hours: 8 },
];

const INITIAL_SHIFT_REQUIREMENTS: ShiftRequirement[] = [
  { id: 'sr1', ward_id: 'w1', shift_type_id: 'st1', day_of_week: 1, min_nurses: 4, max_nurses: 6 },
  { id: 'sr2', ward_id: 'w1', shift_type_id: 'st2', day_of_week: 1, min_nurses: 3, max_nurses: 5 },
  { id: 'sr3', ward_id: 'w1', shift_type_id: 'st3', day_of_week: 1, min_nurses: 2, max_nurses: 3 },
];

const INITIAL_CONSTRAINTS: ConstraintConfig[] = [
  { id: 'hc1', name: 'Minimum Staff Coverage', description: 'At least minimum nurses per shift enforced', severity: 'hard', weight: 100, value: 1, enabled: true },
  { id: 'hc2', name: 'No Same-Day Double Shifts', description: 'A nurse cannot work more than 1 shift per day', severity: 'hard', weight: 100, value: 1, enabled: true },
  { id: 'hc3', name: '11-Hour Minimum Rest Period', description: 'Rest time requirement between consecutive shifts', severity: 'hard', weight: 100, value: 11, enabled: true },
  { id: 'hc4', name: 'Max 6 Consecutive Working Days', description: 'Nurse must have a day off after 6 consecutive work days', severity: 'hard', weight: 100, value: 6, enabled: true },
  { id: 'hc5', name: 'Max 4 Night Shifts Per Week', description: 'No more than 4 night shifts in any 7-day period', severity: 'hard', weight: 100, value: 4, enabled: true },
  { id: 'sc1', name: 'Balanced Weekends', description: 'Spread weekend assignments fairly across all nurses', severity: 'soft', weight: 15, value: 1, enabled: true },
  { id: 'sc2', name: 'Honor Registered Leave Requests', description: 'Minimize scheduling during approved leave times', severity: 'soft', weight: 25, value: 1, enabled: true },
  { id: 'sc3', name: 'Avoid Consecutive Weekends', description: 'Penalize assignment on back-to-back weekends', severity: 'soft', weight: 10, value: 1, enabled: true },
];

const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'lr1', nurse_id: 'n2', start_date: '2026-03-10', end_date: '2026-03-14', reason: 'Annual Leave', status: 'pending', requested_at: '2026-01-28T10:00:00Z', processed_by: null },
  { id: 'lr2', nurse_id: 'n1', start_date: '2026-03-20', end_date: '2026-03-22', reason: 'Medical Checkup', status: 'approved', requested_at: '2026-01-20T09:00:00Z', processed_by: 'u1' },
];

const INITIAL_SWAP_REQUESTS: SwapRequest[] = [];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'nt1', user_id: 'u1', type: 'in-app', subject: 'System Seeding Successful', body: 'VitaSync operational data created successfully.', sent_at: '2026-01-28T10:00:00Z', status: 'sent', reference_id: null },
];

const INITIAL_LOGS: SystemLog[] = [
  { id: 'lg1', timestamp: new Date().toISOString(), event: 'Core Module Launch', details: 'VitaSync Pro runtime successfully loaded', user: 'Admin User', type: 'auth' },
];

function load<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY}_${key}`);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(data));
}

function genId(): string {
  return 'vtp_' + Math.random().toString(36).substring(2, 11);
}

export const store = {
  // Users
  getUsers: (): User[] => load('users', INITIAL_USERS),
  saveUsers: (users: User[]) => save('users', users),
  getUserById: (id: string): User | undefined => store.getUsers().find(u => u.id === id),
  getUserByEmail: (email: string): User | undefined => store.getUsers().find(u => u.email === email),
  createUser: (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): User => {
    const users = store.getUsers();
    const newUser: User = { ...user, id: genId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    users.push(newUser);
    store.saveUsers(users);
    store.createLog('New User Created', `Email: ${newUser.email}, Role: ${newUser.role}`, 'Admin', 'auth');
    return newUser;
  },
  updateUser: (id: string, updates: Partial<User>): User | null => {
    const users = store.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates, updated_at: new Date().toISOString() };
    store.saveUsers(users);
    return users[idx];
  },
  deleteUser: (id: string): boolean => {
    const users = store.getUsers().filter(u => u.id !== id);
    if (users.length === store.getUsers().length) return false;
    store.saveUsers(users);
    return true;
  },

  // Wards
  getWards: (): Ward[] => load('wards', INITIAL_WARDS),
  saveWards: (wards: Ward[]) => save('wards', wards),
  createWard: (ward: Omit<Ward, 'id'>): Ward => {
    const wards = store.getWards();
    const newWard = { ...ward, id: genId() };
    wards.push(newWard);
    store.saveWards(wards);
    store.createLog('New Ward Added', `Ward: ${newWard.name}`, 'Manager', 'config');
    return newWard;
  },
  updateWard: (id: string, updates: Partial<Ward>): Ward | null => {
    const wards = store.getWards();
    const idx = wards.findIndex(w => w.id === id);
    if (idx === -1) return null;
    wards[idx] = { ...wards[idx], ...updates };
    store.saveWards(wards);
    return wards[idx];
  },
  deleteWard: (id: string): boolean => {
    const wards = store.getWards().filter(w => w.id !== id);
    if (wards.length === store.getWards().length) return false;
    store.saveWards(wards);
    return true;
  },

  // Nurses
  getNurses: (): Nurse[] => load('nurses', INITIAL_NURSES),
  saveNurses: (nurses: Nurse[]) => save('nurses', nurses),
  getNursesByWard: (wardId: string): Nurse[] => store.getNurses().filter(n => n.ward_id === wardId),
  getNurseById: (id: string): Nurse | undefined => store.getNurses().find(n => n.id === id),
  createNurse: (nurse: Omit<Nurse, 'id' | 'created_at'>): Nurse => {
    const nurses = store.getNurses();
    const newNurse = { ...nurse, id: genId(), created_at: new Date().toISOString() };
    nurses.push(newNurse);
    store.saveNurses(nurses);
    store.createLog('Nurse Added', `Nurse: ${newNurse.full_name}, Ward ID: ${newNurse.ward_id}`, 'Manager', 'config');
    return newNurse;
  },
  updateNurse: (id: string, updates: Partial<Nurse>): Nurse | null => {
    const nurses = store.getNurses();
    const idx = nurses.findIndex(n => n.id === id);
    if (idx === -1) return null;
    nurses[idx] = { ...nurses[idx], ...updates };
    store.saveNurses(nurses);
    return nurses[idx];
  },
  deleteNurse: (id: string): boolean => {
    const nurses = store.getNurses().filter(n => n.id !== id);
    if (nurses.length === store.getNurses().length) return false;
    store.saveNurses(nurses);
    return true;
  },

  // Shift Types
  getShiftTypes: (): ShiftType[] => load('shiftTypes', INITIAL_SHIFT_TYPES),
  getShiftTypeById: (id: string): ShiftType | undefined => store.getShiftTypes().find(s => s.id === id),

  // Shift Requirements
  getShiftRequirements: (): ShiftRequirement[] => load('shiftRequirements', INITIAL_SHIFT_REQUIREMENTS),
  saveShiftRequirements: (reqs: ShiftRequirement[]) => save('shiftRequirements', reqs),
  getRequirementsByWard: (wardId: string): ShiftRequirement[] => store.getShiftRequirements().filter(r => r.ward_id === wardId),

  // Leave Requests
  getLeaveRequests: (): LeaveRequest[] => load('leaveRequests', INITIAL_LEAVE_REQUESTS),
  saveLeaveRequests: (reqs: LeaveRequest[]) => save('leaveRequests', reqs),
  getLeaveByNurse: (nurseId: string): LeaveRequest[] => store.getLeaveRequests().filter(l => l.nurse_id === nurseId),
  createLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'requested_at' | 'processed_by' | 'status'>): LeaveRequest => {
    const reqs = store.getLeaveRequests();
    const newReq: LeaveRequest = { ...req, id: genId(), status: 'pending', requested_at: new Date().toISOString(), processed_by: null };
    reqs.push(newReq);
    store.saveLeaveRequests(reqs);
    store.createLog('New Leave Request Registered', `Nurse ID: ${newReq.nurse_id}`, 'Nurse', 'leave');
    return newReq;
  },
  updateLeaveRequest: (id: string, updates: Partial<LeaveRequest>): LeaveRequest | null => {
    const reqs = store.getLeaveRequests();
    const idx = reqs.findIndex(r => r.id === id);
    if (idx === -1) return null;
    reqs[idx] = { ...reqs[idx], ...updates };
    store.saveLeaveRequests(reqs);
    return reqs[idx];
  },

  // Constraints
  getConstraints: (): ConstraintConfig[] => load('constraints', INITIAL_CONSTRAINTS),
  saveConstraints: (constraints: ConstraintConfig[]) => save('constraints', constraints),
  getHardConstraints: (): ConstraintConfig[] => store.getConstraints().filter(c => c.severity === 'hard'),
  getSoftConstraints: (): ConstraintConfig[] => store.getConstraints().filter(c => c.severity === 'soft'),
  updateConstraint: (id: string, updates: Partial<ConstraintConfig>): ConstraintConfig | null => {
    const constraints = store.getConstraints();
    const idx = constraints.findIndex(c => c.id === id);
    if (idx === -1) return null;
    constraints[idx] = { ...constraints[idx], ...updates };
    store.saveConstraints(constraints);
    return constraints[idx];
  },

  // Rosters
  getRosters: (): Roster[] => load('rosters', []),
  saveRosters: (rosters: Roster[]) => save('rosters', rosters),
  getRosterById: (id: string): Roster | undefined => store.getRosters().find(r => r.id === id),
  createRoster: (roster: Omit<Roster, 'id' | 'generated_at'>): Roster => {
    const rosters = store.getRosters();
    const newRoster: Roster = { ...roster, id: genId(), generated_at: new Date().toISOString() };
    rosters.push(newRoster);
    store.saveRosters(rosters);
    store.createLog('Roster Generated', `Roster ID: ${newRoster.id} Month: ${newRoster.month}`, 'Solver', 'roster');
    return newRoster;
  },
  updateRoster: (id: string, updates: Partial<Roster>): Roster | null => {
    const rosters = store.getRosters();
    const idx = rosters.findIndex(r => r.id === id);
    if (idx === -1) return null;
    rosters[idx] = { ...rosters[idx], ...updates };
    store.saveRosters(rosters);
    return rosters[idx];
  },

  // Assignments
  getAssignments: (): Assignment[] => load('assignments', []),
  saveAssignments: (assignments: Assignment[]) => save('assignments', assignments),
  getAssignmentsByRoster: (rosterId: string): Assignment[] => store.getAssignments().filter(a => a.roster_id === rosterId),
  createAssignment: (assignment: Omit<Assignment, 'id'>): Assignment => {
    const assignments = store.getAssignments();
    const newAssignment = { ...assignment, id: genId() };
    assignments.push(newAssignment);
    store.saveAssignments(assignments);
    return newAssignment;
  },
  updateAssignment: (id: string, updates: Partial<Assignment>): Assignment | null => {
    const assignments = store.getAssignments();
    const idx = assignments.findIndex(a => a.id === id);
    if (idx === -1) return null;
    assignments[idx] = { ...assignments[idx], ...updates };
    store.saveAssignments(assignments);
    return assignments[idx];
  },
  deleteAssignment: (id: string): boolean => {
    const assignments = store.getAssignments().filter(a => a.id !== id);
    if (assignments.length === store.getAssignments().length) return false;
    store.saveAssignments(assignments);
    return true;
  },

  // Swap Requests
  getSwapRequests: (): SwapRequest[] => load('swapRequests', INITIAL_SWAP_REQUESTS),
  saveSwapRequests: (reqs: SwapRequest[]) => save('swapRequests', reqs),
  getSwapsByNurse: (nurseId: string): SwapRequest[] => store.getSwapRequests().filter(s => s.requesting_nurse_id === nurseId || s.target_nurse_id === nurseId),
  createSwapRequest: (req: Omit<SwapRequest, 'id' | 'created_at' | 'resolved_at' | 'status'>): SwapRequest => {
    const reqs = store.getSwapRequests();
    const newReq: SwapRequest = { ...req, id: genId(), status: 'pending', created_at: new Date().toISOString(), resolved_at: null };
    reqs.push(newReq);
    store.saveSwapRequests(reqs);
    return newReq;
  },
  updateSwapRequest: (id: string, updates: Partial<SwapRequest>): SwapRequest | null => {
    const reqs = store.getSwapRequests();
    const idx = reqs.findIndex(r => r.id === id);
    if (idx === -1) return null;
    reqs[idx] = { ...reqs[idx], ...updates, resolved_at: updates.status !== 'pending' ? new Date().toISOString() : null };
    store.saveSwapRequests(reqs);
    return reqs[idx];
  },

  // Notifications
  getNotifications: (): Notification[] => load('notifications', INITIAL_NOTIFICATIONS),
  saveNotifications: (notifs: Notification[]) => save('notifications', notifs),
  getNotificationsByUser: (userId: string): Notification[] => store.getNotifications().filter(n => n.user_id === userId),
  createNotification: (notif: Omit<Notification, 'id' | 'sent_at'>): Notification => {
    const notifs = store.getNotifications();
    const newNotif: Notification = { ...notif, id: genId(), sent_at: new Date().toISOString() };
    notifs.push(newNotif);
    store.saveNotifications(notifs);
    return newNotif;
  },

  // Logs
  getLogs: (): SystemLog[] => load('logs', INITIAL_LOGS),
  saveLogs: (logs: SystemLog[]) => save('logs', logs),
  createLog: (event: string, details: string, user: string, type: SystemLog['type']): SystemLog => {
    const logs = store.getLogs();
    const newLog: SystemLog = { id: genId(), timestamp: new Date().toISOString(), event, details, user, type };
    logs.push(newLog);
    store.saveLogs(logs);
    return newLog;
  },

  reset: () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_KEY)) localStorage.removeItem(key);
    });
    window.location.reload();
  },

  genId,
};

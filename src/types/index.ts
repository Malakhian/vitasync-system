// ============================================================
// VITASYNC — Advanced Production Type Definitions
// Metropolitan Hospital Nurse Scheduling System
// ============================================================

export type UserRole = 'manager' | 'nurse' | 'admin';
export type ShiftName = 'Morning' | 'Afternoon' | 'Night';
export type LeaveStatus = 'pending' | 'approved' | 'denied';
export type RosterStatus = 'draft' | 'published' | 'archived';
export type SwapStatus = 'pending' | 'approved' | 'rejected';
export type NotificationType = 'email' | 'sms' | 'in-app';
export type NotificationStatus = 'sent' | 'pending' | 'failed';
export type ConstraintSeverity = 'hard' | 'soft';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface Ward {
  id: string;
  name: string;
  location: string;
  min_night_staff: number;
  min_morning_staff: number;
  min_afternoon_staff: number;
}

export interface Nurse {
  id: string;
  user_id: string;
  ward_id: string;
  employee_id: string;
  seniority: number;
  max_hours_per_week: number;
  skills: string[];
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
}

export interface ShiftType {
  id: string;
  name: ShiftName;
  start_time: string; 
  end_time: string;   
  duration_hours: number;
}

export interface ShiftRequirement {
  id: string;
  ward_id: string;
  shift_type_id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  min_nurses: number;
  max_nurses: number;
}

export interface LeaveRequest {
  id: string;
  nurse_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  reason: string;
  status: LeaveStatus;
  requested_at: string;
  processed_by: string | null;
}

export interface Roster {
  id: string;
  ward_id: string;
  month: number;
  year: number;
  generated_at: string;
  status: RosterStatus;
  solver_time_ms: number;
  objective_value: number;
}

export interface Assignment {
  id: string;
  roster_id: string;
  nurse_id: string;
  date: string; // YYYY-MM-DD
  shift_type_id: string;
}

export interface SwapRequest {
  id: string;
  roster_id: string;
  requesting_nurse_id: string;
  target_nurse_id: string;
  original_shift_date: string;
  original_shift_type_id: string;
  requested_shift_date: string;
  requested_shift_type_id: string;
  status: SwapStatus;
  created_at: string;
  resolved_at: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  subject: string;
  body: string;
  sent_at: string;
  status: NotificationStatus;
  reference_id: string | null;
}

export interface ConstraintConfig {
  id: string;
  name: string;
  description: string;
  severity: ConstraintSeverity;
  weight: number;
  value: number | string;
  enabled: boolean;
}

export interface SolverResult {
  roster_id: string;
  assignments: Assignment[];
  solver_time_ms: number;
  objective_value: number;
  is_feasible: boolean;
  violations: string[];
}

export interface FairnessMetrics {
  nurse_id: string;
  full_name: string;
  total_shifts: number;
  morning_shifts: number;
  afternoon_shifts: number;
  night_shifts: number;
  weekend_shifts: number;
  gini_coefficient: number;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  event: string;
  details: string;
  user: string;
  type: 'auth' | 'roster' | 'leave' | 'swap' | 'config';
}

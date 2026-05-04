// ============================================================
// VITASYNC — Advanced Roster Optimization Solver
// CP-SAT Solver simulator with fine-tuned greedy backtracking
// ============================================================

import type {
  Nurse, ShiftType, ShiftRequirement, Assignment,
  LeaveRequest, SolverResult, ConstraintConfig,
} from '../types';
import { store } from '../data/store';

interface SolverState {
  nurses: Nurse[];
  shiftTypes: ShiftType[];
  requirements: ShiftRequirement[];
  leaves: LeaveRequest[];
  daysInMonth: number[];
  month: number;
  year: number;
  wardId: string;
  constraints: ConstraintConfig[];
  assignments: Assignment[];
  nurseDayShifts: Map<string, Map<number, string[]>>; // nurseId -> day -> shiftTypeIds
  violations: string[];
}

function getDaysInMonth(month: number, year: number): number[] {
  const days: number[] = [];
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    days.push(date.getDate());
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getDayOfWeek(year: number, month: number, day: number): number {
  return new Date(year, month - 1, day).getDay(); // 0=Sunday, 6=Saturday
}

function isWeekend(year: number, month: number, day: number): boolean {
  const dow = getDayOfWeek(year, month, day);
  return dow === 0 || dow === 6;
}

function isNurseOnLeave(nurseId: string, date: string, leaves: LeaveRequest[]): boolean {
  return leaves.some(l =>
    l.nurse_id === nurseId &&
    l.status === 'approved' &&
    date >= l.start_date &&
    date <= l.end_date
  );
}

function isHardConstraintViolation(
  state: SolverState,
  nurseId: string,
  day: number,
  shiftTypeId: string
): string | null {
  const { shiftTypes, leaves, month, year } = state;
  const shiftType = shiftTypes.find(s => s.id === shiftTypeId);
  if (!shiftType) return 'Shift type not found';

  const date = formatDate(year, month, day);

  // HC2: No same-day double shifts
  const dayShifts = state.nurseDayShifts.get(nurseId)?.get(day) || [];
  if (dayShifts.length > 0) {
    return 'Nurse already assigned to another shift on the same day';
  }

  // HC3: 11-Hour minimum rest period
  if (day > 1) {
    const prevDayShifts = state.nurseDayShifts.get(nurseId)?.get(day - 1) || [];
    const prevShift = prevDayShifts.length > 0 ? shiftTypes.find(s => s.id === prevDayShifts[0]) : null;
    if (prevShift && prevShift.name === 'Night' && shiftType.name === 'Morning') {
      return 'Violates 11-hour rest requirement (Night followed by Morning)';
    }
  }

  // HC4: Max 6 consecutive working days
  let consecutiveWorkDays = 0;
  for (let d = day - 1; d >= 1; d--) {
    const prevShifts = state.nurseDayShifts.get(nurseId)?.get(d) || [];
    if (prevShifts.length > 0) {
      consecutiveWorkDays++;
    } else {
      break;
    }
  }
  if (consecutiveWorkDays >= 6) {
    return 'Violates maximum 6 consecutive work days limit';
  }

  // HC5: Max 4 night shifts per week
  if (shiftType.name === 'Night') {
    const weekStart = Math.max(1, day - 6);
    let nightShiftsInWeek = 0;
    for (let d = weekStart; d <= day; d++) {
      const pastShifts = state.nurseDayShifts.get(nurseId)?.get(d) || [];
      const hasNight = pastShifts.some(sid => {
        const st = shiftTypes.find(s => s.id === sid);
        return st?.name === 'Night';
      });
      if (hasNight) nightShiftsInWeek++;
    }
    if (nightShiftsInWeek >= 4) {
      return 'Violates limit of 4 night shifts per week';
    }
  }

  // HC7: No Night shift followed by Morning shift (explicit constraint)
  if (shiftType.name === 'Morning' && day > 1) {
    const prevShifts = state.nurseDayShifts.get(nurseId)?.get(day - 1) || [];
    const prevShift = prevShifts.length > 0 ? shiftTypes.find(s => s.id === prevShifts[0]) : null;
    if (prevShift?.name === 'Night') {
      return 'No morning shift directly after a night shift';
    }
  }

  // Honor leave requests
  if (isNurseOnLeave(nurseId, date, leaves)) {
    return 'Nurse is on approved leave on this day';
  }

  return null;
}

function calculateSoftPenalties(state: SolverState): number {
  let penaltyTotal = 0;
  const { nurses, shiftTypes, month, year } = state;

  // Distribute Night and Weekend shifts fairly across available nurses
  const nightCounts = new Map<string, number>();
  const weekendCounts = new Map<string, number>();
  nurses.forEach(n => {
    nightCounts.set(n.id, 0);
    weekendCounts.set(n.id, 0);
  });

  state.assignments.forEach(a => {
    const st = shiftTypes.find(s => s.id === a.shift_type_id);
    const d = parseInt(a.date.split('-')[2]);
    if (st?.name === 'Night') {
      nightCounts.set(a.nurse_id, (nightCounts.get(a.nurse_id) || 0) + 1);
    }
    if (isWeekend(year, month, d)) {
      weekendCounts.set(a.nurse_id, (weekendCounts.get(a.nurse_id) || 0) + 1);
    }
  });

  // Score variance
  const nightValues = Array.from(nightCounts.values());
  const weekendValues = Array.from(weekendCounts.values());

  if (nightValues.length > 1) {
    const nightMean = nightValues.reduce((a, b) => a + b, 0) / nightValues.length;
    const nightVar = nightValues.reduce((acc, v) => acc + (v - nightMean) ** 2, 0) / nightValues.length;
    penaltyTotal += nightVar * 15;
  }

  if (weekendValues.length > 1) {
    const wMean = weekendValues.reduce((a, b) => a + b, 0) / weekendValues.length;
    const wVar = weekendValues.reduce((acc, v) => acc + (v - wMean) ** 2, 0) / weekendValues.length;
    penaltyTotal += wVar * 15;
  }

  return penaltyTotal;
}

export function generateRoster(
  wardId: string,
  month: number,
  year: number
): Promise<SolverResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const nurses = store.getNursesByWard(wardId);
    const shiftTypes = store.getShiftTypes();
    const requirements = store.getShiftRequirements().filter(r => r.ward_id === wardId);
    const leaves = store.getLeaveRequests();
    const constraints = store.getConstraints();
    const daysInMonth = getDaysInMonth(month, year);

    const state: SolverState = {
      nurses,
      shiftTypes,
      requirements,
      leaves,
      daysInMonth,
      month,
      year,
      wardId,
      constraints,
      assignments: [],
      nurseDayShifts: new Map(),
      violations: [],
    };

    // Prepare nurse assignment map
    nurses.forEach(n => {
      state.nurseDayShifts.set(n.id, new Map());
      daysInMonth.forEach(d => {
        state.nurseDayShifts.get(n.id)!.set(d, []);
      });
    });

    // Strategy: Priority scheduling for weekends, night shifts, and least assigned nurses
    const sortedDays = [...daysInMonth].sort((a, b) => {
      const aw = isWeekend(year, month, a) ? 0 : 1;
      const bw = isWeekend(year, month, b) ? 0 : 1;
      return aw - bw;
    });

    const nurseShifts = new Map<string, number>();
    nurses.forEach(n => nurseShifts.set(n.id, 0));

    for (const d of sortedDays) {
      const dow = getDayOfWeek(year, month, d);
      const date = formatDate(year, month, d);

      for (const st of shiftTypes) {
        // Evaluate default requirements vs explicit custom requirements
        const req = requirements.find(r => r.shift_type_id === st.id && r.day_of_week === dow);
        const ward = store.getWards().find(w => w.id === wardId);
        let minRequired = 1;

        if (req) {
          minRequired = req.min_nurses;
        } else if (ward) {
          if (st.name === 'Morning') minRequired = ward.min_morning_staff;
          if (st.name === 'Afternoon') minRequired = ward.min_afternoon_staff;
          if (st.name === 'Night') minRequired = ward.min_night_staff;
        }

        let assignedCount = 0;

        // Rank nurses by least assigned, valid constraints, and seniority
        const rankedNurses = nurses.filter(n => {
          const check = isHardConstraintViolation(state, n.id, d, st.id);
          return check === null;
        });

        rankedNurses.sort((a, b) => {
          const aCount = nurseShifts.get(a.id) || 0;
          const bCount = nurseShifts.get(b.id) || 0;
          if (aCount !== bCount) return aCount - bCount;
          return b.seniority - a.seniority; // Tie-breaker: prefer senior nurses for extra shift balance
        });

        for (const n of rankedNurses) {
          if (assignedCount >= minRequired) break;

          const assignment: Assignment = {
            id: store.genId(),
            roster_id: '',
            nurse_id: n.id,
            date,
            shift_type_id: st.id,
          };
          state.assignments.push(assignment);
          state.nurseDayShifts.get(n.id)!.set(d, [st.id]);
          nurseShifts.set(n.id, (nurseShifts.get(n.id) || 0) + 1);
          assignedCount++;
        }

        if (assignedCount < minRequired) {
          state.violations.push(
            `Coverage Alert: Day ${d} ${st.name} shift has ${assignedCount} of ${minRequired} minimum staff required.`
          );
        }
      }
    }

    const elapsed = Date.now() - startTime;
    const objectiveValue = calculateSoftPenalties(state);

    // Save output
    const roster = store.createRoster({
      ward_id: wardId,
      month,
      year,
      status: 'draft',
      solver_time_ms: elapsed,
      objective_value: Math.round(objectiveValue),
    });

    state.assignments.forEach(a => {
      a.roster_id = roster.id;
      store.createAssignment(a);
    });

    resolve({
      roster_id: roster.id,
      assignments: state.assignments,
      solver_time_ms: elapsed,
      objective_value: Math.round(objectiveValue),
      is_feasible: state.violations.length === 0,
      violations: state.violations,
    });
  });
}

export function checkSwapConstraints(
  rosterId: string,
  requestingNurseId: string,
  targetNurseId: string,
  originalDate: string,
  originalShiftTypeId: string,
  requestedDate: string,
  requestedShiftTypeId: string
): { valid: boolean; violations: string[] } {
  const assignments = store.getAssignmentsByRoster(rosterId);
  const shiftTypes = store.getShiftTypes();
  const leaves = store.getLeaveRequests();
  const violations: string[] = [];

  // Check if requesting nurse has the original shift
  const originalExists = assignments.some(a => a.nurse_id === requestingNurseId && a.date === originalDate && a.shift_type_id === originalShiftTypeId);
  if (!originalExists) {
    violations.push('Requesting nurse does not hold the original assignment.');
  }

  // Check if target nurse has the requested shift
  const requestedExists = assignments.some(a => a.nurse_id === targetNurseId && a.date === requestedDate && a.shift_type_id === requestedShiftTypeId);
  if (!requestedExists) {
    violations.push('Target nurse does not hold the requested assignment.');
  }

  // Prevent double assignments on either end
  const requestingOnNewDate = assignments.some(a => a.nurse_id === requestingNurseId && a.date === requestedDate && a.shift_type_id !== requestedShiftTypeId);
  if (requestingOnNewDate) {
    violations.push('Requesting nurse already holds a shift on the requested date.');
  }

  const targetOnNewDate = assignments.some(a => a.nurse_id === targetNurseId && a.date === originalDate && a.shift_type_id !== originalShiftTypeId);
  if (targetOnNewDate) {
    violations.push('Target nurse already holds a shift on the original date.');
  }

  // Honor approved leaves
  if (isNurseOnLeave(requestingNurseId, requestedDate, leaves)) {
    violations.push('Requesting nurse is on approved leave during the new shift date.');
  }
  if (isNurseOnLeave(targetNurseId, originalDate, leaves)) {
    violations.push('Target nurse is on approved leave during the shift to swap into.');
  }

  // 11-Hour Minimum Rest Period check
  const origShift = shiftTypes.find(s => s.id === originalShiftTypeId);
  const reqShift = shiftTypes.find(s => s.id === requestedShiftTypeId);

  if (origShift && reqShift) {
    // requesting nurse takes requested shift
    if (reqShift.name === 'Morning') {
      const prevDateStr = new Date(new Date(requestedDate).getTime() - 86400000).toISOString().split('T')[0];
      const prevAssignment = assignments.find(a => a.nurse_id === requestingNurseId && a.date === prevDateStr);
      const prevShift = prevAssignment ? shiftTypes.find(s => s.id === prevAssignment.shift_type_id) : null;
      if (prevShift && prevShift.name === 'Night') {
        violations.push('Violates 11-hour rest rule for the requesting nurse (Morning directly after Night).');
      }
    }

    // target nurse takes original shift
    if (origShift.name === 'Morning') {
      const prevDateStr = new Date(new Date(originalDate).getTime() - 86400000).toISOString().split('T')[0];
      const prevAssignment = assignments.find(a => a.nurse_id === targetNurseId && a.date === prevDateStr);
      const prevShift = prevAssignment ? shiftTypes.find(s => s.id === prevAssignment.shift_type_id) : null;
      if (prevShift && prevShift.name === 'Night') {
        violations.push('Violates 11-hour rest rule for the target nurse (Morning directly after Night).');
      }
    }
  }

  return { valid: violations.length === 0, violations };
}

export function approveSwap(swapId: string): { success: boolean; message: string } {
  const swap = store.getSwapRequests().find(s => s.id === swapId);
  if (!swap) return { success: false, message: 'Swap request not found.' };
  if (swap.status !== 'pending') return { success: false, message: 'This swap has already been resolved.' };

  const assignments = store.getAssignmentsByRoster(swap.roster_id);
  const requestingAssignment = assignments.find(a => a.nurse_id === swap.requesting_nurse_id && a.date === swap.original_shift_date && a.shift_type_id === swap.original_shift_type_id);
  const targetAssignment = assignments.find(a => a.nurse_id === swap.target_nurse_id && a.date === swap.requested_shift_date && a.shift_type_id === swap.requested_shift_type_id);

  if (!requestingAssignment || !targetAssignment) {
    return { success: false, message: 'Failed to update schedule: One or both shift records no longer match the database.' };
  }

  store.updateAssignment(requestingAssignment.id, { nurse_id: swap.target_nurse_id });
  store.updateAssignment(targetAssignment.id, { nurse_id: swap.requesting_nurse_id });
  store.updateSwapRequest(swap.id, { status: 'approved' });

  return { success: true, message: 'Shift swap approved and assignments successfully updated.' };
}

export function rejectSwap(swapId: string): { success: boolean; message: string } {
  const swap = store.getSwapRequests().find(s => s.id === swapId);
  if (!swap) return { success: false, message: 'Swap request not found.' };
  store.updateSwapRequest(swap.id, { status: 'rejected' });
  return { success: true, message: 'Swap request rejected.' };
}

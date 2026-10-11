import { StudentProfile, EligibilityCriteria, EligibilityResult } from '../types/placement';

export class EligibilityService {
  /**
   * Live evaluation of student against a drive's eligibility criteria.
   * Never cached — re-evaluated on every read.
   */
  public static evaluate(
    student: StudentProfile,
    criteria: EligibilityCriteria
  ): EligibilityResult {
    const reasons: string[] = [];

    if (!criteria || !student) {
      return { isEligible: true, reasons: [] };
    }

    // 1. CGPA evaluation (numerical comparison with precision tolerance)
    const stdCgpa = parseFloat(String(student.cgpa ?? 0));
    const minCgpa = parseFloat(String(criteria.minCgpa ?? 0));
    if (!isNaN(minCgpa) && minCgpa > 0 && stdCgpa < minCgpa - 0.001) {
      reasons.push(
        `CGPA ${stdCgpa.toFixed(2)} is below minimum requirement (${minCgpa.toFixed(2)})`
      );
    }

    // 2. Branch evaluation (case-insensitive, supports "ALL" or empty = all branches)
    const studentBranch = (student.branch || '').trim().toUpperCase();
    const allowedBranches: string[] = Array.isArray(criteria.allowedBranches)
      ? criteria.allowedBranches
      : typeof (criteria as any).allowedBranches === 'string'
      ? String((criteria as any).allowedBranches).split(',').map((b) => b.trim())
      : [];

    const isBranchAllowed =
      allowedBranches.length === 0 ||
      allowedBranches.some(
        (b) => b.trim().toUpperCase() === studentBranch || b.toUpperCase() === 'ALL'
      );
    if (!isBranchAllowed) {
      reasons.push(
        `Discipline '${student.branch}' is not in allowed branches (${allowedBranches.join(', ')})`
      );
    }

    // 3. Backlog limits
    const maxBacklogs = typeof criteria.maxBacklogs === 'number'
      ? criteria.maxBacklogs
      : parseInt(String(criteria.maxBacklogs ?? 0), 10);
    const stdBacklogs = typeof student.backlogs === 'number'
      ? student.backlogs
      : parseInt(String(student.backlogs ?? 0), 10);
    if (!isNaN(maxBacklogs) && stdBacklogs > maxBacklogs) {
      reasons.push(
        `Active backlogs (${stdBacklogs}) exceed maximum allowed (${maxBacklogs})`
      );
    }

    // 4. 10th percentage (only enforce if cutoff is set and student provided marks)
    const min10 = parseFloat(String(criteria.min10thPercentage ?? 0));
    const std10 = parseFloat(String(student.tenthPercentage ?? 0));
    if (min10 > 0 && std10 > 0 && std10 < min10 - 0.001) {
      reasons.push(
        `10th board marks (${std10}%) below minimum (${min10}%)`
      );
    }

    // 5. 12th percentage (only enforce if cutoff is set and student provided marks)
    const min12 = parseFloat(String(criteria.min12thPercentage ?? 0));
    const std12 = parseFloat(String(student.twelfthPercentage ?? 0));
    if (min12 > 0 && std12 > 0 && std12 < min12 - 0.001) {
      reasons.push(
        `12th board marks (${std12}%) below minimum (${min12}%)`
      );
    }

    // 6. Graduation Year (only enforce if both are positive integers)
    const critGradYear = parseInt(String(criteria.graduationYear ?? 0), 10);
    const stdGradYear = parseInt(String(student.graduationYear ?? 0), 10);
    if (critGradYear > 0 && stdGradYear > 0 && stdGradYear !== critGradYear) {
      reasons.push(
        `Graduation year ${stdGradYear} does not match target batch ${critGradYear}`
      );
    }

    return {
      isEligible: reasons.length === 0,
      reasons,
    };
  }
}

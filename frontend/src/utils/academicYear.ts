/**
 * Academic Year & Student Batch Calculation Utility
 *
 * Current Academic Placement Cycle: 2026-2027 (Session runs August 2026 to August 2027)
 * - Batch of 2027 (Graduating 2027): 4th Year (Final Year)
 * - Batch of 2028 (Graduating 2028): 3rd Year (Pre-Final Year)
 * - Batch of 2029 (Graduating 2029): 2nd Year
 * - Batch of 2030 (Graduating 2030): 1st Year
 * - Batch of 2026 (Graduating 2026): Graduated / Alumni
 */

export const ACADEMIC_YEAR_CYCLE = '2026-2027';

export interface BatchOption {
  value: number;
  title: string;
  desc: string;
  yearLabel: string;
}

export const TARGET_BATCH_OPTIONS: BatchOption[] = [
  { value: 2027, title: '2027 Batch', desc: '4th Year / Final', yearLabel: '4th Year' },
  { value: 2028, title: '2028 Batch', desc: '3rd Year / Pre-Final', yearLabel: '3rd Year' },
  { value: 2029, title: '2029 Batch', desc: '2nd Year', yearLabel: '2nd Year' },
  { value: 2030, title: '2030 Batch', desc: '1st Year', yearLabel: '1st Year' },
  { value: 2026, title: '2026 Batch', desc: 'Graduated / Alumni', yearLabel: 'Graduated' },
  { value: 0, title: 'All Years', desc: 'Open to All', yearLabel: 'All Years' },
];

export function getYearOfStudy(gradYear?: number | null): string {
  if (!gradYear || gradYear <= 0) return 'All Batches (Open to All)';
  const y = Number(gradYear);
  switch (y) {
    case 2027:
      return '4th Year (Final Year)';
    case 2028:
      return '3rd Year (Pre-Final)';
    case 2029:
      return '2nd Year';
    case 2030:
      return '1st Year';
    case 2026:
      return 'Graduated';
    default:
      if (y < 2026) return `${y} (Graduated)`;
      return `${y} Batch`;
  }
}

export function getShortYearOfStudy(gradYear?: number | null): string {
  if (!gradYear || gradYear <= 0) return 'All Years';
  const y = Number(gradYear);
  switch (y) {
    case 2027:
      return '4th Year';
    case 2028:
      return '3rd Year';
    case 2029:
      return '2nd Year';
    case 2030:
      return '1st Year';
    case 2026:
      return 'Graduated';
    default:
      return `${y}`;
  }
}

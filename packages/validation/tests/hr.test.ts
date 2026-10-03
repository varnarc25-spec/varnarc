import { describe, expect, it } from 'vitest';
import { createHrEmployeeSchema, createHrLeaveSchema, generateHrPayrollSchema } from '../src/hr';

describe('hr schemas', () => {
  it('accepts an employee with a blank email', () => {
    const parsed = createHrEmployeeSchema.parse({
      fullName: 'Asha Rao',
      email: '',
      jobTitle: 'Editor',
    });
    expect(parsed.status).toBe('ACTIVE');
    expect(parsed.email).toBe('');
  });

  it('rejects leave that ends before it starts', () => {
    const parsed = createHrLeaveSchema.safeParse({
      employeeId: '11111111-1111-4111-8111-111111111111',
      leaveType: 'SICK',
      startDate: '2026-10-10',
      endDate: '2026-10-01',
    });
    expect(parsed.success).toBe(false);
  });

  it('accepts a payroll month', () => {
    expect(generateHrPayrollSchema.parse({ period: '2026-10' }).period).toBe('2026-10');
    expect(generateHrPayrollSchema.safeParse({ period: '2026-13' }).success).toBe(false);
  });
});

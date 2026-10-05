import { describe, expect, it } from 'vitest';
import {
  STANDARD_HR_DEPARTMENTS,
  createHrEmployeeSchema,
  createHrLeaveSchema,
  emailHrPayslipSchema,
  generateHrPayrollSchema,
} from '../src/hr';

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

  it('keeps salary amounts entered on the employee form', () => {
    const parsed = createHrEmployeeSchema.parse({
      fullName: 'Asha Rao',
      jobTitle: 'Editor',
      basic: '45000',
      hra: '18000',
      specialAllowance: '',
      professionalTax: '200',
      providentFund: '1800',
    });
    expect(parsed.basic).toBe(45000);
    expect(parsed.hra).toBe(18000);
    expect(parsed.specialAllowance).toBe('');
    expect(parsed.professionalTax).toBe(200);
    expect(parsed.providentFund).toBe(1800);
  });

  it('accepts a hike percent on the employee form', () => {
    const parsed = createHrEmployeeSchema.parse({
      fullName: 'Asha Rao',
      jobTitle: 'Editor',
      basic: '45000',
      hikePercentage: '10',
      hikeEffectiveOn: '2026-04-01',
    });
    expect(parsed.hikePercentage).toBe(10);
    expect(parsed.hikeEffectiveOn).toBe('2026-04-01');
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

  it('lists standard departments once each', () => {
    const codes = STANDARD_HR_DEPARTMENTS.map((department) => department.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes).toContain('HR');
    expect(codes).toContain('FIN');
  });

  it('accepts a payroll month', () => {
    expect(generateHrPayrollSchema.parse({ period: '2026-10' }).period).toBe('2026-10');
    expect(generateHrPayrollSchema.safeParse({ period: '2026-13' }).success).toBe(false);
  });

  it('accepts a payslip PDF payload and rejects an empty one', () => {
    const pdf = 'data:application/pdf;base64,' + 'A'.repeat(40);
    expect(emailHrPayslipSchema.parse({ pdfBase64: pdf }).pdfBase64).toBe(pdf);
    expect(emailHrPayslipSchema.safeParse({ pdfBase64: 'short' }).success).toBe(false);
  });
});

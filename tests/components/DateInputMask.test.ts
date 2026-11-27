import {
  adjustDateInputValue,
  applyDateInputMask,
  buildDateInputMask,
  getMaskedCaret
} from '@nebular-react/core';

describe('date input mask', () => {
  it('builds masks from numeric formats', () => {
    expect(buildDateInputMask('DD/MM/YYYY')).toBe('99/99/9999');
    expect(buildDateInputMask('YYYY-MM-DD HH:mm:ss')).toBe('9999-99-99 99:99:99');
    expect(buildDateInputMask('HH:mm')).toBe('99:99');
    expect(buildDateInputMask('DD MMM YYYY')).toBeNull();
    expect(buildDateInputMask('')).toBeNull();
  });

  it('applies progressive masks', () => {
    expect(applyDateInputMask('15012024', 'DD/MM/YYYY')).toBe('15/01/2024');
    expect(applyDateInputMask('1501', 'DD/MM/YYYY')).toBe('15/01');
    expect(applyDateInputMask('15012024', 'DD MMM YYYY')).toBe('15012024');
  });

  it('computes caret positions after digits', () => {
    expect(getMaskedCaret('15/01/2024', 0)).toBe(0);
    expect(getMaskedCaret('15/01/2024', 2)).toBe(2);
    expect(getMaskedCaret('15/01/2024', 4)).toBe(5);
    expect(getMaskedCaret('15/01/2024', 99)).toBe(10);
  });

  it('increments and decrements the segment under the caret', () => {
    expect(adjustDateInputValue('15/01/2024', 'DD/MM/YYYY', 1, 1)).toEqual({
      value: '16/01/2024',
      caret: 2
    });
    expect(adjustDateInputValue('15/01/2024', 'DD/MM/YYYY', 4, 1)).toEqual({
      value: '15/02/2024',
      caret: 5
    });
    expect(adjustDateInputValue('15/01/2024', 'DD/MM/YYYY', 8, 1)).toEqual({
      value: '15/01/2025',
      caret: 10
    });
  });

  it('wraps values at segment boundaries', () => {
    expect(adjustDateInputValue('31/12/2024', 'DD/MM/YYYY', 0, 1)?.value).toBe('01/12/2024');
    expect(adjustDateInputValue('31/12/2024', 'DD/MM/YYYY', 3, 1)?.value).toBe('31/01/2024');
    expect(adjustDateInputValue('31/12/2024', 'DD/MM/YYYY', 3, -1)?.value).toBe('31/11/2024');
    expect(adjustDateInputValue('10:00', 'HH:mm', 0, -1)?.value).toBe('09:00');
    expect(adjustDateInputValue('10:00', 'HH:mm', 3, 1)?.value).toBe('10:01');
  });

  it('returns null for unsupported formats', () => {
    expect(adjustDateInputValue('15 Jan 2024', 'DD MMM YYYY', 1, 1)).toBeNull();
    expect(adjustDateInputValue('15/01/2024', undefined, 1, 1)).toBeNull();
  });
});

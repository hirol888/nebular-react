import { range, rangeFromTo } from './range';

describe('@nebular-react/hooks/utils/range', () => {
  it('should generate an array from first argument to bound', () => {
    const result = rangeFromTo(5, 8, (v: number) => ({ value: v, text: v - 5 }));

    expect(result).toEqual([
      { value: 5, text: 0 },
      { value: 6, text: 1 },
      { value: 7, text: 2 }
    ]);
  });

  it('should generate an array from 0 to bound', () => {
    const result = range(5, (v: number) => ({ value: v, text: v - 5 }));

    expect(result).toEqual([
      { value: 0, text: -5 },
      { value: 1, text: -4 },
      { value: 2, text: -3 },
      { value: 3, text: -2 },
      { value: 4, text: -1 }
    ]);
  });
});

import { batch } from './batch';

describe('@nebular-react/hooks/utils/batch', () => {
  it('should get batches of an array', () => {
    const array = Array<number>(1020).fill(0);

    const result = batch(array, 50);

    expect(result.length).toBe(21);
    expect(result[0].length).toBe(50);
    expect(result[result.length - 1].length).toBe(20);
  });

  it('should get 1 batch if batchSize is greater than number of items', () => {
    const array = Array<number>(100).fill(0);

    const result = batch(array, 200);

    expect(result.length).toBe(1);
    expect(result[0].length).toBe(100);
  });

  it('should get batches with undefined items if offset is greater than 0', () => {
    const array = Array<number>(1020).fill(0);

    const result = batch(array, 50, 888);

    expect(result.length).toBe(39);
    expect(result[0]).toBeUndefined();
    expect(result[16]).toBeUndefined();
    expect(result[17].length).toBe(12);
    expect(result[18].length).toBe(50);
    expect(result[result.length - 1].length).toBe(8);
  });
});

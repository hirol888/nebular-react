/**
 * returns array with numbers from first argument to bound.
 * */
export const rangeFromTo = <T>(from: number, to = 0, producer: (number: any) => T = (i) => i) => {
  const arr = [];

  for (let i = from; i < to; i++) {
    arr.push(producer(i));
  }

  return arr;
};

/**
 * returns array with numbers from zero to bound.
 * */
export const range = <T>(bound: number, producer: (number: any) => T = (i) => i) =>
  rangeFromTo(0, bound, producer);

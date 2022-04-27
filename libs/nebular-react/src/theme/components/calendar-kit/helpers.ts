/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

export const batch = <T>(target: T[], batchSize: number, offset = 0): T[][] => {
  return target.reduce((res: T[][], item, index) => {
    const chunkIndex = Math.floor((index + offset) / batchSize);
    if (!res[chunkIndex]) {
      res[chunkIndex] = [];
    }
    res[chunkIndex].push(item);
    return res;
  }, []);
};
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
export const range = <T>(bound: number, producer: (number: any) => T = (i) => i) => {
  return rangeFromTo(0, bound, producer);
};

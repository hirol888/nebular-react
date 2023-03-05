export const batch = <T>(target: T[], batchSize: number, offset = 0): T[][] =>
  target.reduce((res: T[][], item, index) => {
    const chunkIndex = Math.floor((index + offset) / batchSize);
    if (!res[chunkIndex]) {
      res[chunkIndex] = [];
    }
    res[chunkIndex].push(item);
    return res;
  }, []);

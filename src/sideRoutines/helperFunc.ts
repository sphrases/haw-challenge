/** Round to two decimals */
export const twoDecRound = (num: number) => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

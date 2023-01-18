/** Round to two decimals */
export const twoDecRound = (num: number) => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export const printScore = (score: number) => {
  // @ts-ignore
  document.getElementById("scoreSection").innerHTML = `score: ${score}`;
};

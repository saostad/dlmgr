/** convert byte to mega byte */
export const byteToMB = (input: number | string): number => {
  let number: number;
  if (typeof input === "number") {
    number = input;
  } else {
    number = parseInt(input);
  }
  const result = (number / 1024 / 1024).toFixed(2);

  return Number(result);
};

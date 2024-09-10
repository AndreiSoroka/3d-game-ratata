export function generateRandomId() {
  // const uuid = window?.crypto
  //   ?.randomUUID?.()
  //   .replace(/-/g, '')
  //   .replace(/^(.{12})./, '$10');
  // if (uuid) {
  //   return uuid;
  // }

  const randomNumber =
    window?.crypto?.getRandomValues?.(new Uint32Array(1))?.at(0) ||
    Math.random();

  const randomNumberHex = randomNumber.toString(36);
  const dateHex = Date.now().toString(36);

  return `${randomNumberHex}${dateHex}`;
}

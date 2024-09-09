export function generateRandomId() {
  const { randomUUID, getRandomValues } = window?.crypto || {};

  if (randomUUID) {
    return randomUUID();
  }

  const randomNumber =
    getRandomValues?.(new Uint32Array(1))?.at(0) || Math.random();

  const randomNumberHex = randomNumber.toString(36);
  const dateHex = Date.now().toString(36);

  return `${randomNumberHex}-${dateHex}`;
}

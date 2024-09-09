export async function encryptMessage(publicKey: CryptoKey, message: string) {
  const encodedMessage = new TextEncoder().encode(message);
  return await crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey,
    encodedMessage
  );
}

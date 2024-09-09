export async function decryptMessage(
  privateKey: CryptoKey,
  encryptedMessage: ArrayBuffer
) {
  const decryptedMessage = await crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
    },
    privateKey,
    encryptedMessage
  );
  return new TextDecoder().decode(decryptedMessage);
}

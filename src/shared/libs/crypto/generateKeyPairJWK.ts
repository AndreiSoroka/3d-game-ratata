export async function generateKeyPairJWK() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );
  const publicKeyJWK = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const privateKeyJWK = await crypto.subtle.exportKey(
    'jwk',
    keyPair.privateKey
  );

  return {
    publicKeyJWK,
    privateKeyJWK,
  };
}

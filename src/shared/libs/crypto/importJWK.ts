export async function importJWK(jwk: JsonWebKey, type: 'public' | 'private') {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    [type === 'public' ? 'encrypt' : 'decrypt']
  );
}

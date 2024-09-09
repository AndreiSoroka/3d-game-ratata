import pako from 'pako';

export function deflateArrayBufferToBase64(message: ArrayBuffer): string {
  const deflatedEncryptedMessage = pako.deflate(message);
  const deflatedEncryptedMessageString = String.fromCharCode(
    ...deflatedEncryptedMessage
  );

  return btoa(deflatedEncryptedMessageString);
}

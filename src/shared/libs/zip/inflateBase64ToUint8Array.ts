import pako from 'pako';

export function inflateBase64ToUint8Array(message: string): Uint8Array {
  const deflatedEncryptedMessageString = atob(message);
  const deflatedEncryptedMessage = new Uint8Array(
    deflatedEncryptedMessageString.split('').map((char) => char.charCodeAt(0))
  );
  return pako.inflate(deflatedEncryptedMessage);
}

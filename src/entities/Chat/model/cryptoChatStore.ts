import { defineStore } from 'pinia';
import { nextTick, ref } from 'vue';
import { encryptMessage } from '@/shared/libs/crypto/encryptMessage';
import { importJWK } from '@/shared/libs/crypto/importJWK';
import { deflateArrayBufferToBase64 } from '@/shared/libs/zip/deflateArrayBufferToBase64';
import { decryptMessage } from '@/shared/libs/crypto/decryptMessage';
import { inflateBase64ToUint8Array } from '@/shared/libs/zip/inflateBase64ToUint8Array';
import { generateKeyPairJWK } from '@/shared/libs/crypto/generateKeyPairJWK';

type Users = Record<string, CryptoKey>;

export const useCryptoChatStore = defineStore('cryptoChat', () => {
  const publicKey = ref<JsonWebKey | null>(null);
  let privateKey: CryptoKey | null = null;
  const users = ref<Users>({});

  const generateKeyPromise = generateKeyPairJWK();
  const isReadyPromise = generateKeyPromise.then(() => nextTick());

  generateKeyPromise.then(async (keyPair) => {
    publicKey.value = keyPair.publicKeyJWK;
    privateKey = await importJWK(keyPair.privateKeyJWK, 'private');
  });

  async function encryptAndZipMessageForPeers(message: string) {
    await generateKeyPromise;
    if (!publicKey.value) {
      throw new Error('Public key is not generated');
    }

    const messageForSend: Record<string, string> = {};

    await Promise.all(
      Object.entries(users.value).map(async ([user, publicKey]) => {
        const encryptedMessage = await encryptMessage(publicKey, message);
        messageForSend[user] = deflateArrayBufferToBase64(encryptedMessage);
      })
    );
    return messageForSend;
  }

  async function unzipAndDecryptMessageFromPeers(encryptedMessage: string) {
    await generateKeyPromise;
    if (!privateKey) {
      throw new Error('Private key is not generated');
    }

    const inflatedEncryptedMessage =
      inflateBase64ToUint8Array(encryptedMessage);
    return decryptMessage(privateKey, inflatedEncryptedMessage);
  }

  async function addUser(userId: string, publicKeyJWK: JsonWebKey) {
    users.value[userId] = await importJWK(publicKeyJWK, 'public');
  }

  function hasUser(userId: string) {
    return userId in users.value;
  }

  function removeUser(userId: string) {
    delete users.value[userId];
  }

  return {
    isReadyPromise,
    publicKey,
    encryptAndZipMessageForPeers,
    unzipAndDecryptMessageFromPeers,
    addUser,
    hasUser,
    removeUser,
  };
});

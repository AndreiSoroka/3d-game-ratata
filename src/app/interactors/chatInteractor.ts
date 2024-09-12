import {
  type ChatTransportPayload,
  ChatTransportPayloadSchema,
  useChatStore,
  useCryptoChatStore,
} from '@/entities/Chat';
import { usePeerStore } from '@/entities/PeerToPeer';
import { watch } from 'vue';
import * as v from 'valibot';

const chatStore = useChatStore();
const cryptoChatStore = useCryptoChatStore();
const peerStore = usePeerStore();

const userId = peerStore.id;

// send messages to peers
watch(
  () => [chatStore.countOfMessagesForSend, cryptoChatStore.publicKey],
  async ([count, publicKey]) => {
    if (!count || !publicKey) {
      return;
    }

    const rawMessages = [...chatStore.messagesForSend];
    chatStore.clearMessageForSend();

    const messages = await Promise.all(
      [...rawMessages].map(cryptoChatStore.encryptAndZipMessage)
    );

    for (const message of messages) {
      peerStore.sendToPeers({
        type: 'chatMessage',
        message: message,
      } satisfies ChatTransportPayload);
    }
    for (const message of rawMessages) {
      chatStore.addMessage(peerStore.id, message);
    }
  }
);

// handshake with new peers
peerStore.peers$.subscribe(async (peersSubject) => {
  switch (peersSubject.type) {
    case 'add': {
      await cryptoChatStore.isReadyPromise;
      await new Promise((resolve) => setTimeout(resolve, 1000)); // todo check why it is needed
      if (!cryptoChatStore.publicKey) {
        console.assert(false, 'Public key is not generated');
        // todo show error
        return;
      }
      peerStore.sendToPeers({
        type: 'chatHandshake',
        publicKey: cryptoChatStore.publicKey,
      } satisfies ChatTransportPayload);
      break;
    }
    case 'remove': {
      chatStore.addSystemMessageUserLeft(peersSubject.id);
      cryptoChatStore.removeUser(peersSubject.id);
    }
  }
});

// handle messages from peers
// receive messages from peers
peerStore.messages$.subscribe(async (messageSubject) => {
  if (!messageSubject.payload) {
    return;
  }
  const peerId = messageSubject.id;
  const payload = v.safeParse(
    ChatTransportPayloadSchema,
    messageSubject.payload
  );
  if (!payload.success) {
    return;
  }
  switch (payload.output.type) {
    case 'chatMessage': {
      if (!payload.output.message[userId]) {
        break;
      }
      const message = await cryptoChatStore.unzipAndDecryptMessage(
        payload.output.message[userId]
      );
      chatStore.addMessage(peerId, message);
      chatStore.clearOverflowMessages();
      break;
    }
    case 'chatHandshake': {
      await cryptoChatStore.addUser(peerId, payload.output.publicKey);
      chatStore.addSystemMessageUserJoined(peerId);
      break;
    }
  }
});

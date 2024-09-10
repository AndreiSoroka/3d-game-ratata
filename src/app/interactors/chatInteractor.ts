import { useChatStore, useCryptoChatStore } from '@/entities/Chat';
import { usePeerStore } from '@/entities/PeerToPeer';
import { watch } from 'vue';

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
      });
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      peerStore.sendToPeers({
        type: 'chatHandshake',
        publicKey: cryptoChatStore.publicKey,
      });
      break;
    }
    case 'remove': {
      cryptoChatStore.removeUser(peersSubject.id);
    }
  }
});

// handle messages from peers
// receive messages from peers
peerStore.messages$.subscribe(async (messageSubject) => {
  const { id, payload }: { id: string; payload: any } = messageSubject; // todo zod

  switch (payload.type) {
    case 'chatMessage': {
      if (!payload.message[userId]) {
        break;
      }
      const message = await cryptoChatStore.unzipAndDecryptMessage(
        payload.message[userId]
      );
      chatStore.addMessage(id, message);
      chatStore.clearOverflowMessages();
      break;
    }
    case 'chatHandshake': {
      await cryptoChatStore.addUser(id, payload.publicKey);
      break;
    }
  }
});

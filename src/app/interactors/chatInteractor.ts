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

    const messagesForPeers = await Promise.all(
      [...rawMessages].map(cryptoChatStore.encryptAndZipMessageForPeers)
    );

    for (const messageForPeer of messagesForPeers) {
      for (const [peerId, message] of Object.entries(messageForPeer)) {
        peerStore.sendToPeer(
          peerId,
          {
            type: 'chatMessage',
            message: { [peerId]: message },
          } satisfies ChatTransportPayload,
          true
        );
      }
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
      if (!cryptoChatStore.publicKey) {
        console.error('Public key is not generated');
        // todo show error
        return;
      }
      peerStore.sendToPeers(
        {
          type: 'chatHandshake',
          publicKey: cryptoChatStore.publicKey,
        } satisfies ChatTransportPayload,
        true
      );
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
  const peerId = messageSubject.fromPeerId;
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
      const message = await cryptoChatStore.unzipAndDecryptMessageFromPeers(
        payload.output.message[userId]
      );
      chatStore.addMessage(peerId, message);
      chatStore.clearOverflowMessages();
      break;
    }
    case 'chatHandshake': {
      if (cryptoChatStore.hasUser(peerId)) {
        break;
      }
      await cryptoChatStore.addUser(peerId, payload.output.publicKey);
      chatStore.addSystemMessageUserJoined(peerId);
      break;
    }
  }
});

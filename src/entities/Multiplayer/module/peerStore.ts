import { type DataConnection, Peer } from 'peerjs';
import { defineStore } from 'pinia';
import { computed, ref, toRaw } from 'vue';
import { Subject } from 'rxjs';

type PeerId = string;
type MessagePayload = unknown;

type MessageSubject = {
  id: PeerId;
  payload: MessagePayload;
};
type PeersSubject = {
  type: 'add' | 'remove';
  id: PeerId;
};

type Peers = Record<PeerId, { connection: DataConnection }>;

export const usePeerStore = defineStore('peer', () => {
  const id = `ratata-player-${
    window?.crypto?.randomUUID?.() ||
    (
      window?.crypto?.getRandomValues?.(new Uint32Array(1))?.at(0) ||
      Math.random()
    ).toString(36) + Date.now().toString(36)
  }`;
  const peer = new Peer(id);

  const peers$ = new Subject<PeersSubject>();
  const messages$ = new Subject<MessageSubject>();
  const multiplayerPeers = ref<Peers>({});
  const multiplayerPeersIds = computed(() => {
    return Object.keys(multiplayerPeers.value);
  });

  function addMultiplayerPeer(connection: DataConnection) {
    peers$.next({
      type: 'add',
      id: connection.peer,
    });
    multiplayerPeers.value[connection.peer] = {
      connection,
    };
  }

  function removeMultiplayerPeer(connection: DataConnection) {
    if (
      connection !== toRaw(multiplayerPeers.value[connection.peer].connection)
    ) {
      throw new Error('Connection mismatch');
    }
    peers$.next({
      type: 'remove',
      id: connection.peer,
    });
    connection.removeAllListeners();
    delete multiplayerPeers.value[connection.peer];
  }

  function sendToMultiplayer(data: MessagePayload) {
    Object.values(multiplayerPeers.value).forEach(({ connection }) => {
      connection.send(data);
    });
  }

  function handleMultiplayerData(
    connection: DataConnection,
    payload: MessagePayload
  ) {
    messages$.next({
      id: connection.peer,
      payload,
    });
  }

  function initDefaultMultiplayerEvents(connection: DataConnection) {
    connection.on('data', (data: MessagePayload) => {
      handleMultiplayerData(connection, data);
    });
    connection.on('iceStateChanged', (state) => {
      switch (state) {
        case 'connected':
          addMultiplayerPeer(connection);
          break;
        case 'closed':
        case 'disconnected':
        case 'failed':
          removeMultiplayerPeer(connection);
          break;
      }
    });
  }

  // if someone connects to us
  peer.on('connection', initDefaultMultiplayerEvents);

  // if we connect to someone
  function connectToPeer(id: string) {
    const connection = peer.connect(id);
    initDefaultMultiplayerEvents(connection);
  }

  return {
    connectToPeer,
    sendToMultiplayer,
    multiplayerPeersIds,
    multiplayerPeers,
    id,
    messages$,
    peers$,
  };
});

import { type DataConnection, Peer } from 'peerjs';
import { defineStore } from 'pinia';
import { computed, ref, toRaw } from 'vue';
import { Subject } from 'rxjs';
import { generateRandomId } from '@/shared/libs/crypto/generateRandomId';

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
  const id = `ratata-player-${generateRandomId()}`;
  const peer = new Peer(id);

  const peers$ = new Subject<PeersSubject>();
  const messages$ = new Subject<MessageSubject>();
  const peers = ref<Peers>({});
  const peersIds = computed(() => {
    return Object.keys(peers.value);
  });

  function addPeer(connection: DataConnection) {
    peers.value[connection.peer] = {
      connection,
    };
    peers$.next({
      type: 'add',
      id: connection.peer,
    });
  }

  function removePeer(connection: DataConnection) {
    if (connection !== toRaw(peers.value[connection.peer].connection)) {
      throw new Error('Connection mismatch');
    }
    peers$.next({
      type: 'remove',
      id: connection.peer,
    });
    connection.removeAllListeners();
    delete peers.value[connection.peer];
  }

  function sendToPeers(data: MessagePayload) {
    Object.values(peers.value).forEach(({ connection }) => {
      connection.send(data);
    });
  }

  function handleGetDataFromPeer(
    connection: DataConnection,
    payload: MessagePayload
  ) {
    messages$.next({
      id: connection.peer,
      payload,
    });
  }

  function subscribeToPeerConnection(connection: DataConnection) {
    connection.on('data', (data: MessagePayload) => {
      handleGetDataFromPeer(connection, data);
    });
    connection.on('iceStateChanged', (state) => {
      switch (state) {
        case 'connected':
          addPeer(connection);
          break;
        case 'closed':
        case 'disconnected':
        case 'failed':
          removePeer(connection);
          break;
      }
    });
  }

  // if someone connects to us
  peer.on('connection', subscribeToPeerConnection);

  // if we connect to someone
  function connectToPeer(id: string) {
    const connection = peer.connect(id);
    subscribeToPeerConnection(connection);
  }

  return {
    id,
    connectToPeer,
    sendToPeers,
    peersIds,
    peers,
    messages$,
    peers$,
  };
});

import { type DataConnection, Peer } from 'peerjs';
import { defineStore } from 'pinia';
import { computed, ref, toRaw } from 'vue';
import { Subject } from 'rxjs';
import { generateRandomId } from '@/shared/libs/crypto/generateRandomId';
import * as v from 'valibot';

type PeerId = string;
type RequestId = string;
type MessagePayload = unknown;

export const RequestSchema = v.object({
  id: v.nullable(v.string()),
  payload: v.unknown(),
});

type TRequest = v.InferOutput<typeof RequestSchema>;

type MessageSubject = {
  fromPeerId: PeerId;
  reqId: RequestId | null;
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

  function disconnectPeer(peerId: string) {
    const connection = peers.value[peerId].connection;
    connection.close();
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

  function sendToPeers(data: MessagePayload, isGuaranteed = false) {
    for (const peerId of peersIds.value) {
      sendToPeer(peerId, data, isGuaranteed);
    }
  }

  /**
   * Send data to peer
   */
  function sendToPeer(
    peerId: string,
    payload: MessagePayload,
    isGuaranteed = false
  ) {
    const { connection } = peers.value[peerId];
    if (!connection) {
      console.error(`Peer with id ${peerId} not found`);
      return;
    }
    const requestId = isGuaranteed ? generateRandomId() : null;
    connection.send({ id: requestId, payload } satisfies TRequest);
  }

  function handleGetDataFromPeer(
    connection: DataConnection,
    response: MessagePayload
  ) {
    const { output, success, issues } = v.safeParse(RequestSchema, response);
    if (!success) {
      console.error('Invalid payload', response, issues);
      return;
    }

    messages$.next({
      fromPeerId: connection.peer,
      reqId: output.id,
      payload: output.payload,
    });
  }

  function subscribeToPeerConnection(connection: DataConnection) {
    connection.on('data', (data: MessagePayload) => {
      handleGetDataFromPeer(connection, data);
    });
    connection.on('close', () => {
      removePeer(connection);
    });
    connection.on('iceStateChanged', (state) => {
      console.log('iceStateChanged', state);
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
    disconnectPeer,
    sendToPeers,
    sendToPeer,
    peersIds,
    messages$,
    peers$,
  };
});

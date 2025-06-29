import { type DataConnection, Peer } from 'peerjs';
import { defineStore } from 'pinia';
import { computed, ref, toRaw } from 'vue';
import { Subject } from 'rxjs';
import { generateRandomId } from '@/shared/libs/crypto/generateRandomId';
import * as v from 'valibot';
import { PromiseWrapper } from '@/shared/libs/promise/PromiseWrapper';
import { createPeerConfig } from '@/entities/PeerToPeer/services/createPeerConfig';

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

type Peers = Record<
  PeerId,
  {
    connection: DataConnection;
    channelGuaranteed: RTCDataChannel;
  }
>;

export const usePeerStore = defineStore('peer', () => {
  const id = `ratata-player-${generateRandomId()}`;

  const config = createPeerConfig();
  const peer = new Peer(id, {
    config,
  });

  const peers$ = new Subject<PeersSubject>();
  const messages$ = new Subject<MessageSubject>();
  const peers = ref<Peers>({});
  const peersIds = computed(() => {
    return Object.keys(peers.value);
  });

  function addPeer(
    connection: DataConnection,
    channelGuaranteed: RTCDataChannel
  ) {
    peers.value[connection.peer] = {
      connection,
      channelGuaranteed,
    };
    peers$.next({
      type: 'add',
      id: connection.peer,
    });
  }

  function disconnectPeer(peerId: string) {
    const peer = peers.value[peerId];
    if (!peer) {
      return;
    }
    const { connection } = peer;
    if (!connection) {
      return;
    }
    removePeer(connection);
  }

  function removePeer(connection: DataConnection) {
    if (toRaw(connection) !== toRaw(peers.value[connection.peer].connection)) {
      throw new Error('Connection mismatch');
    }
    const guaranteedChannel = peers.value[connection.peer].channelGuaranteed;
    peers$.next({
      type: 'remove',
      id: connection.peer,
    });
    guaranteedChannel.close();
    connection.removeAllListeners();
    connection.close();
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
    const peer = peers.value[peerId];
    if (!peer) {
      console.error(`Peer with id ${peerId} not found`);
      return;
    }
    const { connection, channelGuaranteed } = peer;
    if (!connection) {
      console.error(`Peer with id ${peerId} not found`);
      return;
    }

    // todo remove?
    const requestId = isGuaranteed ? generateRandomId() : null;

    if (isGuaranteed) {
      channelGuaranteed.send(JSON.stringify({ id: requestId, payload }));
    } else {
      connection.send({ id: requestId, payload } satisfies TRequest);
    }
  }

  function handleGetDataFromPeer(fromPeerId: string, response: MessagePayload) {
    const { output, success, issues } = v.safeParse(RequestSchema, response);
    if (!success) {
      console.error('Invalid payload', response, issues);
      return;
    }

    messages$.next({
      fromPeerId,
      reqId: output.id,
      payload: output.payload,
    });
  }

  function handlePeerConnection(connection: DataConnection) {
    const isReadyChannelGuaranteed = new PromiseWrapper();
    const isReadyChannelDefault = new PromiseWrapper();

    const channelGuaranteed = connection.peerConnection.createDataChannel(
      'guaranteed', // Уникальное имя канала
      {
        ordered: true,
        maxRetransmits: 5,
        negotiated: true, // important
        id: 7, // important
      }
    );

    // Receive message from "guaranteed"
    channelGuaranteed.onmessage = (event) => {
      try {
        handleGetDataFromPeer(connection.peer, JSON.parse(event.data));
      } catch (e) {
        // noop, because it is not a valid message from peer
      }
    };
    channelGuaranteed.onopen = () => {
      isReadyChannelGuaranteed.resolve();
    };

    isReadyChannelGuaranteed.then(() => {
      console.log('Channel is ready Guaranteed');
    });

    isReadyChannelDefault.then(() => {
      console.log('Channel is ready Default');
    });

    // Receive message from "default"
    connection.on('data', (data: MessagePayload) => {
      handleGetDataFromPeer(connection.peer, data);
    });

    // Other events
    connection.on('close', () => {
      removePeer(connection);
    });
    connection.on('iceStateChanged', (state) => {
      switch (state) {
        case 'connected':
          isReadyChannelDefault.resolve();
          break;
        case 'closed': // not working is some reason (but connection.on('close') works instead of)
        case 'disconnected':
        case 'failed':
          removePeer(connection);
          break;
      }
    });

    Promise.all([isReadyChannelGuaranteed, isReadyChannelDefault]).then(() => {
      addPeer(connection, channelGuaranteed);
    });
  }

  // if someone connects to us
  peer.on('connection', handlePeerConnection);

  // if we connect to someone
  function connectToPeer(id: string) {
    const connection = peer.connect(id, { label: 'default-channel' });
    handlePeerConnection(connection);
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

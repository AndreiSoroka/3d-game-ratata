import { type DataConnection, Peer } from 'peerjs';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { Subject } from 'rxjs';
import type { MultiPlayerActions } from '@/entities/Game/Game';

type MultiplayerDataPayload =
  | {
      type: 'PLAYER_POSITION';
      data: {
        x: number;
        y: number;
        z: number;
      };
    }
  | {
      type: 'WORLD_ACTION';
      data: MultiPlayerActions;
    };

export const usePeerStore = defineStore('counter', () => {
  const id = `ratata-player-${window?.crypto?.randomUUID?.() || Math.random()}`;
  const peer = new Peer(id);
  const multiplayerDataSubject = new Subject<{
    id: string;
    payload: MultiplayerDataPayload;
  }>();

  const multiplayerPeers = ref<
    Record<
      string,
      {
        connection: DataConnection;
        // todo some data
      }
    >
  >({});

  const multiplayerPeersIds = computed(() => {
    return Object.keys(multiplayerPeers.value);
  });

  function newMultiplayerPeer(connection: DataConnection) {
    multiplayerPeers.value[connection.peer] = {
      connection,
    };
  }

  function removeMultiplayerPeer(id: string) {
    multiplayerPeers.value[id].connection.removeAllListeners();
    delete multiplayerPeers.value[id];
  }

  function sendMultiplayerData(data: MultiplayerDataPayload) {
    Object.keys(multiplayerPeers.value).forEach((peerId) => {
      multiplayerPeers.value[peerId].connection.send(data);
    });
  }

  function handleMultiplayerData(
    connection: DataConnection,
    payload: MultiplayerDataPayload
  ) {
    multiplayerDataSubject.next({
      id: connection.peer,
      payload,
    });
  }

  function initDefaultMultiplayerEvents(connection: DataConnection) {
    connection.on('data', (data: unknown) => {
      handleMultiplayerData(connection, data as MultiplayerDataPayload); // todo add guard
    });
    connection.on('open', () => {
      newMultiplayerPeer(connection);
    });
    connection.on('close', () => {
      removeMultiplayerPeer(connection.peer);
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
    sendMultiplayerData,
    multiplayerPeersIds,
    multiplayerPeers,
    id,
    multiplayerDataSubject,
  };
});

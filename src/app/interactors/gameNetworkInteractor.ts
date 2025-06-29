import { usePeerStore } from '@/entities/PeerToPeer';
import type Game from '@/entities/Game/Game';
import {
  GameNetworkPayloadSchema,
  type GameNetworkPayload,
} from '@/entities/Game/schema';
import * as v from 'valibot';

export function initGameNetwork(game: Game) {
  const peerStore = usePeerStore();

  game.multiplayerSubject$.subscribe((data) => {
    peerStore.sendToPeers({
      type: 'WORLD_ACTION',
      data,
    } satisfies GameNetworkPayload);
  });

  game.playerPositionSubject$.subscribe((data) => {
    peerStore.sendToPeers({
      type: 'PLAYER_POSITION',
      data,
    } satisfies GameNetworkPayload);
  });

  peerStore.messages$.subscribe(({ fromPeerId, payload }) => {
    const parsed = v.safeParse(GameNetworkPayloadSchema, payload);
    if (!parsed.success) {
      return;
    }
    if (parsed.output.type === 'PLAYER_POSITION') {
      game.setMultiPlayerPosition(fromPeerId, parsed.output.data);
    }
    if (parsed.output.type === 'WORLD_ACTION') {
      game.callWordAction(parsed.output.data);
    }
  });
}

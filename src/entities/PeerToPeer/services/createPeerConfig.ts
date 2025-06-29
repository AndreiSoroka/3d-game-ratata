import { util } from 'peerjs';
import { getOnlineStun } from './getOnlineStun';
import { publicStuns } from './publicStuns';

export function createPeerConfig(): RTCConfiguration & { sdpSemantics?: string } {
  const config: RTCConfiguration & { sdpSemantics?: string } = {
    iceServers: [...publicStuns, ...util.defaultConfig.iceServers],
    sdpSemantics: util.defaultConfig.sdpSemantics,
  };

  getOnlineStun()
    .then((stunServers) => {
      config.iceServers!.unshift(...stunServers.slice(0, 3));
    })
    .catch((e) => {
      console.error('Failed to get online stun servers', e);
    });

  return config;
}

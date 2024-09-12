import { usePeerStore } from '@/entities/PeerToPeer';
import { useAvatarStore } from '@/entities/Avatar';

const peerStore = usePeerStore();
const avatarStore = useAvatarStore();

const userId = peerStore.id;

avatarStore.addAvatar(userId);

peerStore.peers$.subscribe(async (peersSubject) => {
  switch (peersSubject.type) {
    case 'add': {
      avatarStore.addAvatar(peersSubject.id);
      break;
    }
  }
});

import { createAvatar } from '@dicebear/core';
import { pixelArtNeutral } from '@dicebear/collection';

export function convertAvatarToBlob(avatar: ReturnType<typeof createAvatar>) {
  return new Blob([avatar.toString()], { type: 'image/svg+xml' });
}

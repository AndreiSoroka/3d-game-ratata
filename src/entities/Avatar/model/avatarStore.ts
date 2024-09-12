import { defineStore } from 'pinia';
import { ref } from 'vue';
import { createAvatarSvg } from '@/entities/Avatar/lib/createAvatarSvg';
import { convertAvatarToBlob } from '@/entities/Avatar/lib/convertAvatarToBlob';

export const useAvatarStore = defineStore('avatar', () => {
  const listOfAvatars = ref<Record<string, string>>({});

  function addAvatar(seed: string) {
    if (listOfAvatars.value[seed]) {
      return;
    }
    const avatar = createAvatarSvg(seed);
    const blob = convertAvatarToBlob(avatar);

    listOfAvatars.value[seed] = URL.createObjectURL(blob);
  }

  function removeAvatar(seed: string) {
    URL.revokeObjectURL(listOfAvatars.value[seed]);
    delete listOfAvatars.value[seed];
  }

  return {
    listOfAvatars,
    addAvatar,
    removeAvatar,
  };
});

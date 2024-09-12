<script setup lang="ts">
import { computed, ref } from 'vue';
import { createAvatarSvg } from '@/entities/Avatar/lib/createAvatarSvg';

const avatarSeed = ref('1');
const avatar = computed(() => createAvatarSvg(avatarSeed.value).toDataUri());
</script>

<template>
  <Story title="Avatar/AvatarGenerator" :layout="{ type: 'grid', width: 300 }">
    <Variant title="Default">
      <img :src="avatar" alt="" />
    </Variant>
    <template #controls>
      <HstText v-model="avatarSeed" title="Avatar seed" />
    </template>
  </Story>
</template>

<script lang="ts" setup>
import { usePeerStore } from '@/entities/Multiplayer/module/peerStore';

const store = usePeerStore();
</script>

<template>
  <div v-if="store.multiplayerPeersIds.length === 0">No connected peers</div>
  <div v-else>
    <h3>List of connected peers:</h3>
    <ul>
      <li v-for="peerId in store.multiplayerPeersIds" :key="peerId">
        {{ peerId }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { usePeerStore } from '@/entities/PeerToPeer/module/peerStore';
import { useAvatarStore } from '@/entities/Avatar';

// todo decompose to features and entities
const avatarStore = useAvatarStore();
const peerStore = usePeerStore();
</script>

<template>
  <div v-if="peerStore.peersIds.length === 0">No connected peers</div>
  <div v-else>
    <h3>List of connected peers:</h3>

    <el-descriptions v-for="peerId in peerStore.peersIds" :key="peerId">
      <el-descriptions-item>
        <el-avatar
          shape="square"
          :src="avatarStore.listOfAvatars[peerId]"
          size="default" />
      </el-descriptions-item>
      <el-descriptions-item>
        <el-text>{{ peerId }}</el-text>
      </el-descriptions-item>
      <el-descriptions-item>
        <el-button link size="small" @click="peerStore.disconnectPeer(peerId)">
          Disconnect
        </el-button>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

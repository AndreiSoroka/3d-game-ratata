<script setup lang="ts">
import { ElCard, ElDivider, ElInput } from 'element-plus';
import { usePeerStore } from '@/stores/peer';
import { ref } from 'vue';

const store = usePeerStore();
const friendId = ref('');

function connectToPeer() {
  store.connectToPeer(friendId.value);
}
</script>

<template>
  <el-card class="box-card" style="max-width: 400px; margin: 0 auto">
    <div>If you want to play with your friends, send them your ID</div>
    <div>Your ID: {{ store.id }}</div>
    <el-divider />
    <div>Enter your friend's ID</div>
    <el-input v-model="friendId" placeholder="Friend's ID" />
    <el-button type="primary" @click="connectToPeer"> Connect </el-button>

    <div>
      list of connected peers:
      <ul>
        <li v-for="peerId in store.multiplayerPeersIds" :key="peerId">
          {{ peerId }}
        </li>
      </ul>
    </div>
  </el-card>
</template>

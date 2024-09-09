<script setup lang="ts">
import { ElInput } from 'element-plus';
import { usePeerStore } from '@/entities/PeerToPeer/module/peerStore';
import { ref } from 'vue';

const store = usePeerStore();
const friendId = ref('');

function connectToPeer() {
  store.connectToPeer(friendId.value);
}
</script>

<template>
  <div>Enter your friend's Room ID</div>
  <el-input
    v-model="friendId"
    placeholder="Friend's ID"
    clearable
    @keydown.stop>
    <template #append>
      <el-button type="primary" @click="connectToPeer"> Connect</el-button>
    </template>
  </el-input>
</template>

<style scoped lang="scss"></style>

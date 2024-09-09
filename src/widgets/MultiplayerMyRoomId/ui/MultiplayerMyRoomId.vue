<script lang="ts" setup>
// todo entity
import { usePeerStore } from '@/entities/Multiplayer/module/peerStore';
import { ElMessage } from 'element-plus';

const store = usePeerStore();

function handleCopy() {
  navigator.clipboard.writeText(store.id);
  ElMessage('Room ID copied');
}
</script>

<template>
  <div>
    <div>
      Your Room ID:
      <el-input @keydown.stop v-model="store.id" :readonly="true">
        <template #append>
          <el-button type="primary" @click="handleCopy"> Copy</el-button>
        </template>
      </el-input>
    </div>
  </div>
</template>

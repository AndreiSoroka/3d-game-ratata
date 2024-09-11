<script lang="ts" setup>
import { ElButton, ElInput } from 'element-plus';
import { ref } from 'vue';

const message = ref('');
const emit = defineEmits<{
  sendMessage: [message: string];
}>();

function sendMessage() {
  if (!message.value) {
    return;
  }
  emit('sendMessage', message.value);
  clearMessage();
}

function clearMessage() {
  message.value = '';
}
</script>

<template>
  <el-input
    v-model="message"
    clearable
    placeholder="Type your message here"
    @keyup.enter="sendMessage"
    @keydown.esc="clearMessage"
    maxlength="140"
    @keydown.stop>
    <template #append>
      <el-button type="primary" @click="sendMessage"> Send</el-button>
    </template>
  </el-input>
</template>

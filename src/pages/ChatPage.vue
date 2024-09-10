<script setup lang="ts">
// draft code
import { ElButton, ElInput } from 'element-plus';
import { ref, watch } from 'vue';
import { useChatStore } from '@/entities/Chat';
import { usePeerStore } from '@/entities/PeerToPeer';

const message = ref('');
const chatRef = ref<HTMLDivElement | null>(null);
const { id } = usePeerStore();

const chatStore = useChatStore();

function sendMessage() {
  chatStore.sendMessage(message.value);
  message.value = '';
}

watch(chatStore.messages, () => {
  if (chatRef.value === null) return;
  chatRef.value.scrollTop = chatRef.value.scrollHeight;
});

const count = ref(0);
const load = () => {
  count.value += 2;
};
</script>

<template>
  <div v-infinite-scroll="load" class="chat" ref="chatRef">
    <div
      v-for="message in chatStore.messages"
      :key="`${message.timestamp}-${message.user}-${message.content.length}`">
      <strong> {{ message.user === id ? 'Me' : 'Somebody' }}: </strong>
      {{ message.content }}
    </div>
  </div>
  <el-input
    v-model="message"
    placeholder="Type your message here"
    @keyup.enter="sendMessage"
    @keydown.stop>
    <template #append>
      <el-button
        type="primary"
        icon="el-icon-chat-dot-round"
        @click="sendMessage">
        Send
      </el-button>
    </template>
  </el-input>
</template>

<style scoped lang="scss">
.chat {
  height: 300px;
  overflow-y: auto;
}
</style>

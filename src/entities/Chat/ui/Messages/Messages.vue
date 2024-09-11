<script lang="ts" setup>
import Message from './Message.vue';

const { messages } = defineProps<{
  userId: string;
  messages: {
    id: string;
    timestamp: number;
    user: string;
    content: string;
  }[];
}>();
</script>

<template>
  <div class="chat" ref="chatRef">
    <Message
      v-for="message in messages"
      :key="message.id"
      :is-user-message="message.user === userId"
      :content="message.content" />
  </div>
</template>

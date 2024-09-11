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
  <Message
    v-for="message in messages"
    :avatar="`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${message.user}`"
    :key="message.id"
    :is-user-message="message.user === userId"
    :content="message.content" />
</template>

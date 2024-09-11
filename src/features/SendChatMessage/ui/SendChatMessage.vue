<script lang="ts" setup>
import { SendMessageForm, useChatStore } from '@/entities/Chat';

const chatStore = useChatStore();

function sendMessage(message: string) {
  chatStore.sendMessage(message);
}
</script>

<template>
  <SendMessageForm @sendMessage="sendMessage" />
</template>

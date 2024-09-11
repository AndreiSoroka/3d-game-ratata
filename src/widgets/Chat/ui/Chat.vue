<script setup lang="ts">
import { nextTick, useTemplateRef, watch } from 'vue';
import { ChatWrapper, useChatStore } from '@/entities/Chat';
import { usePeerStore } from '@/entities/PeerToPeer';
import { SendChatMessage } from '@/features/SendChatMessage';
import Messages from '@/entities/Chat/ui/Messages/Messages.vue';

const chatWrapperRef =
  useTemplateRef<InstanceType<typeof ChatWrapper>>('chatWrapper');

const { id } = usePeerStore();

const chatStore = useChatStore();

watch(chatStore.messages, () => {
  nextTick(() => {
    chatWrapperRef.value?.scrollToBottom();
  });
});
</script>

<template>
  <ChatWrapper ref="chatWrapper">
    <template #messages>
      <Messages :messages="chatStore.messages" :user-id="id" />
    </template>
    <template #actions>
      <SendChatMessage />
    </template>
  </ChatWrapper>
</template>

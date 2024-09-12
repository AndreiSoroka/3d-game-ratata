<script setup lang="ts">
import { nextTick, useTemplateRef, watch } from 'vue';
import { ChatWrapper, ChatMessage, useChatStore } from '@/entities/Chat';
import { usePeerStore } from '@/entities/PeerToPeer';
import { SendChatMessage } from '@/features/SendChatMessage';
import { useAvatarStore } from '@/entities/Avatar';

const chatWrapperRef =
  useTemplateRef<InstanceType<typeof ChatWrapper>>('chatWrapper');

const { id } = usePeerStore();

const chatStore = useChatStore();

watch(chatStore.messages, () => {
  nextTick(() => {
    chatWrapperRef.value?.scrollToBottom();
  });
});

const avatarStore = useAvatarStore();
</script>

<template>
  <ChatWrapper ref="chatWrapper">
    <template #messages>
      <ChatMessage
        v-for="message in chatStore.messages"
        :key="message.id"
        :user-id="message.userId"
        :type="message.type"
        :avatar="avatarStore.listOfAvatars?.[message.userId]"
        :is-user-message="message.userId === id"
        :content="message.content" />
    </template>
    <template #actions>
      <SendChatMessage />
    </template>
  </ChatWrapper>
</template>

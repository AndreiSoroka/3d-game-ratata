<script setup lang="ts">
import ChatMessage from './ChatMessage.vue';
import { ref } from 'vue';

const type = ref<'user' | 'userJoined' | 'userLeft'>('user');
const avatar = ref('https://api.dicebear.com/9.x/pixel-art/svg?seed=5');
const userId = ref('ratata-game-11111111');
const content = ref('My message');
const isUserMessage = ref(true);
</script>

<template>
  <Story title="Chat/Message" :layout="{ type: 'grid', width: 300 }">
    <Variant title="Default">
      <ChatMessage
        :userId="userId"
        :type="type"
        :content="content"
        :is-user-message="isUserMessage"
        :avatar="avatar" />
      <template #controls>
        <HstSelect
          v-model="type"
          :title="'Message Type'"
          :options="['user', 'userJoined', 'userLeft']" />
        <HstText v-model="avatar" title="Avatar url" />
        <HstText v-model="userId" title="User Id" />
        <HstText v-model="content" title="Content" />
        <HstCheckbox v-model="isUserMessage" title="Is User Message" />
      </template>
    </Variant>
  </Story>
</template>

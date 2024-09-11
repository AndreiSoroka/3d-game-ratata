<script setup lang="ts">
import Messages from './Messages.vue';
import { ref } from 'vue';

const userId = ref('user1');
const messages = [
  { id: '1', timestamp: Date.now(), user: 'user1', content: 'Hello!' },
  { id: '2', timestamp: Date.now(), user: 'user2', content: 'Hi there!' },
  { id: '3', timestamp: Date.now(), user: 'user2', content: 'Hi there!' },
  { id: '4', timestamp: Date.now(), user: 'user2', content: 'Hi there!' },
  { id: '5', timestamp: Date.now(), user: 'user2', content: 'Hi there!' },
  { id: '6', timestamp: Date.now(), user: 'user1', content: 'Hello!' },
];
</script>

<template>
  <Story title="Chat/Messages" :layout="{ type: 'grid', width: 300 }">
    <Variant title="Default">
      <Messages :user-id="userId" :messages="messages" />
      <template #controls>
        <HstSelect
          v-model="userId"
          title="User ID"
          :options="[
            { value: 'user1', label: 'User 1' },
            { value: 'user2', label: 'User 2' },
            { value: 'user3', label: 'User 3' },
          ]" />
      </template>
    </Variant>
  </Story>
</template>

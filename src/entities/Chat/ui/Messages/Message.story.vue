<script setup lang="ts">
import Message from './Message.vue';
import { ref } from 'vue';

const content = ref('My message');
const isUserMessage = ref(true);
</script>

<template>
  <Story title="Chat/Message" :layout="{ type: 'grid', width: 300 }">
    <Variant title="Default">
      <Message :content="content" :is-user-message="isUserMessage" />
      <template #controls>
        <HstText v-model="content" title="Content" />
        <HstCheckbox v-model="isUserMessage" title="Is User Message" />
      </template>
    </Variant>
  </Story>
</template>

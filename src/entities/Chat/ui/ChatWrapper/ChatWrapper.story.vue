<script setup lang="ts">
import ChatWrapper from './ChatWrapper.vue';
import { computed, ref } from 'vue';

const countOfMessages = ref(3);

const messages = computed(() => {
  return new Array(countOfMessages.value).fill(null).map((_, index) => ({
    id: (index + 1).toString(),
    userId: `user${index + 1}`,
    content: `Hello! ${index + 1}`,
  }));
});
</script>

<template>
  <Story
    title="Chat/ChatWrapper Interactive"
    :layout="{ type: 'grid', width: 300 }">
    <Variant title="Default">
      <ChatWrapper>
        <template #messages>
          <div style="background: #56b8960f">
            <div v-for="message in messages" :key="message.id">
              <strong>{{ message.userId }}:</strong> {{ message.content }}
            </div>
          </div>
        </template>
        <template #actions>
          <div style="background: #000ff00f">actions</div>
        </template>
      </ChatWrapper>
      <template #controls>
        <HstNumber v-model="countOfMessages" title="Count of messages" />
      </template>
    </Variant>
  </Story>
</template>

<script setup lang="ts">
import SendMessageForm from './SendMessageForm.vue';
import { logEvent } from 'histoire/client';
</script>

<template>
  <Story
    title="Chat/SendMessageForm Interactive"
    :layout="{ type: 'grid', width: 300 }">
    <Variant title="Default">
      <SendMessageForm @sendMessage="logEvent('sendMessage', { e: $event })" />
    </Variant>
  </Story>
</template>

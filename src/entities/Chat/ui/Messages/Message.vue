<script lang="ts" setup>
const { isUserMessage, content } = defineProps<{
  isUserMessage: boolean;
  content: string;
}>();
</script>

<template>
  <div>
    <strong> {{ isUserMessage ? 'Me' : 'Somebody' }}: </strong>
    {{ content }}
  </div>
</template>

<script lang="ts" setup>
import { ElAvatar } from 'element-plus';

const { isUserMessage, content } = defineProps<{
  avatar: string;
  isUserMessage: boolean;
  content: string;
}>();
</script>

<template>
  <div class="message">
    <el-avatar
      :src="avatar"
      size="small"
      shape="circle"
      class="message__avatar" />
    <strong> {{ isUserMessage ? 'Me' : 'Somebody' }}: </strong>
    {{ content }}
  </div>
</template>

<style scoped lang="scss">
.message {
  margin-bottom: 6px;
}

.message__avatar {
  vertical-align: text-bottom;
  margin-right: 0.5rem;
}
</style>

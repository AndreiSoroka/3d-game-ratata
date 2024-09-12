<script lang="ts" setup>
import { ElText } from 'element-plus';
import { ref } from 'vue';

const messagesContainerRef = ref<HTMLElement | null>(null);

function scrollToBottom() {
  if (messagesContainerRef.value === null) return;

  messagesContainerRef.value.scrollTop =
    messagesContainerRef.value.scrollHeight;
}

defineExpose({ scrollToBottom });
</script>
<template>
  <div class="chat-wrapper">
    <div
      class="chat-wrapper__item chat-wrapper__item-messages"
      ref="messagesContainerRef">
      <div class="chat-wrapper__fading chat-wrapper__fading-top" />
      <div class="chat-wrapper__fading chat-wrapper__fading-bottom" />
      <div class="chat-wrapper__messages-list">
        <div class="chat-wrapper__info">
          <el-text type="info" tag="i">
            Asymmetric encryption and peer-to-peer connection are used.
            <br />
            Chat with your multiplayer players.
          </el-text>
        </div>
        <slot name="messages" />
      </div>
    </div>
    <div class="chat-wrapper__item chat-wrapper__item-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-wrapper {
  display: flex;
  flex-direction: column;
  max-height: 45vh;
  gap: 1rem;
  background: var(--el-card-bg-color, #fff);
}

.chat-wrapper__item {
  &-messages {
    position: relative;
    flex: 1;
    overflow-y: auto;
  }

  &-actions {
    height: fit-content;
  }
}

.chat-wrapper__messages-list {
  padding: 0 0 30px 0;
}

// todo change to kind of message container
.chat-wrapper__info {
  text-align: center;
  padding: 0 0 1rem;
}

.chat-wrapper__fading {
  --chat-fading-height: 35px;

  position: sticky;
  left: 0;
  right: 0;
  height: var(--chat-fading-height);
  background: var(--el-card-bg-color, #fff);
  backdrop-filter: blur(1px);

  &-top {
    top: 0;
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
  }

  &-bottom {
    top: calc(100% - var(--chat-fading-height, #fff));
    mask-image: linear-gradient(to top, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
  }
}
</style>

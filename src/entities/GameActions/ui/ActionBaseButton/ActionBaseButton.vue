<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  keyboardTip: string;
  progress?: number;
  progressEnd?: number;
  image?: string;
  isDisabled?: boolean;
}>();

const percentage = computed(() => {
  if (!props.progress || !props.progressEnd || props.progressEnd < 0) {
    return 0;
  }
  const percent = (props.progress / props.progressEnd) * 100;
  return Math.min(100, Math.max(0, percent));
});
</script>

<template>
  <div
    class="action-button"
    :class="{
      '--disabled': isDisabled,
    }">
    <img v-if="image" :src="image" class="action-button__image" />
    <div v-if="isDisabled" class="action-button__disable-block" />
    <div class="action-button__keyboard-tip">
      {{ keyboardTip }}
    </div>
    <div class="action-button__progress" v-if="percentage > 0">
      <div class="action-button__progress-background" />
      <div
        class="action-button__progress-bar"
        :style="{
          width: `${percentage}%`,
        }" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.action-button {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 5px;
  background: var(--el-color-info);
  overflow: hidden;
  transform: perspective(450px) rotateY(40deg) rotateX(20deg);
  box-shadow: 0 70px 40px -20px rgba(0, 0, 0, 0.2);
  transition:
    300ms ease-in-out transform,
    300ms ease-in-out opacity;
  opacity: 0.4;

  &:hover {
    transform: perspective(450px) rotateY(43deg) rotateX(23deg);
  }

  &.--disabled {
    opacity: 1;
    transform: perspective(3000px) rotateY(5deg);
  }
}

.action-button__keyboard-tip {
  position: absolute;
  color: var(--el-border-color-lighter);
  background: var(--el-color-primary);
  padding: 1px 4px 2px 1px;
  font-size: 0.6rem;
  z-index: 10;
  border-radius: 0 0 100px 0;
}

.action-button__progress {
  position: absolute;
  z-index: 1;
  bottom: 3px;
  left: 5px;
  right: 5px;
  height: 5px;
  border-radius: 5px;
  overflow: hidden;
}

.action-button__progress-background {
  position: absolute;
  top: 2px;
  bottom: 2px;
  width: 100%;
  background: var(--el-color-primary);
  border-radius: 5px;
}

.action-button__progress-bar {
  position: absolute;
  height: 100%;
  background: var(--el-color-primary);
  border-radius: 5px;
}

.action-button__image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.action-button__disable-block {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
}
</style>

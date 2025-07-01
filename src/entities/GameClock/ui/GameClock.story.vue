<script setup lang="ts">
import { ElSlider } from 'element-plus';
import { computed, ref } from 'vue';
import GameClock from './GameClock.vue';

const dayDuration = 300000;
const progress = ref(0.5);
const timeString = computed(() => {
  const milliseconds = progress.value * dayDuration;
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});
</script>

<template>
  <Story title="GameClock/GameClock">
    <Variant title="Default">
      <GameClock :progress="progress" :time-string="timeString" />
      <ElSlider
        v-model="progress"
        :min="0"
        :max="1"
        :step="0.01"
        style="margin-top: 16px" />
    </Variant>
  </Story>
</template>

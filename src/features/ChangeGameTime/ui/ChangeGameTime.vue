<script setup lang="ts">
import { ElSlider } from 'element-plus';
import { computed } from 'vue';
import { useDayNightStore } from '@/entities/Game/model/dayNightStore';
const dayNightStore = useDayNightStore();

const sliderValue = computed({
  get: () =>
    dayNightStore.manualTimeMilliseconds ?? dayNightStore.timeMilliseconds,
  set: (value: number) => dayNightStore.setTime(value),
});
</script>

<template>
  <ElSlider
    v-model="sliderValue"
    :min="0"
    :max="dayNightStore.dayDuration"
    :step="1000" />
</template>

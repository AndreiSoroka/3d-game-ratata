<script setup lang="ts">
import { ElSlider } from 'element-plus';
import { computed } from 'vue';
import { useDayNightStore } from '@/entities/Game/model/dayNightStore';

const IS_DEBUGING = document.location.hash.includes('debug');
const dayNightStore = useDayNightStore();

const sliderValue = computed({
  get: () =>
    dayNightStore.manualTimeMilliseconds ?? dayNightStore.timeMilliseconds,
  set: (value: number) => dayNightStore.setTime(value),
});
</script>

<template>
  <ElSlider
    v-if="IS_DEBUGING"
    v-model="sliderValue"
    :min="0"
    :max="dayNightStore.dayDuration"
    :step="1000"
    style="margin-top: 12px; width: 240px" />
</template>

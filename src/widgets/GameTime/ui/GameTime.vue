<script setup lang="ts">
import { computed } from 'vue';
import { GameClock } from '@/entities/GameClock';
import { ChangeGameTime } from '@/features/ChangeGameTime';
import { useDayNightStore } from '@/entities/Game/model/dayNightStore';

const dayNightStore = useDayNightStore();

const progress = computed(
  () => dayNightStore.timeMilliseconds / dayNightStore.dayDuration
);
const timeString = computed(() => dayNightStore.timeString);
</script>

<template>
  <div>
    <GameClock :progress="progress" :time-string="timeString" />
    <ChangeGameTime />
  </div>
</template>

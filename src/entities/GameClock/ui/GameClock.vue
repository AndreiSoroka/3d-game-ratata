<script setup lang="ts">
const props = defineProps<{
  /**
   * Percentage of the current day cycle.
   * 0 - start of the day, 0.5 - start of the night, 1 - next day begins.
   */
  progress: number;
  /** Formatted time to display next to the slider. */
  timeString: string;
}>();
</script>

<template>
  <div class="clock">
    <span class="icon">☀️</span>
    <div class="track">
      <div class="thumb" :style="{ left: `${props.progress * 100}%` }" />
    </div>
    <span class="icon">🌙</span>
    <span class="time">{{ props.timeString }}</span>
  </div>
</template>

<style scoped lang="scss">
.clock {
  margin-top: 4px;
  font-family: monospace;
  display: flex;
  align-items: center;
  gap: 4px;
}
.track {
  position: relative;
  flex-grow: 1;
  height: 4px;
  /* Smooth transition from dawn to day, through night and back to dawn */
  background: linear-gradient(
    to right,
    #8d7d5f 0%,
    #ffd740 20%,
    #ffd740 30%,
    #1a237e 70%,
    #1a237e 80%,
    #8d7d5f 100%
  );
  border-radius: 2px;
}
.thumb {
  position: absolute;
  top: -3px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
  border: 1px solid #555;
  transform: translateX(-50%);
}
.time {
  margin-left: 4px;
}
</style>

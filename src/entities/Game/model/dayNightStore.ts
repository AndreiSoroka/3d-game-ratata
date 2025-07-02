import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const DAY_DURATION = 5 * 60 * 1000;
const DAY_CYCLE_START = Math.floor(Date.now() / DAY_DURATION) * DAY_DURATION;

export const useDayNightStore = defineStore('dayNight', () => {
  const manualTimeMilliseconds = ref<number | null>(null);
  const timeMilliseconds = ref((Date.now() - DAY_CYCLE_START) % DAY_DURATION);

  function _updateTime() {
    if (manualTimeMilliseconds.value === null) {
      timeMilliseconds.value = (Date.now() - DAY_CYCLE_START) % DAY_DURATION;
    } else {
      timeMilliseconds.value = manualTimeMilliseconds.value;
    }
  }

  setInterval(_updateTime, 1000 / 30);

  const timeString = computed(() => {
    const totalSeconds = Math.floor(timeMilliseconds.value / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  });

  function setTime(milliseconds: number) {
    manualTimeMilliseconds.value = milliseconds;
    timeMilliseconds.value = milliseconds;
  }

  return {
    dayDuration: DAY_DURATION,
    timeMilliseconds,
    timeString,
    manualTimeMilliseconds,
    setTime,
  };
});

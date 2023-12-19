import { computed, onUnmounted, readonly, ref, watch } from 'vue';

export default function useActionTimestamp(nextCooldown: number = 100) {
  const timestamp = ref(0);
  const cooldown = ref(nextCooldown);
  const now = ref(Date.now());
  let intervalId: number;

  watch(timestamp, (value) => {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      now.value = Date.now();
      if (timestamp.value + cooldown.value < now.value) {
        clearInterval(intervalId);
        timestamp.value = 0;
      }
    }, 30);
  });

  onUnmounted(() => {
    clearInterval(intervalId);
  });

  function setTimestamp(nextTimestamp = Date.now()) {
    timestamp.value = nextTimestamp;
    now.value = Date.now();
  }

  function setCooldown(nextCooldown = 100) {
    if (isNaN(nextCooldown)) {
      return;
    }
    cooldown.value = nextCooldown;
  }

  const progress = computed(() => {
    if (timestamp.value === 0) {
      return 0;
    }
    return Math.max(0, Math.min(cooldown.value, now.value - timestamp.value));
  });

  return {
    setTimestamp,
    setCooldown,
    progress: readonly(progress),
    progressEnd: readonly(cooldown),
  };
}

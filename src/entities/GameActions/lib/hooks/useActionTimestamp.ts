import { computed, onUnmounted, readonly, ref, watch } from 'vue';

export default function useActionTimestamp(cooldown: number = 100) {
  const actionStartTimestamp = ref(0); // 0 - action is not started
  const actionCooldown = ref(cooldown);
  const now = ref(Date.now());
  let intervalId: number;

  watch(actionStartTimestamp, () => {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      now.value = Date.now();
      if (actionStartTimestamp.value + actionCooldown.value < now.value) {
        clearInterval(intervalId);
        actionStartTimestamp.value = 0;
      }
    }, 30);
  });

  onUnmounted(() => {
    clearInterval(intervalId);
  });

  function setTimestamp(nextTimestamp = Date.now()) {
    actionStartTimestamp.value = nextTimestamp;
    now.value = Date.now();
  }

  function setCooldown(nextCooldown = 100) {
    if (isNaN(nextCooldown)) {
      return;
    }
    actionCooldown.value = nextCooldown;
  }

  const progress = computed(() => {
    if (actionStartTimestamp.value === 0) {
      return 0;
    }
    return Math.max(
      0,
      Math.min(actionCooldown.value, now.value - actionStartTimestamp.value)
    );
  });

  const isDisabledButton = computed(() => {
    return actionStartTimestamp.value !== 0;
  });

  return {
    setTimestamp,
    setCooldown,
    progress: readonly(progress),
    progressEnd: readonly(actionCooldown),
    isDisabled: readonly(isDisabledButton),
  };
}

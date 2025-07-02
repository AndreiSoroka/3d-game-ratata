import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  const isDebugging = ref(document.location.hash.includes('debug'));
  const showInspector = ref(false);
  return { isDebugging, showInspector };
});

<script setup lang="ts">
import { ElSwitch } from 'element-plus';
import { useSettingsStore } from '@/stores/settingsStore';

const settingsStore = useSettingsStore();
</script>

<template>
  <ElSwitch v-model="settingsStore.isDebugging" label="Debug mode" />
</template>

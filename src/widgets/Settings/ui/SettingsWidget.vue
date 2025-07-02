<script setup lang="ts">
import { ChangeGameTime } from '@/features/ChangeGameTime';
import { ToggleDebugFlag } from '@/features/ToggleDebugFlag';
import { ToggleInspector } from '@/features/ToggleInspector';
import { useSettingsStore } from '@/stores/settingsStore';

const settingsStore = useSettingsStore();
</script>

<template>
  <div>
    <h1>Settings</h1>
    <div>Debug Mode: <ToggleDebugFlag /></div>
    <div v-if="settingsStore.isDebugging">
      Babylon Inspector: <ToggleInspector />
    </div>
    <div v-if="settingsStore.isDebugging">Game Time: <ChangeGameTime /></div>
  </div>
</template>

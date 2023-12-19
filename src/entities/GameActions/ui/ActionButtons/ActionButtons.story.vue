<script setup lang="ts">
import ActionVortexButton from '@/entities/GameActions/ui/ActionButtons/ActionVortexButton.vue';
import { onUnmounted, ref } from 'vue';
import ActionGravitationButton from '@/entities/GameActions/ui/ActionButtons/ActionGravitationButton.vue';
import ActionUpdraftButton from '@/entities/GameActions/ui/ActionButtons/ActionUpdraftButton.vue';
import ActionRadialExplosionButton from '@/entities/GameActions/ui/ActionButtons/ActionRadialExplosionButton.vue';

const actionTimestamp = ref<number>(Date.now());
let interval: number | null = null;

console.log('interval', interval);
interval = setInterval(() => {
  actionTimestamp.value = Date.now();
}, 10000);

onUnmounted(() => {
  if (interval) {
    clearInterval(interval);
  }
});
</script>

<template>
  <Story
    title="GameActions/Buttons Interactive"
    :layout="{ type: 'grid', width: 150 }">
    <Variant title="Gravitation">
      <ActionGravitationButton
        :action-timestamp="actionTimestamp"
        :cooldown="5000"
        keyboard-tip="1" />
    </Variant>
    <Variant title="Radial Explosion">
      <ActionRadialExplosionButton
        :action-timestamp="actionTimestamp"
        :cooldown="5000"
        keyboard-tip="2" />
    </Variant>
    <Variant title="Updraft">
      <ActionUpdraftButton
        :action-timestamp="actionTimestamp"
        :cooldown="5000"
        keyboard-tip="3" />
    </Variant>
    <Variant title="Vortex">
      <ActionVortexButton
        :action-timestamp="actionTimestamp"
        :cooldown="5000"
        keyboard-tip="4" />
    </Variant>
  </Story>
</template>

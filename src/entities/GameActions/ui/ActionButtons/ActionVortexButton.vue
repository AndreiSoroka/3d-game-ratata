<script setup lang="ts">
import useActionTimestamp from '@/entities/GameActions/lib/hooks/useActionTimestamp';
import ActionBaseButton from '@/entities/GameActions/ui/ActionBaseButton/ActionBaseButton.vue';
import { watch } from 'vue';
import image from '@/entities/GameActions/assets/actionVortex1.png';

const props = defineProps<{
  keyboardTip: string;
  cooldown: number;
  actionTimestamp: number;
}>();

const { setTimestamp, setCooldown, progress, progressEnd, isDisabled } =
  useActionTimestamp();

watch(() => props.actionTimestamp, setTimestamp, { immediate: true });
watch(() => props.cooldown, setCooldown, { immediate: true });
</script>

<template>
  <ActionBaseButton
    :keyboard-tip="keyboardTip"
    :progress="progress"
    :is-disabled="isDisabled"
    :progress-end="progressEnd"
    :image="image" />
</template>

<script setup lang="ts">
import ActionBaseButton from '@/entities/GameActions/ui/ActionBaseButton/ActionBaseButton.vue';
import actionUpdraft from '@/entities/GameActions/assets/actionUpdraft.png';
</script>

<template>
  <Story title="GameActions/Base Button" :layout="{ type: 'grid', width: 150 }">
    <Variant title="default">
      <ActionBaseButton keyboard-tip="1" />
    </Variant>
    <Variant title="with image">
      <ActionBaseButton keyboard-tip="2" :image="actionUpdraft" />
    </Variant>
    <Variant title="disabled">
      <ActionBaseButton keyboard-tip="3" :is-disabled="true" />
    </Variant>
    <Variant title="progress">
      <ActionBaseButton keyboard-tip="4" :progress="45" :progress-end="100" />
    </Variant>
  </Story>
</template>

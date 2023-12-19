<script setup lang="ts">
import ActionsWrapper from '@/entities/GameActions/ui/ActionsWrapper/ActionsWrapper.vue';
import ActionGravitationButton from '@/entities/GameActions/ui/ActionButtons/ActionGravitationButton.vue';
import ActionRadialExplosionButton from '@/entities/GameActions/ui/ActionButtons/ActionRadialExplosionButton.vue';
import ActionUpdraftButton from '@/entities/GameActions/ui/ActionButtons/ActionUpdraftButton.vue';
import ActionVortexButton from '@/entities/GameActions/ui/ActionButtons/ActionVortexButton.vue';
</script>

<template>
  <Story title="GameActions/ActionsWrapper">
    <Variant title="default">
      <ActionsWrapper>
        <div>123</div>
        <div>321</div>
      </ActionsWrapper>
    </Variant>
    <Variant title="buttons">
      <ActionsWrapper>
        <ActionGravitationButton
          keyboard-tip="1"
          :cooldown="5000"
          :action-timestamp="0" />
        <ActionRadialExplosionButton
          keyboard-tip="2"
          :cooldown="5000"
          :action-timestamp="0" />
        <ActionUpdraftButton
          keyboard-tip="3"
          :cooldown="5000"
          :action-timestamp="0" />
        <ActionVortexButton
          keyboard-tip="4"
          :cooldown="5000"
          :action-timestamp="0" />
      </ActionsWrapper>
    </Variant>
  </Story>
</template>

<script lang="ts" setup>
import { ElCard } from 'element-plus';

const { isMenuVisible } = defineProps<{
  isMenuVisible: boolean;
}>();
</script>
<template>
  <div class="container">
    <div class="container__item container__item-game">
      <slot name="game" />
    </div>
    <div class="container__item container__item-actions">
      <slot name="actions" />
    </div>
    <div class="container__item container__item-menu">
      <el-card v-if="isMenuVisible">
        <slot name="menu" />
      </el-card>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  position: relative;
  left: 0;
  top: 0;
  height: 100vh;
  width: 100vw;
}

.container__item {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;

  &-game {
    height: 100%;
  }

  &-actions {
    position: absolute;
    display: flex;
    height: fit-content;
    justify-content: center;
    align-items: center;
    top: auto;
    bottom: 15px;
  }

  &-menu {
    width: 35vw;
    max-width: 550px;
    top: 15px;
    left: 15px;

    @media (max-width: 768px) {
      width: auto;
      right: 15px;
    }
  }
}
</style>

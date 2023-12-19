<script setup lang="ts"></script>

<template>
  <div class="actions-wrapper">
    <div class="actions-wrapper__items">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.actions-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.actions-wrapper__items {
  display: inline-flex;
  gap: 1rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--el-mask-color);
  border-radius: 5px;
  background-color: var(--el-mask-color-extra-light);
  box-shadow: 0 0 5px var(--el-box-shadow);
}
</style>

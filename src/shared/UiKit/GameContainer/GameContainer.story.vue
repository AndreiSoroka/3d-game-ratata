<script setup lang="ts">
import GameContainer from './GameContainer.vue';
</script>

<template>
  <Story title="UiKit/GameContainer">
    <Variant title="default">
      <GameContainer :isMenuVisible="false">
        <template v-slot:menu>
          <div style="background: #00ff0033">
            <div>Menu</div>
            <div>Menu 1</div>
            <div>Menu 2</div>
            <div>Menu 3</div>
            <div>Menu 4</div>
            <div>Menu 5</div>
            <div>Menu 6</div>
            <div>Menu 7</div>
            <div>Menu 8</div>
            <div>Menu 9</div>
            <div>Menu 10</div>
            <div>Menu</div>
            <div>Menu 1</div>
            <div>Menu 2</div>
            <div>Menu 3</div>
            <div>Menu 4</div>
            <div>Menu 5</div>
            <div>Menu 6</div>
            <div>Menu 7</div>
            <div>Menu 8</div>
            <div>Menu 9</div>
            <div>Menu 10</div>
            <div>Menu</div>
            <div>Menu 1</div>
            <div>Menu 2</div>
            <div>Menu 3</div>
            <div>Menu 4</div>
            <div>Menu 5</div>
            <div>Menu 6</div>
            <div>Menu 7</div>
            <div>Menu 8</div>
            <div>Menu 9</div>
            <div>Menu 10</div>
          </div>
        </template>
        <template v-slot:game>
          <div style="background: #ff000033; width: 100%; height: 100%">
            Game
          </div>
        </template>
        <template #actions>
          <div style="background: #0000ff33">Actions</div>
        </template>
      </GameContainer>
    </Variant>
  </Story>
</template>

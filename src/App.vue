<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { ElContainer, ElHeader, ElMain } from 'element-plus';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Game from '@/entities/Game/Game';
import HavokPhysics from '@babylonjs/havok';
import { usePeerStore } from '@/stores/peer';
import {
  actionEvents$,
  movementEvents$,
} from '@/entities/Game/keyBoardController';

const gameCanvas = ref<HTMLCanvasElement>();
let game: Game;

const store = usePeerStore();

onMounted(() => {
  HavokPhysics().then((HK) => {
    if (!gameCanvas.value) {
      alert('Canvas not found');
      return;
    }
    gameCanvas.value.width = window.innerWidth;
    gameCanvas.value.height = window.innerHeight;
    game = new Game(gameCanvas.value, HK);

    game.multiplayerSubject$.subscribe((data) => {
      store.sendMultiplayerData({
        type: 'WORLD_ACTION',
        data,
      });
    });

    game.playerPositionSubject$.subscribe((data) => {
      store.sendMultiplayerData({
        type: 'PLAYER_POSITION',
        data,
      });
    });

    store.multiplayerDataSubject.subscribe(({ id, payload }) => {
      if (payload.type === 'PLAYER_POSITION') {
        game.setMultiPlayerPosition(id, payload.data);
      }
      if (payload.type === 'WORLD_ACTION') {
        game.callWordAction(payload.data);
      }
    });
  });
});

onBeforeUnmount(() => {
  game.dispose();
});

watch(
  () => store.multiplayerPeers,
  () => {
    console.log('multiplayerPeers changed');
  }
);
window.addEventListener('resize', function () {
  if (!gameCanvas.value) {
    return;
  }
  gameCanvas.value.width = window.innerWidth;
  gameCanvas.value.height = window.innerHeight;
  game.resize();
});

// controller
movementEvents$.subscribe((payload) => {
  if (!game) {
    return;
  }
  game.setPlayerDirection(payload.direction, payload.isPressed);
});
actionEvents$.subscribe((payload) => {
  if (!game) {
    return;
  }
  game.callPlayerAction(payload);
});
</script>

<template>
  <canvas ref="gameCanvas" class="game-canvas" />
  <el-container class="app">
    <el-header>
      <RouterLink to="/">Game</RouterLink>
      |
      <RouterLink to="/multiplayer">Multiplayer</RouterLink>
    </el-header>
    <el-main>
      <RouterView />
    </el-main>
  </el-container>
</template>

<style scoped lang="scss">
.app {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.game-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
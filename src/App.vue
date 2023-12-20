<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { ElContainer, ElFooter, ElHeader, ElMain } from 'element-plus';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Game from '@/entities/Game/Game';
import HavokPhysics from '@babylonjs/havok';
import { usePeerStore } from '@/stores/peer';
import ActionsWrapper from '@/entities/GameActions/ui/ActionsWrapper/ActionsWrapper.vue';
import ActionVortexButton from '@/entities/GameActions/ui/ActionButtons/ActionVortexButton.vue';
import ActionUpdraftButton from '@/entities/GameActions/ui/ActionButtons/ActionUpdraftButton.vue';
import ActionRadialExplosionButton from '@/entities/GameActions/ui/ActionButtons/ActionRadialExplosionButton.vue';
import ActionGravitationButton from '@/entities/GameActions/ui/ActionButtons/ActionGravitationButton.vue';
import ActionForwardImpulseButton from '@/entities/GameActions/ui/ActionButtons/ActionForwardImpulseButton.vue';
import KeyBoardController from '@/entities/Game/controllers/KeyBoardController';
import AdapterControllerWithGame from '@/entities/Game/AdapterControllerWithGame';

2;
const gameCanvas = ref<HTMLCanvasElement>();
let game: Game;
let adapterController: ReturnType<typeof AdapterControllerWithGame>;

const store = usePeerStore();

// controller
const buttonAction1Timestamp = ref<number>(0);
const buttonAction2Timestamp = ref<number>(0);
const buttonAction3Timestamp = ref<number>(0);
const buttonAction4Timestamp = ref<number>(0);
const buttonAction5Timestamp = ref<number>(0);

const COOLDOWN_ACTION1 = ref<number>(0);
const COOLDOWN_ACTION2 = ref<number>(0);
const COOLDOWN_ACTION3 = ref<number>(0);
const COOLDOWN_ACTION4 = ref<number>(0);
const COOLDOWN_ACTION5 = ref<number>(0);

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
    adapterController = AdapterControllerWithGame(KeyBoardController, game, {
      actionsFn(payload) {
        if (payload.action === 'ACTION1') {
          buttonAction1Timestamp.value = payload.timestamp;
          COOLDOWN_ACTION1.value = payload.cooldown;
        }
        if (payload.action === 'ACTION2') {
          buttonAction2Timestamp.value = payload.timestamp;
          COOLDOWN_ACTION2.value = payload.cooldown;
        }
        if (payload.action === 'ACTION3') {
          buttonAction3Timestamp.value = payload.timestamp;
          COOLDOWN_ACTION3.value = payload.cooldown;
        }
        if (payload.action === 'ACTION4') {
          buttonAction4Timestamp.value = payload.timestamp;
          COOLDOWN_ACTION4.value = payload.cooldown;
        }
        if (payload.action === 'ACTION5') {
          buttonAction5Timestamp.value = payload.timestamp;
          COOLDOWN_ACTION5.value = payload.cooldown;
        }
      },
    });
  });
});

onBeforeUnmount(() => {
  game.dispose();
  adapterController.destroy();
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
    <el-footer height="120">
      <!-- move to features -->
      <ActionsWrapper>
        <ActionGravitationButton
          :action-timestamp="buttonAction1Timestamp"
          :cooldown="COOLDOWN_ACTION1"
          keyboard-tip="1" />
        <ActionRadialExplosionButton
          :action-timestamp="buttonAction2Timestamp"
          keyboard-tip="2"
          :cooldown="COOLDOWN_ACTION2" />
        <ActionUpdraftButton
          :action-timestamp="buttonAction3Timestamp"
          keyboard-tip="3"
          :cooldown="COOLDOWN_ACTION3" />
        <ActionVortexButton
          :action-timestamp="buttonAction4Timestamp"
          keyboard-tip="4"
          :cooldown="COOLDOWN_ACTION4" />
        <ActionForwardImpulseButton
          :action-timestamp="buttonAction5Timestamp"
          :cooldown="COOLDOWN_ACTION5"
          keyboard-tip="W+W" />
      </ActionsWrapper>
    </el-footer>
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
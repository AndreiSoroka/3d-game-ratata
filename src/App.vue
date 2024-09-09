<script setup lang="ts">
import { RouterView } from 'vue-router';
import { ElTabPane, ElTabs } from 'element-plus';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Game from '@/entities/Game/Game';
import HavokPhysics from '@babylonjs/havok';
import { usePeerStore } from '@/entities/Multiplayer/module/peerStore';
import ActionsWrapper from '@/entities/GameActions/ui/ActionsWrapper/ActionsWrapper.vue';
import ActionVortexButton from '@/entities/GameActions/ui/ActionButtons/ActionVortexButton.vue';
import ActionUpdraftButton from '@/entities/GameActions/ui/ActionButtons/ActionUpdraftButton.vue';
import ActionRadialExplosionButton from '@/entities/GameActions/ui/ActionButtons/ActionRadialExplosionButton.vue';
import ActionGravitationButton from '@/entities/GameActions/ui/ActionButtons/ActionGravitationButton.vue';
import ActionForwardImpulseButton from '@/entities/GameActions/ui/ActionButtons/ActionForwardImpulseButton.vue';
import KeyBoardController from '@/entities/Game/controllers/KeyBoardController';
import AdapterControllerWithGame from '@/entities/Game/AdapterControllerWithGame';
import GameContainer from '@/app/UiKit/AppContainer/GameContainer.vue';
import router from '@/app/router';

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
      store.sendToMultiplayer({
        type: 'WORLD_ACTION',
        data,
      });
    });

    game.playerPositionSubject$.subscribe((data) => {
      store.sendToMultiplayer({
        type: 'PLAYER_POSITION',
        data,
      });
    });

    game.actionStateSubject$.subscribe((data) => {
      buttonAction1Timestamp.value = data.ACTION1.timestamp;
      COOLDOWN_ACTION1.value = data.ACTION1.cooldown;
      buttonAction2Timestamp.value = data.ACTION2.timestamp;
      COOLDOWN_ACTION2.value = data.ACTION2.cooldown;
      buttonAction3Timestamp.value = data.ACTION3.timestamp;
      COOLDOWN_ACTION3.value = data.ACTION3.cooldown;
      buttonAction4Timestamp.value = data.ACTION4.timestamp;
      COOLDOWN_ACTION4.value = data.ACTION4.cooldown;
      buttonAction5Timestamp.value = data.ACTION5.timestamp;
      COOLDOWN_ACTION5.value = data.ACTION5.cooldown;
    });

    // todo add zod instead on (payload as any)
    store.messages$.subscribe(({ id, payload }) => {
      if ((payload as any).type === 'PLAYER_POSITION') {
        game.setMultiPlayerPosition(id, (payload as any).data);
      }
      if ((payload as any).type === 'WORLD_ACTION') {
        game.callWordAction((payload as any).data);
      }
    });
    adapterController = AdapterControllerWithGame(KeyBoardController, game);
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

const tabs = {
  game: {
    label: 'Game',
    page: '/',
  },
  multiplayer: {
    label: 'Multiplayer',
    page: '/multiplayer',
  },
  chat: {
    label: 'Chat',
    page: '/chat',
  },
};
const tabsOrder: (keyof typeof tabs)[] = ['game', 'multiplayer', 'chat'];

function handleChangeTab(tabIndex: number | string) {
  if (!(tabIndex in tabs)) {
    throw new Error('tabIndex not found');
  }

  router.push(tabs[tabIndex as keyof typeof tabs].page);
}
</script>

<template>
  <GameContainer :is-menu-visible="true">
    <template #game>
      <canvas ref="gameCanvas" class="game-canvas" />
    </template>
    <template #menu>
      <el-tabs tab-position="top" @tab-change="handleChangeTab">
        <el-tab-pane
          v-for="tabName in tabsOrder"
          :label="tabs[tabName].label"
          :name="tabName"
          :key="tabName" />
        <div>
          <RouterView />
        </div>
      </el-tabs>
    </template>
    <template #actions>
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
    </template>
  </GameContainer>
</template>

<style scoped lang="scss">
.game-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
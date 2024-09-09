<script setup lang="ts">
import { ElDivider } from 'element-plus';

import { MultiplayerOnline } from '@/widgets/MultiplayerOnline';
import { MultiplayerMyRoomId } from '@/widgets/MultiplayerMyRoomId';
import { ConnectToRoomId } from '@/features/ConnectToRoomId';
</script>

<template>
  <MultiplayerMyRoomId />
  <el-divider />
  <ConnectToRoomId />
  <el-divider />
  <MultiplayerOnline />
</template>

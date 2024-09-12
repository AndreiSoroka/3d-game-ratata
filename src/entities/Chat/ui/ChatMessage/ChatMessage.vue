<script lang="ts" setup>
import { ElAvatar, ElText } from 'element-plus';

defineProps<{
  type: 'user' | 'userJoined' | 'userLeft';
  userId: string;
  isUserMessage: boolean;
  content: string;
  avatar?: string;
}>();
</script>

<template>
  <div class="message">
    <template v-if="type === 'user'">
      <el-avatar
        v-if="avatar"
        :src="avatar"
        size="small"
        shape="square"
        class="message__avatar" />
      <el-text>
        <strong> {{ isUserMessage ? 'Me' : 'Somebody' }}: </strong>
        {{ content }}
      </el-text>
    </template>
    <template v-else-if="type === 'userJoined'">
      <div class="message__center">
        <el-avatar v-if="avatar" :src="avatar" size="large" shape="square" />
        <div>
          <el-text>User Joined:</el-text>
        </div>
        <el-text size="small"> {{ userId }}</el-text>
      </div>
    </template>
    <template v-else-if="type === 'userLeft'">
      <div class="message__center">
        <div>
          <el-avatar
            v-if="avatar"
            :src="avatar"
            size="small"
            shape="square"
            class="message__avatar" />
          <el-text v-if="type === 'userLeft'">User Left:</el-text>
        </div>
        <el-text size="small"> {{ userId }}</el-text>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.message {
  margin-bottom: 6px;
}

.message__avatar {
  vertical-align: text-bottom;
  margin-right: 0.5rem;
}

.message__center {
  text-align: center;
  margin: 20px 0 11px;
}
</style>

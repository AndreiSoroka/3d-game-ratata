import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { generateRandomId } from '@/shared/libs/crypto/generateRandomId';
import type { Message } from '../types/Message.type';

const MAX_MESSAGES = 100;
const CLEAR_MESSAGES = 20;

export const useChatStore = defineStore('chat', () => {
  const messagesForSend = ref<string[]>([]);
  const messages = ref<Message[]>([]);

  const countOfMessagesForSend = computed(() => messagesForSend.value.length);

  function clearOverflowMessages() {
    if (messages.value.length > MAX_MESSAGES) {
      messages.value = messages.value.slice(CLEAR_MESSAGES);
    }
  }

  function addMessage(
    userId: string,
    content: string,
    type: Message['type'] = 'user'
  ) {
    messages.value.push({
      type,
      // todo use id from peer request
      id: generateRandomId(),
      userId,
      content,
      timestamp: Date.now(),
    });
  }

  const addSystemMessageUserJoined = (userId: string) => {
    addMessage(userId, '', 'userJoined');
  };

  function addSystemMessageUserLeft(userId: string) {
    addMessage(userId, '', 'userLeft');
  }

  function sendMessage(message: string) {
    messagesForSend.value.push(message);
  }

  function clearMessageForSend() {
    messagesForSend.value = [];
  }

  return {
    messages,
    messagesForSend,
    countOfMessagesForSend,
    sendMessage,
    addMessage,
    addSystemMessageUserJoined,
    addSystemMessageUserLeft,
    clearOverflowMessages,
    clearMessageForSend,
  };
});

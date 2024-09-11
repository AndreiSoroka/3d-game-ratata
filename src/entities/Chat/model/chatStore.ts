import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { generateRandomId } from '@/shared/libs/crypto/generateRandomId';

type Message = {
  id: string;
  user: string;
  content: string;
  timestamp: number;
};

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

  function addMessage(user: string, content: string) {
    messages.value.push({
      id: generateRandomId(),
      user,
      content,
      timestamp: Date.now(),
    });
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
    clearOverflowMessages,
    clearMessageForSend,
  };
});

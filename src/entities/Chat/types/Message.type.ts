export type Message = {
  type: 'user' | 'userJoined' | 'userLeft';
  id: string;
  userId: string;
  content: string;
  timestamp: number;
};

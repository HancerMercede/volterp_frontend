import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatStore {
  messages: ChatMessage[];
  isTyping: boolean;
  isEscalating: boolean;
  sessionActive: boolean;
  addMessage: (content: string, role: 'user' | 'assistant') => void;
  setTyping: (typing: boolean) => void;
  setEscalating: (escalating: boolean) => void;
  resetSession: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isTyping: false,
  isEscalating: false,
  sessionActive: true,

  addMessage: (content, role) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          role,
          content,
          timestamp: new Date(),
        },
      ],
    })),

  setTyping: (typing) => set({ isTyping: typing }),

  setEscalating: (escalating) => set({ isEscalating: escalating }),

  resetSession: () =>
    set({
      messages: [],
      isTyping: false,
      isEscalating: false,
      sessionActive: true,
    }),
}));
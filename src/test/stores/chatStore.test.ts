import { useChatStore } from '../../stores/chatStore';

beforeEach(() => {
  useChatStore.setState({
    messages: [],
    isTyping: false,
    isEscalating: false,
    sessionActive: true,
  });
});

describe('chatStore', () => {
  describe('addMessage', () => {
    it('adds user and assistant messages with correct role and content', () => {
      useChatStore.getState().addMessage('Hello', 'user');
      useChatStore.getState().addMessage('Hi there', 'assistant');

      const messages = useChatStore.getState().messages;
      expect(messages).toHaveLength(2);
      expect(messages[0]).toMatchObject({ role: 'user', content: 'Hello' });
      expect(messages[1]).toMatchObject({ role: 'assistant', content: 'Hi there' });
    });

    it('generates unique ids and Date timestamps', () => {
      useChatStore.getState().addMessage('Msg1', 'user');
      useChatStore.getState().addMessage('Msg2', 'user');

      const messages = useChatStore.getState().messages;
      expect(messages[0].id).not.toBe(messages[1].id);
      expect(messages[0].timestamp).toBeInstanceOf(Date);
    });
  });

  describe('setTyping', () => {
    it('toggles isTyping state', () => {
      expect(useChatStore.getState().isTyping).toBe(false);
      useChatStore.getState().setTyping(true);
      expect(useChatStore.getState().isTyping).toBe(true);
      useChatStore.getState().setTyping(false);
      expect(useChatStore.getState().isTyping).toBe(false);
    });
  });

  describe('setEscalating', () => {
    it('toggles isEscalating state', () => {
      expect(useChatStore.getState().isEscalating).toBe(false);
      useChatStore.getState().setEscalating(true);
      expect(useChatStore.getState().isEscalating).toBe(true);
      useChatStore.getState().setEscalating(false);
      expect(useChatStore.getState().isEscalating).toBe(false);
    });
  });

  describe('resetSession', () => {
    it('clears all state to initial values', () => {
      useChatStore.setState({
        messages: [{ id: '1', role: 'user' as const, content: 'Test', timestamp: new Date() }],
        isTyping: true,
        isEscalating: true,
        sessionActive: false,
      });

      useChatStore.getState().resetSession();

      const state = useChatStore.getState();
      expect(state.messages).toHaveLength(0);
      expect(state.isTyping).toBe(false);
      expect(state.isEscalating).toBe(false);
      expect(state.sessionActive).toBe(true);
    });
  });
});
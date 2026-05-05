import { useEffect, useRef } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { QuickActions } from './QuickActions';
import { ChatInput } from './ChatInput';
import styles from './ChatWindow.module.css';

const WELCOME_MESSAGE = `Hola! Soy el asistente de soporte de Volterp. 

Puedo ayudarte con cualquier consulta sobre el sistema.

¿En qué puedo ayudarte hoy?`;

interface ChatWindowProps {
  onSendMessage: (message: string) => void;
}

export function ChatWindow({ onSendMessage }: ChatWindowProps) {
  const { messages, isTyping } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleQuickAction = (query: string) => {
    onSendMessage(query);
  };

  return (
    <div className={styles.container}>
      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.welcome}>
            <div className={styles.welcomeIcon}>🤖</div>
            <div className={styles.welcomeText}>{WELCOME_MESSAGE}</div>
            <QuickActions onAction={handleQuickAction} />
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={onSendMessage} disabled={isTyping} />
    </div>
  );
}
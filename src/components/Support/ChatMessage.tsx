import { User, Bot } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../stores/chatStore';
import styles from './ChatMessage.module.css';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`${styles.container} ${isUser ? styles.user : styles.assistant}`}>
      <div className={styles.avatar}>
        {isUser ? <User size={20} strokeWidth={1.8} /> : <Bot size={20} strokeWidth={1.8} />}
      </div>
      <div className={styles.bubble}>
        <div className={styles.content}>{message.content}</div>
        <div className={styles.time}>
          {message.timestamp.toLocaleTimeString('es-DO', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
}

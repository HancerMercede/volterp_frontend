import { useState } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { ChatHeader } from '../../components/Support/ChatHeader';
import { ChatWindow } from '../../components/Support/ChatWindow';
import { EscalationButton } from '../../components/Support/EscalationButton';
import { useUIStore } from '../../stores/uiStore';
import { getAIResponse } from '../../data/soporteResponses';
import styles from './Soporte.module.css';

export function Soporte() {
  const { messages, addMessage, setTyping, setEscalating, isEscalating, isTyping } = useChatStore();
  const { addToast } = useUIStore();
  const [showEscalation, setShowEscalation] = useState(false);

  const handleSendMessage = async (message: string) => {
    addMessage(message, 'user');
    setTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const response = getAIResponse(message);
    addMessage(response, 'assistant');
    setTyping(false);

    if (messages.length >= 4) {
      setShowEscalation(true);
    }
  };

  const handleEscalate = async () => {
    setEscalating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setEscalating(false);
    addToast('Tu mensaje ha sido enviado a nuestro equipo de soporte. Te contactaremos pronto.', 'success');
    setShowEscalation(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatContainer}>
        <ChatHeader />
        <ChatWindow onSendMessage={handleSendMessage} />
        {showEscalation && messages.length > 0 && !isTyping && (
          <EscalationButton onClick={handleEscalate} isLoading={isEscalating} />
        )}
      </div>
    </div>
  );
}
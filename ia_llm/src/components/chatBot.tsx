import { useEffect, useRef, useState } from 'react';
import { useChatMutation } from '../hooks/mutations/useChat';
import type {
  ChatGenerationProfile,
  ChatPromptMessage,
  SendMessageToBotPayload,
} from '../services/api/chat';
import styles from './chatBot.module.css';

interface ChatMessage {
  type: 'user' | 'bot';
  text: string;
}

type ProfileKey = ChatGenerationProfile['key'];

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
  profile: ChatGenerationProfile;
}


const STORAGE_KEY = 'accenture-ia-chat-sessions';

const DEFAULT_PROFILE_KEY: ProfileKey = 'gestor';

const PROFILE_OPTIONS: Record<
  ProfileKey,
  ChatGenerationProfile & { label: string; description: string; systemPrompt: string }
> = {
  professor: {
    key: 'professor',
    label: 'Professor',
    description: 'Resposta pedagógica e detalhada',
    temperature: 0.4,
    max_tokens: 600,
    top_p: 0.9,
    frequency_penalty: 0.3,
    systemPrompt:
      'Você é um assistente pedagógico. Responda com clareza, detalhe os passos quando necessário e mantenha um tom didático.',
  },
  familia: {
    key: 'familia',
    label: 'Família',
    description: 'Linguagem simples e acolhedora',
    temperature: 0.5,
    max_tokens: 350,
    top_p: 0.9,
    frequency_penalty: 0.2,
    systemPrompt:
      'Você é um assistente acolhedor. Responda com linguagem simples, tom amigável e foco em entendimento rápido.',
  },
  gestor: {
    key: 'gestor',
    label: 'Gestor',
    description: 'Resposta técnica e objetiva',
    temperature: 0.1,
    max_tokens: 300,
    top_p: 0.9,
    frequency_penalty: 0,
    systemPrompt:
      'Você é um assistente executivo. Responda de forma objetiva, técnica e direta ao ponto.',
  },
};

function getTimeGreeting(date: Date) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return 'Bom dia';
  }

  if (hour >= 12 && hour < 18) {
    return 'Boa tarde';
  }

  return 'Boa noite';
}

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function createSessionId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSessionTitle(messages: ChatMessage[]) {
  const firstUserMessage = messages.find((message) => message.type === 'user');

  if (!firstUserMessage) {
    return 'Novo chat';
  }

  return firstUserMessage.text.length > 32
    ? `${firstUserMessage.text.slice(0, 32).trimEnd()}...`
    : firstUserMessage.text;
}

function getDefaultProfile() {
  return PROFILE_OPTIONS[DEFAULT_PROFILE_KEY];
}

function getStoredProfile(profile?: ChatGenerationProfile) {
  if (!profile || !(profile.key in PROFILE_OPTIONS)) {
    return getDefaultProfile();
  }

  return PROFILE_OPTIONS[profile.key as ProfileKey];
}

function createEmptySession(profile: ChatGenerationProfile = getDefaultProfile()) {
  return {
    id: createSessionId(),
    title: 'Novo chat',
    messages: [],
    updatedAt: Date.now(),
    profile,
  } satisfies ChatSession;
}

function loadStoredSessions() {
  if (!canUseBrowserStorage()) {
    return [] as ChatSession[];
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return [] as ChatSession[];
    }

    const parsedValue = JSON.parse(rawValue) as ChatSession[];

    return parsedValue
      .filter((session) => Array.isArray(session.messages) && session.messages.length > 0)
      .map((session) => ({
        ...session,
        profile: getStoredProfile(session.profile),
      }));
  } catch {
    return [] as ChatSession[];
  }
}

export function ChatLayout() {
  const [message, setMessage] = useState('');
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadStoredSessions());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [greeting, setGreeting] = useState(() => getTimeGreeting(new Date()));
  const [selectedProfileKey, setSelectedProfileKey] = useState<ProfileKey>(DEFAULT_PROFILE_KEY);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const chatMutation = useChatMutation();

  const orderedSessions = [...sessions].sort((left, right) => right.updatedAt - left.updatedAt);
  const activeSession = orderedSessions.find((session) => session.id === activeSessionId) ?? null;
  const history = activeSession?.messages ?? [];
  const selectedProfile = PROFILE_OPTIONS[selectedProfileKey];

  useEffect(() => {
    const updateGreeting = () => setGreeting(getTimeGreeting(new Date()));

    updateGreeting();

    const intervalId = window.setInterval(updateGreeting, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (!canUseBrowserStorage()) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (activeSession) {
      setSelectedProfileKey(activeSession.profile.key);
    }
  }, [activeSession]);

  const updateSessionMessages = (sessionId: string, nextMessages: ChatMessage[]) => {
    const updatedAt = Date.now();

    setSessions((previousSessions) => {
      const existingSession = previousSessions.find((session) => session.id === sessionId);

      if (!existingSession) {
        return [
          {
            id: sessionId,
            title: getSessionTitle(nextMessages),
            messages: nextMessages,
            updatedAt,
            profile: selectedProfile,
          },
          ...previousSessions,
        ];
      }

      return previousSessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              title: getSessionTitle(nextMessages),
              messages: nextMessages,
              updatedAt,
              profile: selectedProfile,
            }
          : session,
      );
    });
  };

  const startNewChat = () => {
    const newSession = createEmptySession(selectedProfile);

    setSessions((previousSessions) => [newSession, ...previousSessions]);
    setActiveSessionId(newSession.id);
    setMessage('');
  };

  const openChatSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setMessage('');
  };

  const deleteChatSession = (sessionId: string) => {
    setSessions((previousSessions) => previousSessions.filter((session) => session.id !== sessionId));

    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      setMessage('');
    }
  };

  const handleProfileChange = (profileKey: ProfileKey) => {
    setSelectedProfileKey(profileKey);

    if (activeSessionId) {
      setSessions((previousSessions) =>
        previousSessions.map((session) =>
          session.id === activeSessionId
            ? {
                ...session,
                profile: PROFILE_OPTIONS[profileKey],
                updatedAt: Date.now(),
              }
            : session,
        ),
      );
    }
  };

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    setMessage('');

    const sessionId = activeSessionId ?? createSessionId();
    const nextUserMessages: ChatMessage[] = [
      ...history,
      { type: 'user', text: trimmedMessage },
    ];

    const promptMessages: ChatPromptMessage[] = [
      { role: 'system', content: selectedProfile.systemPrompt },
      ...nextUserMessages.map((chatMessage) => ({
        role: (chatMessage.type === 'user' ? 'user' : 'assistant') as ChatPromptMessage['role'],
        content: chatMessage.text,
      })) as ChatPromptMessage[],
    ];

    if (!activeSessionId) {
      setActiveSessionId(sessionId);
    }

    updateSessionMessages(sessionId, nextUserMessages);

    const payload: SendMessageToBotPayload = {
      message: trimmedMessage,
      messages: promptMessages,
      profile: selectedProfile,
    };

    chatMutation.mutate(payload, {
      onSuccess: (botReply) => {
        updateSessionMessages(sessionId, [
          ...nextUserMessages,
          { type: 'bot', text: botReply },
        ] as ChatMessage[]);
      },
      onError: () => {
        updateSessionMessages(sessionId, [
          ...nextUserMessages,
          { type: 'bot', text: 'Erro: Conexão falhou.' },
        ] as ChatMessage[]);
      },
    });
  };

  return (
    <div className={styles.appContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>AcolheIA</div>

        <div className={styles.profileArea}>
          <label className={styles.profileLabel} htmlFor="profile-select">
            Perfil do usuário
          </label>
          <select
            id="profile-select"
            className={styles.profileSelect}
            value={selectedProfileKey}
            onChange={(event) => handleProfileChange(event.target.value as ProfileKey)}
          >
            {Object.values(PROFILE_OPTIONS).map((profile) => (
              <option key={profile.key} value={profile.key}>
                {profile.label} - {profile.description}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.recentsArea}>Recentes</div>
        <div className={styles.recentList}>
          {orderedSessions.length === 0 ? (
            <div className={styles.recentEmpty}>Nenhuma conversa salva ainda.</div>
          ) : (
            orderedSessions.map((session) => (
              <div
                key={session.id}
                className={`${styles.recentItem} ${session.id === activeSessionId ? styles.recentItemActive : ''}`}
              >
                <button
                  type="button"
                  className={styles.recentItemBody}
                  onClick={() => openChatSession(session.id)}
                >
                  <span className={styles.recentItemTitle}>{session.title}</span>
                  <span className={styles.recentItemPreview}>
                    {session.messages[session.messages.length - 1]?.text ?? 'Sem mensagens'}
                  </span>
                </button>
                <button
                  type="button"
                  className={styles.recentDeleteButton}
                  onClick={() => deleteChatSession(session.id)}
                  aria-label={`Apagar chat ${session.title}`}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        <button type="button" className={styles.newChatButton} onClick={startNewChat}>
          Novo chat
        </button>

        <div className={styles.sidebarSpacer} />

        <div className={styles.userProfile}>
          <div className={styles.avatar}>U</div>
          <div>Usuário</div>
        </div>
      </aside>

      <main className={styles.contentArea}>
        <div className={styles.greetingHeader}>
          <span className={styles.greetingIcon}>✦</span>
          <span>{greeting}, Usuário</span>
        </div>

        <section className={styles.chatModal}>
          <header className={styles.chatHeader}>
            <div>
              <h1 className={styles.chatTitle}>Assistente</h1>
              <p className={styles.chatSubtitle}>
                Perfil atual: {selectedProfile.label}
              </p>
            </div>
          </header>

          <div className={styles.chatHistory} ref={chatHistoryRef}>
            {history.map((msg, index) => (
              <div
                key={`${msg.type}-${index}`}
                className={`${styles.bubble} ${msg.type === 'user' ? styles.userBubble : styles.botBubble}`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {chatMutation.isPending && (
            <div className={styles.typingIndicator}>A assistente está digitando...</div>
          )}

          <div className={styles.chatInputArea}>
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              placeholder="Digite sua pergunta..."
              className={styles.chatInput}
              disabled={chatMutation.isPending}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              className={styles.chatSendBtn}
              disabled={chatMutation.isPending}
            >
              Enviar
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
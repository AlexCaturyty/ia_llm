import { api } from '../../lib/axios';

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatPromptMessage {
  role: ChatRole;
  content: string;
}

export interface ChatGenerationProfile {
  key: 'professor' | 'familia' | 'gestor';
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
}

export interface SendMessageToBotPayload {
  message: string;
  messages: ChatPromptMessage[];
  profile: ChatGenerationProfile;
}

export const sendMessageToBot = async (payload: SendMessageToBotPayload): Promise<string> => {
  const response = await api.post('/chat', payload);
  return response.data.response;
};
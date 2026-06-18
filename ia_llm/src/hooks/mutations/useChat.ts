import { useMutation } from '@tanstack/react-query';
import { sendMessageToBot, type SendMessageToBotPayload } from '../../services/api/chat';

export function useChatMutation() {
  return useMutation({
    mutationFn: sendMessageToBot,
  });
}

export type { SendMessageToBotPayload };
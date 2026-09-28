import { Faq } from './faq-conversation';

export interface GetNotificationInterface {
  getNotification: FaqNotification[];
}

export interface FaqNotification {
  id: number;
  recipientId: string;
  faq: Faq;
  createdAt: string;
}

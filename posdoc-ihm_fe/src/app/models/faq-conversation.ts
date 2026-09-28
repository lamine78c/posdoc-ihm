export interface Exchange {
  id: number;
  author: string;
  message: string;
  createdAt: string;
}

export interface Faq {
  id: number;
  path: string;
  question: string;
  answer: string | null;
  status: FaqStatusType;
  viewCount: number;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  exchanges: Exchange[];
}

export enum FaqStatusType {
  DRAFT = 'DRAFT',
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED'
}

export interface FaqInterface {
  searchAllFaq: Faq[];
}

export interface SearchFaqByPathResponse {
  searchFaqByPath: Faq[];
}

export interface SearchFaqByUserIdResponse {
  searchFaqByUserId: Faq[];
}

export interface SearchAllFaqResponse {
  searchAllFaq: Faq[];
}

export interface IncreaseViewCountResponse {
  increaseViewCount: Faq[];
}

export interface CreateFaqExchangeResponse {
  createFaqExchange: Faq;
}

export interface CreateFaqResponse {
  createFaq: Faq[];
}

export interface UpdateFaqResponse {
  updateFaq: Faq[];
}

export interface UpdateStatusResponse {
  updateStatus: Faq;
}

export interface DeleteFaqResponse {
  deleteFaq: {
    ok: boolean;
  };
}

export interface HealthCheckDetail {
  status: string;
  details?: any;
}

export interface HealthCheckResponse {
  status: string;
  details?: {
    [key: string]: HealthCheckDetail;
  };
}

export interface ServiceWithHealth {
  id: number;
  libelle: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  healthCheck?: HealthCheckResponse;
  healthCheckLoading?: boolean;
  healthCheckError?: string;
}

export interface ServiceInterface {
  id: number;
  libelle: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface FindAllServicesInterface {
  findAllServices: ServiceInterface[];
}

export interface CreateServiceInterface {
  createServicePosdoc: ServiceInterface[];
}

export interface UpdateServiceInterface {
  updateServicePosdoc: ServiceInterface[];
}

export interface CreateUpdateServiceInput {
  id?: number;
  libelle: string;
  url: string;
}

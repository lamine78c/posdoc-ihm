export interface HelpInterface {
  id: number;
  path: string;
  message: string;
  state: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetPublicationInterface {
  getPublication: HelpInterface[];
}

export interface GetPathCompletByPathInterface {
  getPathCompletByPath: string;
}

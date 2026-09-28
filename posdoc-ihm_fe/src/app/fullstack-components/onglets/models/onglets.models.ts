export interface OngletPremierNiveau {
  label: string;
  badge?: string;
  badgeValue?: number;
  iconBefore?: string;
  iconAfter?: string;
  infobulle?: string;
  canClose?: boolean;
  perm?: number;
}

export interface OngletPremierNiveauIcone {
  label: string;
  subLabel: string;
  icon: string;
  canClose?: boolean;
  perm?: number;
}

export interface OngletDeuxiemeNiveau {
  label: string;
  badge?: string;
  badgeValue?: number;
  iconBefore?: string;
  iconAfter?: string;
  infobulle?: string;
  canClose?: boolean;
  perm?: number;
}

export interface NextActiveTab {
  value: number;
  isLast: boolean;
}

export interface OngletModal {
  label: string;
  component: any;
  perm?: number;
}

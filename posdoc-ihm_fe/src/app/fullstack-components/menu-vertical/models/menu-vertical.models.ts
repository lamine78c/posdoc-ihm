export interface MenuVerticalChild {
  label: string;
  route?: string;
  activated?: boolean;
  splitter?: boolean;
}

export interface MenuVertical {
  label?: string;
  icon?: string;
  activated?: boolean;
  route?: string;
  children?: MenuVerticalChild[];
  splitter?: true;
}

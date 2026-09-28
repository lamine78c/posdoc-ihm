export interface nodeTreeSelected {
  selectedElement: string;
  isParent: boolean;
  parentKey: string;
}

export function setNodeSelected(selectedElement: string): nodeTreeSelected {
  return {
    selectedElement: selectedElement,
    isParent: true,
    parentKey: selectedElement,
  };
}

export function setChildNodeSelected(selectedElement: string, parentKey: string): nodeTreeSelected {
  return {
    selectedElement: selectedElement,
    isParent: false,
    parentKey: parentKey,
  };
}

export type TBtnType = 'number' | 'operator' | 'function' | 'zero';
export interface IBtn { 
  label: string; 
  type: TBtnType; 
  value: string; 
  span?: number; 
}

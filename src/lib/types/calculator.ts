export type BtnType = 'number' | 'operator' | 'function' | 'zero';
export interface Btn { 
  label: string; 
  type: BtnType; 
  value: string; 
  span?: number; 
}

export type TBtnType = 'number' | 'operator' | 'action' | 'equal' | 'function' | 'zero';
export interface IBtn {
	label: string;
	type: TBtnType;
	value: string;
	span?: number;
}

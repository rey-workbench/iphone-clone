export interface INote {
	id: string;
	user_id?: string;
	title: string;
	content: string;
	date: Date | string;
}

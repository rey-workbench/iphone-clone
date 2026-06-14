export interface IDialogOptions {
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
}

export interface IDialogGlobalState {
	isOpen: boolean;
	options: IDialogOptions | null;

	show(options: IDialogOptions): Promise<boolean>;
	confirm(): void;
	cancel(): void;
}

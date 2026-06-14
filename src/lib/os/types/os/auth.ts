export interface IAuthGlobalState {
	username: string;
	password: string;
	isLoading: boolean;
	errorMsg: string;

	login(): Promise<unknown>;
	logout(): Promise<void>;
}

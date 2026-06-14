export interface IAppLifecycle {
	appName: string;
	isForeground: boolean;
	onLaunch(): Promise<void> | void;
	onSuspend(): void;
	onResume(): void;
	onDestroy(): void;
}

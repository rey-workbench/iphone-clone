export interface ISafariSearchResult {
	title: string;
	url: string;
	description: string;
	content?: string;
	snippet?: string;
}

export interface IScramjetFrame {
	contentWindow: Window;
	contentDocument: Document;
	go: (url: string) => void;
}

export interface IScramjetController {
	init(options: Record<string, unknown>): void;
	createFrame(iframe: HTMLIFrameElement): IScramjetFrame;
	wait(): Promise<void>;
	Controller?: any;
}

export interface IWindowWithScramjet extends Window {
	exports?: unknown;
	module?: unknown;
	define?: unknown;
	LibcurlTransport?: { default: any };
	$scramjetController?: IScramjetController;
}

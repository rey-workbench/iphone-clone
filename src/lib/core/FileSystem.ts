// Virtual File System (VFS)
import localforage from 'localforage';

export class FileSystem {
	private store = localforage.createInstance({ name: 'reynisa_os_vfs' });

	async readFile(path: string): Promise<any> {
		return await this.store.getItem(path);
	}

	async writeFile(path: string, data: any): Promise<void> {
		await this.store.setItem(path, data);
	}

	async deleteFile(path: string): Promise<void> {
		await this.store.removeItem(path);
	}

	async readDir(directory: string): Promise<string[]> {
		const keys = await this.store.keys();
		return keys.filter((k: string) => k.startsWith(directory));
	}
}

export const fs = new FileSystem();

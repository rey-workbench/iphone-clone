import { LocalDBAdapter } from './core';
export const appstoreDb = new LocalDBAdapter('appstore');

export const AppStoreDBKey = {
	APPSTORE_PRODUCTS: 'appstore_products',
	APP_STORE: 'app_store'
} as const;

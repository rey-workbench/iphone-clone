import { LocalDBAdapter } from './core';
export const appstoreDb = new LocalDBAdapter('myphone_appstore_db', 'appstore');

export const AppStoreDBKey = {
  APPSTORE_PRODUCTS: 'appstore_products',
  APP_STORE: 'app_store',
} as const;

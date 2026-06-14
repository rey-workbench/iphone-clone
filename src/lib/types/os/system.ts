

export interface ISystemCurrentUser {
  id: string;
  username: string;
  name: string;
}

export interface ISystemGlobalState {
  recentApps: string[];
  currentUser: ISystemCurrentUser | null;
  currentTime: Date;
  deviceId: string;
  deviceName: string;
  isInitializing: boolean;

  removeRecentApp(appId: string): void;
  addRecentApp(appId: string): void;
  saveRecentApps(): Promise<void>;
  saveUser(): Promise<void>;
}

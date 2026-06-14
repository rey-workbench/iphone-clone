export interface INotificationOptions {
  title: string;
  message: string;
  icon?: string;
  onClick?: () => void;
}

export interface INotificationItem extends INotificationOptions {
  id: string;
}

export interface INotificationGlobalState {
  notifications: INotificationItem[];

  show(options: INotificationOptions): void;
  close(id: string): void;
}

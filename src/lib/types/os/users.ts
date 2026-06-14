export interface IUser {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  color?: string;
}

export interface IUsersGlobalState {
  users: IUser[];
  fetchUsers(onUpdate?: (users: IUser[]) => void): Promise<void>;
}

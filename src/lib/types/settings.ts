export interface ILinkedDevice {
  device_id: string;
  user_agent: string;
  ip_address?: string;
  last_active: string;
  created_at: string;
  is_current?: boolean;
  device_name?: string;
}

/**
 * OS Global States Interfaces
 * These interfaces define the strict contracts for the global OS state singletons.
 * They ensure public variables and methods are strictly typed and separated from internal implementation details.
 */

// ----------------------------------------------------------------------------
// 1. SYSTEM
// ----------------------------------------------------------------------------
export interface ISystemCurrentUser {
  id: string;
  username: string;
  name: string;
}

export interface ISystemGlobalState {
  // --- State ---
  recentApps: string[];
  currentUser: ISystemCurrentUser | null;
  currentTime: Date;
  deviceId: string;
  deviceName: string;
  isInitializing: boolean;

  // --- Methods ---
  removeRecentApp(appId: string): void;
  addRecentApp(appId: string): void;
  saveRecentApps(): Promise<void>;
  saveUser(): Promise<void>;
}

// ----------------------------------------------------------------------------
// 2. AUTH
// ----------------------------------------------------------------------------
export interface IAuthGlobalState {
  // --- State ---
  username: string;
  password: string;
  isLoading: boolean;
  errorMsg: string;

  // --- Methods ---
  login(): Promise<any>;
  logout(): Promise<void>;
}

// ----------------------------------------------------------------------------
// 3. DIALOG
// ----------------------------------------------------------------------------
export interface IDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export interface IDialogGlobalState {
  // --- State ---
  isOpen: boolean;
  options: IDialogOptions | null;

  // --- Methods ---
  show(options: IDialogOptions): Promise<boolean>;
  confirm(): void;
  cancel(): void;
}

// ----------------------------------------------------------------------------
// 4. NOTIFICATION
// ----------------------------------------------------------------------------
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
  // --- State ---
  notifications: INotificationItem[];

  // --- Methods ---
  show(options: INotificationOptions): void;
  close(id: string): void;
}

// ----------------------------------------------------------------------------
// 5. USERS
// ----------------------------------------------------------------------------
export interface IUsersGlobalState {
  // --- State ---
  users: any[];

  // --- Methods ---
  fetchUsers(onUpdate?: (users: any[]) => void): Promise<void>;
}

// ----------------------------------------------------------------------------
// 6. WEBRTC
// ----------------------------------------------------------------------------
export type CallStatus = 'idle' | 'calling' | 'incoming' | 'active';

export interface ISignalCallback {
  onOffer: (payload: any) => void;
  onAnswer: (payload: any) => void;
  onIceCandidate: (payload: any) => void;
  onEnd: () => void;
  onAnsweredElsewhere: (payload: any) => void;
}

export interface IWebrtcGlobalState {
  // --- State ---
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;

  // --- Methods ---
  setupSignaling(callbacks: ISignalCallback): void;
  waitForSubscription(timeout?: number): Promise<boolean>;
  sendSignal(toUserId: string, event: string, payload?: any, toDeviceId?: string): Promise<void>;
  
  getLocalStream(withVideo?: boolean): Promise<MediaStream>;
  createPeerConnection(onDisconnect: () => void): Promise<RTCPeerConnection>;
  setIceCandidateCallback(cb: (c: RTCIceCandidate) => void): void;
  addLocalTracksToPc(): void;
  
  createOffer(): Promise<RTCSessionDescriptionInit>;
  setRemoteOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit>;
  setRemoteAnswer(answer: RTCSessionDescriptionInit): Promise<void>;
  addIceCandidate(candidate: RTCIceCandidateInit): Promise<void>;
  
  setMuted(muted: boolean): void;
  setSpeakerVolume(loud: boolean): void;
  toggleVideo(enable: boolean, toUserId: string, toDeviceId?: string): Promise<boolean>;
  cleanup(): void;
}

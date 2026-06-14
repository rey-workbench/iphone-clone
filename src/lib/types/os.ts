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

import type { IUser } from './users';

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
  login(): Promise<unknown>;
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
  users: IUser[];

  // --- Methods ---
  fetchUsers(onUpdate?: (users: IUser[]) => void): Promise<void>;
}

// ----------------------------------------------------------------------------
// 6. WEBRTC
// ----------------------------------------------------------------------------
export type CallStatus = 'idle' | 'calling' | 'incoming' | 'active';

import type { ISignalingPayload } from './phone';

export interface ISignalCallback {
  onOffer: (payload: ISignalingPayload) => void;
  onAnswer: (payload: ISignalingPayload) => void;
  onIceCandidate: (payload: ISignalingPayload) => void;
  onEnd: () => void;
  onAnsweredElsewhere: (payload: unknown) => void;
}

export interface IWebrtcGlobalState {
  // --- State ---
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;

  // --- Methods ---
  setupSignaling(callbacks: ISignalCallback): void;
  waitForSubscription(timeout?: number): Promise<boolean>;
  sendSignal(toUserId: string, event: string, payload?: unknown, toDeviceId?: string): Promise<void>;
  
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

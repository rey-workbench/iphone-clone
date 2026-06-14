export type TPhoneTabId = 'favorites' | 'recents' | 'contacts' | 'keypad' | 'voicemail';

export interface ICallHistoryEntry {
  id: string;
  name?: string;
  time: string;
  type: 'incoming' | 'outgoing' | 'missed';
  isVideo: boolean;
  missed: boolean;
}

export interface IContact {
  id: string;
  name: string;
  username: string;
  initials: string;
}

export interface ISignalingPayload {
  to?: string;
  toDeviceId?: string;
  from?: { id: string; name: string; username?: string };
  fromDeviceId?: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

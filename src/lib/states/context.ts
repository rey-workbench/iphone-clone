import { getContext, setContext } from 'svelte';
import { systemState } from './systemState.svelte';
import { authState } from './authState.svelte';
import { dialogState } from './dialogState.svelte';
import { usersState } from './usersState.svelte';
import { webrtcState } from './webrtcState.svelte';

export const SYSTEM_STATE_KEY = Symbol('SYSTEM_STATE');
export const AUTH_STATE_KEY = Symbol('AUTH_STATE');
export const DIALOG_STATE_KEY = Symbol('DIALOG_STATE');
export const USERS_STATE_KEY = Symbol('USERS_STATE');
export const WEBRTC_STATE_KEY = Symbol('WEBRTC_STATE');

export function initGlobalContexts() {
  setContext(SYSTEM_STATE_KEY, systemState);
  setContext(AUTH_STATE_KEY, authState);
  setContext(DIALOG_STATE_KEY, dialogState);
  setContext(USERS_STATE_KEY, usersState);
  setContext(WEBRTC_STATE_KEY, webrtcState);
}

export function getSystemState() { return getContext<typeof systemState>(SYSTEM_STATE_KEY); }
export function getAuthState() { return getContext<typeof authState>(AUTH_STATE_KEY); }
export function getDialogState() { return getContext<typeof dialogState>(DIALOG_STATE_KEY); }
export function getUsersState() { return getContext<typeof usersState>(USERS_STATE_KEY); }
export function getWebrtcState() { return getContext<typeof webrtcState>(WEBRTC_STATE_KEY); }

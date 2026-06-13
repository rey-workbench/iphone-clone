import { getContext, setContext } from 'svelte';
import { systemGlobalState } from './systemGlobalState.svelte';
import { authGlobalState } from './authGlobalState.svelte';
import { dialogGlobalState } from './dialogGlobalState.svelte';
import { usersGlobalState } from './usersGlobalState.svelte';
import { webrtcGlobalState } from './webrtcGlobalState.svelte';

export const SYSTEM_STATE_KEY = Symbol('SYSTEM_STATE');
export const AUTH_STATE_KEY = Symbol('AUTH_STATE');
export const DIALOG_STATE_KEY = Symbol('DIALOG_STATE');
export const USERS_STATE_KEY = Symbol('USERS_STATE');
export const WEBRTC_STATE_KEY = Symbol('WEBRTC_STATE');

export function initGlobalContexts() {
  setContext(SYSTEM_STATE_KEY, systemGlobalState);
  setContext(AUTH_STATE_KEY, authGlobalState);
  setContext(DIALOG_STATE_KEY, dialogGlobalState);
  setContext(USERS_STATE_KEY, usersGlobalState);
  setContext(WEBRTC_STATE_KEY, webrtcGlobalState);
}

export function getSystemState() { return getContext<typeof systemGlobalState>(SYSTEM_STATE_KEY); }
export function getAuthState() { return getContext<typeof authGlobalState>(AUTH_STATE_KEY); }
export function getDialogState() { return getContext<typeof dialogGlobalState>(DIALOG_STATE_KEY); }
export function getUsersState() { return getContext<typeof usersGlobalState>(USERS_STATE_KEY); }
export function getWebrtcState() { return getContext<typeof webrtcGlobalState>(WEBRTC_STATE_KEY); }

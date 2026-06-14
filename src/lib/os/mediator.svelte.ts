export type OSEventType = 
  | { type: 'TRIGGER_NOTIFICATION'; payload: { title: string; body: string } }
  | { type: 'MUSIC_PLAYING'; payload: { trackName: string; artist: string; isPlaying: boolean } }
  | { type: 'INCOMING_CALL'; payload: { callerName: string } }
  | { type: 'APP_LAUNCHED'; payload: { appName: string } }
  | { type: 'APP_SUSPENDED'; payload: { appName: string } };

class OSMediator {
  lastEvent = $state<OSEventType | null>(null);

  emit(event: OSEventType) {
    this.lastEvent = event;
  }
}

export const osMediator = new OSMediator();

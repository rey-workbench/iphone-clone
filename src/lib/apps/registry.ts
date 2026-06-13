import { App as AppStoreApp } from './AppStore';
import { App as CalculatorApp } from './Calculator';
import { App as CalendarApp } from './Calendar';
import { App as CameraApp } from './Camera';
import { App as ClockApp } from './Clock';
import { App as MailApp } from './Mail';
import { App as MessagesApp } from './Messages';
import { App as MusicApp } from './Music';
import { App as NetflixApp } from './Netflix';
import { App as NotesApp } from './Notes';
import { App as PhoneApp } from './Phone';
import { App as PhotosApp } from './Photos';
import { App as SafariApp } from './Safari';
import { App as SettingsApp } from './Settings';
import { App as WeatherApp } from './Weather';

export const appsRegistry: Record<string, any> = {
  appstore: AppStoreApp,
  calculator: CalculatorApp,
  calendar: CalendarApp,
  camera: CameraApp,
  clock: ClockApp,
  mail: MailApp,
  messages: MessagesApp,
  music: MusicApp,
  netflix: NetflixApp,
  notes: NotesApp,
  phone: PhoneApp,
  photos: PhotosApp,
  safari: SafariApp,
  settings: SettingsApp,
  weather: WeatherApp,
};

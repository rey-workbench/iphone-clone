import { App as AppStoreApp } from './system/AppStore';
import { App as CalculatorApp } from './user/Calculator';
import { App as CalendarApp } from './user/Calendar';
import { App as CameraApp } from './system/Camera';
import { App as ClockApp } from './user/Clock';
import { App as MailApp } from './user/Mail';
import { App as MessagesApp } from './system/Messages';
import { App as MusicApp } from './user/Music';
import { App as NetflixApp } from './user/Netflix';
import { App as NotesApp } from './user/Notes';
import { App as PhoneApp } from './system/Phone';
import { App as PhotosApp } from './system/Photos';
import { App as SafariApp } from './user/Safari';
import { App as SettingsApp } from './system/Settings';
import { App as WeatherApp } from './user/Weather';

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
	weather: WeatherApp
};

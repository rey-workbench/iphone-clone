export interface AppConfig {
  id: string;
  name: string;
  icon: string; // path to PNG in $lib/assets/icons/
  color: string;
  gradient?: string;
  customIconClass?: string;
  customContainerClass?: string;
}


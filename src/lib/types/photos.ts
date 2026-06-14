export interface IPhotoItem {
  id: string;
  url: string;
  thumbnail: string;
  date: Date | string;
  location?: string;
  type?: string;
  download_url?: string;
  author?: string;
}

import { Song } from './song';

export class Playlist {
    id: number;
    name: string;
    totalPlayTime: string;
    songsCount: number;
    image: string;
    songs?: Song[];
}
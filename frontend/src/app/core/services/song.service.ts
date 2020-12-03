import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, Subject } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Song } from '../../shared/classes/song';

@Injectable({
  providedIn: 'root'
})
export class SongService {
  currentSong = new Subject<Song>();

  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  setCurrentSong(song: Song): void {
    this.currentSong.next(song);
  }

  sendAudioFile(audioFile: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('audio', audioFile, audioFile.name);
    return this.http.post(`${this.apiUrl}/load-audio`, formData);
  }
}

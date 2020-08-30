import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class LsService {


  constructor(private api: ApiService) {
  }

  public async getFolderSizes(foldername: string) {
      return this.api.get(`/ls?path=${foldername}`);
  }

}

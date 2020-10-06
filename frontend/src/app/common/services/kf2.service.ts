import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class Kf2ApiService {


  constructor(private api: ApiService) {
  }

  public async getKf2Status() {
      return this.api.get("/kf2/status");
  }

  public async startGame(data: any) {
    return this.api.post("/kf2/change", data);
  }

}

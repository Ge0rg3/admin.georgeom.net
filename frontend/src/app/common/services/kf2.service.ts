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

  public async enable() {
    return this.api.get("/kf2/enable");
  }

  public async disable() {
    return this.api.get("/kf2/disable");
  }

  public async getWhitelist() {
    return this.api.get("/kf2/whitelist");
  }

  public async addIpToWhitelist(ip) {
    return this.api.post("/kf2/whitelist/add", {
      "ip": ip
    });
  }

  public async removeIpFromWhitelist(ip) {
    return this.api.post("/kf2/whitelist/remove", {
      "ip": ip
    });
  }

}

import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class StatusService {


  constructor(private api: ApiService) {
  }

  public async getStatuses() {
      return this.api.get(`/status`);
  }

  public async startService(serviceId) {
    return this.api.get(`/status/start/${serviceId}`);
  }

  public async stopService(serviceId) {
    return this.api.get(`/status/stop/${serviceId}`);
  }

  public async restartService(serviceId) {
    return this.api.get(`/status/restart/${serviceId}`);
  }

}

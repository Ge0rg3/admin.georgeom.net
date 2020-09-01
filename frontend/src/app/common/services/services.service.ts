import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {


  constructor(private api: ApiService) {
  }

  public async getCommonServices() {
      return this.api.get("/services/common");
  }

  public async startCommonService(serviceId) {
    return this.api.get(`/services/common/start/${serviceId}`);
  }

  public async stopCommonService(serviceId) {
    return this.api.get(`/services/common/stop/${serviceId}`);
  }

  public async restartCommonService(serviceId) {
    return this.api.get(`/services/common/restart/${serviceId}`);
  }
  
  public async getSystemServices() {
    return this.api.get("/services/system");
  }
  
  public async startSystemService(serviceName) {
    return this.api.get(`/services/system/start/${serviceName}`);
  }

  public async stopSystemService(serviceName) {
    return this.api.get(`/services/system/stop/${serviceName}`);
  }

  public async restartSystemService(serviceName) {
    return this.api.get(`/services/system/restart/${serviceName}`);
  }

}

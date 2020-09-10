import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class TopService {


  constructor(private api: ApiService) {
  }

  public async getProcesses() {
      return this.api.get("/top");
  }

  public async killProcess(id) {
    return this.api.get(`/top/kill/${id}`)
  }

}

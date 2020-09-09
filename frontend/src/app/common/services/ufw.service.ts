import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UfwService {


  constructor(private api: ApiService) {
  }

  public async getCurrentRules() {
      return this.api.get("/ufw/rules");
  }

  public async addPortRule(data: any) {
      return this.api.post("/ufw/add", data);
  }

  public async deleteRule(id: number) {
      return this.api.get(`/ufw/delete/${id}`);
  }

  public async enable() {
      return this.api.get("/ufw/enable");
  }

  public async disable() {
      return this.api.get("/ufw/disable");
  }

}

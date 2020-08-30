import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SarService {


  constructor(private api: ApiService) {
  }

  public async getCpuHistory() {
      return this.api.get("/sar");
  }

}

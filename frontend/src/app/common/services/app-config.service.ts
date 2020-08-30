import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  API_URL: String = environment.api;

  constructor() { }
}

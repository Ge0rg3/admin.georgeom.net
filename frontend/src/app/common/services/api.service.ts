import { Injectable } from '@angular/core';
import { AppConfigService } from './app-config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  apiUrl: String;

  constructor(
      private http: HttpClient,
      private config: AppConfigService,
      private router: Router
      ) {
    this.apiUrl = config.API_URL;
  }

  public getTokenHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      "Token": localStorage.getItem("token") || ""
    });
    return headers;
  }

  // Get from api. Enter an endpoint, and an optional responsetype (i.e. "text")
  public async get(endpoint: string, response='json'): Promise<any> {
    const options: any = {
      responseType: response,
      headers: this.getTokenHeaders()
    }
    return this.http.get<any>(
      this.apiUrl + endpoint,
      options
    ).toPromise().then((result: any) => {
      return result;
    }).catch(err => {
      // If 401, logout
      if (err.status == 401) {
        localStorage.clear();
        this.router.navigate(["login"]);
      }
      return err.error;
    });
  }

  // Post any data. Enter an endpoint, data, and expected response type.
  public async post(endpoint: string, data: any, response='json'): Promise<any> {
    const options: any = {
      responseType: response,
      headers: this.getTokenHeaders()
    }
    return this.http.post<any>(
      this.apiUrl + endpoint,
      data,
      options
    ).toPromise().then((result: any) => {
      return result;
    }).catch(err => {
      // If 401, logout
      if (err.status == 401) {
        localStorage.clear();
        this.router.navigate(["login"]);
      }
      return err.error;
    });
  }

}

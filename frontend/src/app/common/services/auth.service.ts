import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authenticated: boolean = false;

  constructor(
    private cookieService: CookieService,
    private api: ApiService
    ) { }

  // Checks if authenticated
  public async check(): Promise<boolean> {
    // If we don't have a cookie, we aren't authenticated
    let cookie = this.cookieService.get("token") || "";
    if (cookie.length == 0) {
      this.authenticated = false;
      return new Promise((res) => res(false))
    }
    // Send test request
    return this.api.get("").then((result) => {
      let authenticated = result.status == 200;
      this.authenticated = authenticated;
      return authenticated;
    })
  }

  // Attempts a login and returns true/false if login is successful
  public async login(password: string): Promise<boolean> {
    return this.api.post("/login", {
      "password": password
    }).then((result) => {
      if (result.status !== 200) {
        this.authenticated = false;
        this.cookieService.remove("token");
        return false;
      } else {
        this.authenticated = true;
        this.cookieService.put("token", result.token);
        return true;
      }
    });
  }

  public isAuthenticated(): boolean {
    return this.authenticated;
  }

}

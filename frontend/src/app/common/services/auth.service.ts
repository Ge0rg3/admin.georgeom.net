import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authenticated: boolean = false;

  constructor(
    private api: ApiService
    ) { }

  // Checks if authenticated
  public async check(): Promise<boolean> {
    // If we don't have a cookie, we aren't authenticated
    let cookie = localStorage.getItem("token") || "";
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
  public async login(accesskey: string): Promise<boolean> {
    return this.api.post("/login", {
      "accesskey": accesskey
    }).then((result) => {
      if (result.status !== 200) {
        this.authenticated = false;
        localStorage.clear();
        return false;
      } else {
        this.authenticated = true;
        localStorage.setItem("token", result.token);
        localStorage.setItem("permission", result.permission);
        localStorage.setItem("paths", JSON.stringify(result.paths));
        return true;
      }
    });
  }

  public isAuthenticated(): boolean {
    return this.authenticated;
  }

}

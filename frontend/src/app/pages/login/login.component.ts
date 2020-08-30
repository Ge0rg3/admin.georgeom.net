import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/common/services/auth.service';
import { Router } from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss'] 
})
export class LoginComponent implements OnInit {

  public passwordInput: string = "";
  public invalidPassword: boolean = false;

  constructor(
      private router: Router,
      private authService: AuthService
      ) { }

  ngOnInit(): void {
    this.authService.check();
  }

  public login(): boolean {
    this.authService.login(this.passwordInput).then((success) => {
      if (success) {
        this.router.navigate(['home']);
      }
      else {
        this.invalidPassword = true;
      }
    })
    return false; // To prevent button from reloading page
  }

}

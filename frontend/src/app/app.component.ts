import { Component } from '@angular/core';
import { AuthService } from './common/services/auth.service';

@Component({
  selector: 'app-root',
  template: `
  <div id="sidebar_container" *ngIf="auth.isAuthenticated()">
    <sidebar></sidebar>
  </div>
  <div id="page-holder">
    <router-outlet></router-outlet>
  </div>
  `,
  styles: []
})
export class AppComponent {

  constructor (public auth: AuthService) {}

  title = 'Admin Portal';
}

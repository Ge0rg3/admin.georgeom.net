import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './common/services/auth.service';

@Component({
  selector: 'app-root',
  template: `
  <div id="sidebar-container" *ngIf="displaySidebar">
    <sidebar></sidebar>
  </div>
  <div id="page-holder">
    <router-outlet></router-outlet>
  </div>
  `,
  styles: []
})
export class AppComponent {

  public displaySidebar: boolean;
  public title: string = 'Admin Portal';

  constructor (private router: Router) {
    // Check if sidebar should be displayed by looking at current url
    router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        let url = evt.url;
          this.displaySidebar = url !== "/login";
      }
    })
  }

}

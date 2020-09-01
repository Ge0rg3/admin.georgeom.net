import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <sidebar></sidebar>
  <div id="page-holder">
    <router-outlet></router-outlet>
  </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'Admin Portal';
}

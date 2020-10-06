import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { RoutesArray } from './common/classes/routes';

let routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent}
];

// Auto-fill from routes.ts
for (let route of RoutesArray) {
  routes.push({
    "path": route.link.replace("/", ""),
    "component": route.component
  });
}

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

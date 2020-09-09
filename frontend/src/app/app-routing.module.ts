import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DiskspaceComponent } from './pages/diskspace/diskspace.component';
import { ServicesComponent } from './pages/services/services.component';
import { LoginComponent } from './pages/login/login.component';
import { ProcessesComponent } from './pages/processes/processes.component';
import { FirewallComponent } from './pages/firewall/firewall.component';

const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'home', component: HomeComponent},
  {path: 'diskspace', component: DiskspaceComponent},
  {path: 'services', component: ServicesComponent},
  {path: 'processes', component: ProcessesComponent},
  {path: 'firewall', component: FirewallComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DiskspaceComponent } from './pages/diskspace/diskspace.component';
import { StatusComponent } from './pages/status/status.component';
import { LoginComponent } from './pages/login/login.component';
import { ProcessesComponent } from './pages/processes/processes.component';

const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'home', component: HomeComponent},
  {path: 'diskspace', component: DiskspaceComponent},
  {path: 'status', component: StatusComponent},
  {path: 'processes', component: ProcessesComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

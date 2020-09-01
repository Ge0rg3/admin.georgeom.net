// Angular components
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
// External Imports
import { ChartsModule } from 'ng2-charts';
import { CookieModule } from 'ngx-cookie';
// Custom components
import { SidebarComponent } from './common/components/sidebar/sidebar.component';
import { HomeComponent } from './pages/home/home.component';
import { DiskspaceChartComponent } from './common/components/diskspace/diskspace-chart.component';
import { DiskspaceComponent } from './pages/diskspace/diskspace.component';
import { ServicesComponent } from './pages/services/services.component';
import { ServiceRows } from './common/components/service-rows/service-rows.component';
import { LoginComponent } from './pages/login/login.component';
import { ProcessChartComponent } from './common/components/process-chart/process-chart.component';
import { ProcessesComponent } from './pages/processes/processes.component';
import { CpuUsageChartComponent } from './common/components/cpu-usage-chart/cpu-usage-chart.component';
// Custom directives
import { ProtectedDirective } from './common/directives/protected.directive';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    HomeComponent,
    DiskspaceChartComponent,
    DiskspaceComponent,
    ServicesComponent,
    ServiceRows,
    LoginComponent,
    ProtectedDirective,
    ProcessChartComponent,
    ProcessesComponent,
    CpuUsageChartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ChartsModule,
    FormsModule,
    CookieModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

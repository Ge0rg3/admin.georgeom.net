// Angular imports
import { Component, OnInit } from '@angular/core';
// Chartjs imports
import { ChartType, ChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';
// Custom imports
import { UtilsService } from '../../common/services/utils.service';
import { TopService } from 'src/app/common/services/top.service';
import { ServicesService } from 'src/app/common/services/services.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent implements OnInit {

  public processes: any[] = [];
  public services: any[] = [];

  constructor(
    private utils: UtilsService,
    private topService: TopService,
    private servicesApi: ServicesService
  ) { }

  ngOnInit(): void {
    // Get processes for graph
    this.topService.getProcesses().then((response) => {
      if (response.status == 200) {
        this.processes = response.results;
      }
    });
    // Get services for list
    this.servicesApi.getCommonServices().then((response) => {
      if (response.status == 200) {
        this.services = response.results;
      }
    })
  }

}

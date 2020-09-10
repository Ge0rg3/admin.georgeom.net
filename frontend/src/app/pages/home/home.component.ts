// Angular imports
import { Component, OnInit } from '@angular/core';
// Chartjs imports
import { ChartType, ChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';
// Custom imports
import { UtilsService } from '../../common/services/utils.service';
import { TopService } from 'src/app/common/services/top.service';
import { ServicesService } from 'src/app/common/services/services.service';
import { LsService } from 'src/app/common/services/ls.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent implements OnInit {

  public processes: any[];

  public services: any[];
  public servicesLoading: boolean = false;

  public diskspaceFiles: any[];
  public diskspacePath: string = "/home/";

  constructor(
    private utils: UtilsService,
    private topService: TopService,
    private servicesApi: ServicesService,
    private lsApi: LsService
  ) { }

  ngOnInit(): void {
    // Get processes for graph
    this.topService.getProcesses().then((response) => {
      if (response.status == 200) {
        this.processes = response.results;
      }
    });
    // Get services for list
    this.servicesLoading = true;
    this.servicesApi.getCommonServices().then((response) => {
      this.servicesLoading = false;
      if (response.status == 200) {
        this.services = response.results;
      }
    });
    // Get files for diskspace
    this.getDiskspace(this.diskspacePath);
  }
  

  // Separate function for getting diskspace so that it can be interactive in home menu
  public getDiskspace(path) {
    this.lsApi.getFolderSizes(path).then((response) => {
      if (response.status == 200) {
        this.diskspacePath = path;
        this.diskspaceFiles = response.results;
      }
    })
    
  }

}

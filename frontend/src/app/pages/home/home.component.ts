// Angular imports
import { Component, OnInit } from '@angular/core';
// Chartjs imports
import { ChartType, ChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';
// Custom imports
import { UtilsService } from '../../common/services/utils.service';
import { TopService } from 'src/app/common/services/top.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent implements OnInit {

  public processes: any[] = [];

  constructor(
    private utils: UtilsService,
    private topService: TopService
  ) { }

  ngOnInit(): void {
    // Get processes for graph
    this.topService.getProcesses().then((response) => {
      if (response.status == 200) {
        this.processes = response.results;
      }
    })
  }

}

import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import { SarService } from '../../services/sar.service';

@Component({
  selector: 'cpu-usage-chart',
  templateUrl: 'cpu-chart-usage.component.html',
  styles: [
  ]
})
export class CpuUsageChartComponent implements OnInit {
  public lineChartData: ChartDataSets[] = [
    { data: [], label: 'User' },
    { data: [], label: 'System' }
  ];
  public lineChartLabels: Label[] = [];
  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [{}],
      yAxes: [
        {
          id: 'y-axis',
          position: 'left',
          gridLines: {
            color: 'rgba(190,42,92,0.3)',
          },
          ticks: {
            fontColor: 'rgba(190,42,92,1)',
          }
        }
      ]
    }
  };
  public lineChartColors: Color[] = [
    { // pinkish
      backgroundColor: 'rgba(167,76,107,0.3)',
      borderColor: 'rgba(190,42,92,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    }
  ];
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';

  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

  constructor(private sarApi: SarService) { }

  ngOnInit() {
    this.sarApi.getCpuHistory().then((response) => {
      // Exit on failure
      if (response.status != 200)
        return;
      // Emit response
      // Parse response for graph
      let system_usage = [];
      let user_usage = [];
      let times = [];
      for (let result of response.results) {
        times.push(result["timestamp"]);
        system_usage.push(result["cpu-usage"]["system"]);
        user_usage.push(result["cpu-usage"]["user"]);
      }
      this.lineChartLabels = times;
      this.lineChartData[0].data = user_usage;
      this.lineChartData[1].data = system_usage;
      
    })
  }

  public randomize(): void {
    for (let i = 0; i < this.lineChartData.length; i++) {
      for (let j = 0; j < this.lineChartData[i].data.length; j++) {
        this.lineChartData[i].data[j] = this.generateNumber(i);
      }
    }
    this.chart.update();
  }

  private generateNumber(i: number) {
    return Math.floor((Math.random() * (i < 2 ? 100 : 1000)) + 1);
  }

  /*
    Events
    Stubs for if I want this graph to be interactive
  */
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {}
  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {}

}

import { Component, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
// Chartjs imports
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
// Custom imports
import { TopService } from '../../services/top.service';

@Component({
  selector: 'process-chart',
  templateUrl: 'process-chart.component.html',
  styles: [
  ]
})
export class ProcessChartComponent {
  @Input() processes: any[] = [];
  @Output() processClick = new EventEmitter<any>();
  public filteredProcesses: any[] = [];

  // Chart settings
  public barChartOptions: ChartOptions = {
    onHover: function (event, item) {
      event["target"]["style"]["cursor"] = item[0] ? 'pointer' : 'default';
    },
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };
  public barChartLabels: Label[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = false;

  public barChartData: ChartDataSets[] = [
    { data: [], label: 'Memory' }
  ];

  constructor(private topService: TopService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.processes) {
      this.processes = changes.processes.currentValue;
      this.updateChart();
    }
  }

  public updateChart(): void {
    // Update chart data
    this.filteredProcesses = this.processes.filter((res: { memory: number; }) => res.memory != 0);
    this.barChartLabels = this.filteredProcesses.map((res: { command: any; }) => res.command);
    this.barChartData[0].data = this.filteredProcesses.map((res: { memory: any; }) => res.memory);
  }

  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    if (active[0]) {
      let columnIndex: number = active[0]["_index"];
      this.processClick.emit(this.filteredProcesses[columnIndex]);
    }
  }

}
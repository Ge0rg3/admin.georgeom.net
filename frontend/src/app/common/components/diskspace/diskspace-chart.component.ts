import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
// Chartjs imports
import { ChartType, ChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';
// Custom imports
import { UtilsService } from '../../services/utils.service';
import { LsService } from '../../services/ls.service';

@Component({
  selector: 'diskspace-chart',
  templateUrl: 'diskspace-chart.component.html',
  styles: [
  ]
})
export class DiskspaceChartComponent implements OnInit {
  @Input() path: string = "/";
  @Output() path_update = new EventEmitter<string>();
  @Output() file_update = new EventEmitter<string>();
  @Output() files = new EventEmitter<any>();
  public filesArr: any[] = [];
  
  public pieChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      position: 'left',
    },
    plugins: {
      datalabels: {
        formatter: (value, ctx) => {
          const label = ctx.chart.data.labels[ctx.dataIndex];
          return label;
        },
      },
    }
  };
  public pieChartLabels: Label[] = [];
  public pieChartData: number[] = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartColors = [];

  constructor(
    private lsApi: LsService,
    private utils: UtilsService
  ) { }
  
  ngOnInit() {
    let self = this;
    this.pieChartOptions.onHover = function(event, item) {
      // Explicitly set here so we get non-pie chart hovers too
      self.chartHovered(event, item);
    }
  }

  // Listen for filepath changes
  ngOnChanges(changes: SimpleChanges) {
    if (changes.path) {
      // Set new path
      this.path = changes.path.currentValue;
      this.updateFolder(this.path).then((success) => {
        if (!success) {
          this.path_update.emit(changes.path.previousValue);
        }
      });
    }
  }
  
  // Update the folder, and return success boolean
  public async updateFolder(path: string): Promise<boolean> {
    return this.lsApi.getFolderSizes(path).then((response) => {
      if (response.status == 200) {
        // Provide files to parent
        this.filesArr = response.results;
        this.files.emit(response.results);
        // Put data into pie chart
        let labels = [];
        let data = [];
        let colors = [];
        for (let result of response.results) {
          data.push(result.filesize);
          labels.push(result.entry);
          colors.push(this.utils.randomRgb(result.entry));
        }
        this.pieChartColors = [{backgroundColor: colors}]
        if (labels.length > 50) {
          // Don't show labels if there are too many
          this.pieChartLegend = false;
        }
        else {
          this.pieChartLegend = true;
        }
        this.pieChartLabels = labels;
        this.pieChartData = data;
      }
      return response.status == 200;
    });
  }

  // Events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    // Get new item name
    let clickPath = active[0]['_model'].label;
    // Check its a valid item
    let valid = this.filesArr.filter(file => file.entry == clickPath);
    if (valid.length == 0) {
      return;
    }
    if (!["directory", "link"].includes(valid[0]["entry_type"])) {
      return;
    }
    // Update and emit path
    let newPath = this.path + clickPath + "/";
    this.updateFolder(newPath).then((success) => {
      if (success) {
        this.path = newPath;
        this.path_update.emit(newPath);
      }
    })
  }

  public chartHovered(event: MouseEvent, item: {}[]): void {
    let mouse = "default";
    if (item[0]) {
      let hoverPath = item[0]['_model'].label;
      this.file_update.emit(hoverPath);
      mouse = "pointer";
    }
    event["target"]["style"]["cursor"] = mouse;
  }

}

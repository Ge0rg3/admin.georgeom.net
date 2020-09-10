import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
// Chartjs imports
import { ChartType, ChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';
// Custom imports
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'diskspace-chart',
  templateUrl: 'diskspace-chart.component.html',
  styleUrls: ['diskspace-chart.component.scss']
})
export class DiskspaceChartComponent implements OnInit {
  @Output() path_update = new EventEmitter<string>(); // Change path (on folder click)
  @Output() file_update = new EventEmitter<string>(); // Change file preview (on hover)
  @Input() path: string = "/"; // Path input from parent
  @Input() files: any[]; // Files from parent
  
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

  constructor(private utils: UtilsService) { }
  
  ngOnInit() {
    let self = this;
    this.pieChartOptions.onHover = function(event, item) {
      // Explicitly set here so we get non-pie chart hovers too
      self.chartHovered(event, item);
    }
  }

  // Listen for filepath changes
  ngOnChanges(changes: SimpleChanges) {
    if (changes.files) {
      // Set new path
      this.files = changes.files.currentValue;
      if (this.files !== undefined) {
        this.updateFolder(this.files);
      }
    }
  }
  
  // Update the folder items
  public updateFolder(filesArr: any[]) {
    // Put data into pie chart
    let labels = [];
    let data = [];
    let colors = [];
    for (let result of filesArr) {
      data.push(result.filesize);
      labels.push(result.entry);
      colors.push(this.utils.randomRgb(result.entry));
    }
    this.pieChartColors = [{backgroundColor: colors}]
    if (labels.length > 25 || window.innerWidth < 576) {
      // Don't show labels if there are too many, or if on mobile
      this.pieChartLegend = false;
    }
    else {
      this.pieChartLegend = true;
    }
    this.pieChartLabels = labels;
    this.pieChartData = data;

  }

  // Events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    // Get new item name
    let clickPath = active[0]['_model'].label;
    // Check its a valid item
    let valid = this.files.filter(file => file.entry == clickPath);
    if (valid.length == 0) {
      return;
    }
    if (!["directory", "link"].includes(valid[0]["entry_type"])) {
      return;
    }
    // Update and emit path
    let newPath = this.path + clickPath + "/";
    this.path_update.emit(newPath);
  }

  public chartHovered(event: MouseEvent, item: {}[]): void {
    let mouse = "default";
    if (item[0]) {
      let hoverPath = item[0]['_model'].label;
      // Only show pointer if on folder
      let file_object = this.files.filter((f) => f.entry === hoverPath)[0];
      if (file_object.entry_type === "directory" || file_object.entry_type === "link") {
        mouse = "pointer";
      }
      // Send hovered path
      this.file_update.emit(file_object);
    }
    event["target"]["style"]["cursor"] = mouse;
  }

}

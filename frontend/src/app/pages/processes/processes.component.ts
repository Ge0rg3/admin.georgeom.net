import { Component, OnInit, ViewChild } from '@angular/core';
import { TopService } from 'src/app/common/services/top.service';
import { interval } from 'rxjs';

@Component({
  selector: 'app-processes',
  templateUrl: 'processes.component.html',
  styleUrls: ['processes.component.scss']
})
export class ProcessesComponent implements OnInit {

  @ViewChild("killModalTrigger") killModalTrigger;
  @ViewChild("killModalClose") killModalClose;
  public processes: any[] = [];
  public selectedProcess: any;
  public timer: any;
  public api_statuses: any = {
    "get": {
      "loading": false
    },
    "kill": {
      "loading": false,
      "complete": false,
      "error": ""
    }
  }
  public loading: boolean = false;

  constructor(private topService: TopService) { }

  ngOnInit(): void {
    // Show loading icon on first data retrieval
    this.api_statuses.get.loading = true;
    this.updateProcesses().then(() => {
      this.api_statuses.get.loading = false;
    });
    // Refresh every 10 secs
    this.timer = interval(10000).subscribe((n) => {
      this.updateProcesses();
    })
  }
  
  // Get and set latest processes from api
  public async updateProcesses() {
    return this.topService.getProcesses().then((response) => {
      if (response.status == 200) {
        this.processes = response.results;
      }
    });
  }

  // Selects a process from the above boxes
  public openProcess(process: any): void {
    this.selectedProcess = process;
  }

  // Open confirm kill process modal
  public openKillModal(): void {
    // Refresh loading/error messages
    this.api_statuses.kill.loading = false;
    this.api_statuses.kill.complete = false;
    this.api_statuses.kill.error = "";
    // Open popup
    this.killModalTrigger.nativeElement.click();
  }

  // Kill a process
  public killProcess(id): void {
    // Set loading message
    this.api_statuses.kill.loading = true;
    // Make API request
    this.topService.killProcess(id).then((result) => {
      // Stop loading message
      this.api_statuses.kill.loading = false;
      if (result.status === 200) {
        // Close the popup and refresh processes
        this.api_statuses.kill.complete = true;
        this.updateProcesses();
        this.killModalClose.nativeElement.click();
        this.selectedProcess = undefined;
      } else {
        // Display error
        this.api_statuses.kill.error = result.error;
      }
    })
  }

}

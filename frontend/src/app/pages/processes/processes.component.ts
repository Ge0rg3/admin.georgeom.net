import { Component, OnInit } from '@angular/core';
import { TopService } from 'src/app/common/services/top.service';
import { interval } from 'rxjs';

@Component({
  selector: 'app-processes',
  templateUrl: 'processes.component.html',
  styleUrls: ['processes.component.scss']
})
export class ProcessesComponent implements OnInit {

  public processes: any[] = [];
  public selectedProcess: any;
  public timer: any;

  constructor(private topService: TopService) { }

  ngOnInit(): void {
    this.updateProcesses();
    // Refresh every 10 secs
    this.timer = interval(10000).subscribe((n) => {
      this.updateProcesses();
    })
  }
  
  // Get and set latest processes from api
  public updateProcesses() {
    this.topService.getProcesses().then((response) => {
      if (response.status == 200) {
        this.processes = response.results;
      }
    });
  }

  // Selects a process from the above boxes
  public openProcess(process: any) {
    this.selectedProcess = process;
  }

}

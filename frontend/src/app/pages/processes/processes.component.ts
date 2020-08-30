import { Component, OnInit } from '@angular/core';
import { TopService } from 'src/app/common/services/top.service';

@Component({
  selector: 'app-processes',
  templateUrl: 'processes.component.html',
  styleUrls: ['processes.component.scss']
})
export class ProcessesComponent implements OnInit {

  public processes: any[] = [];
  public selectedProcess: any;

  constructor(private topService: TopService) { }

  ngOnInit(): void {
    this.topService.getProcesses().then((response) => {
      if (response.status == 200) {
        this.processes = response.results;
      }
    })
  }

  // Selects a process from the above boxes
  public openProcess(process: any) {
    this.selectedProcess = process;
  }

}

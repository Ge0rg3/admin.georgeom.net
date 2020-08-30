import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { StatusService } from '../../services/status.service';

@Component({
  selector: 'status-rows',
  templateUrl: 'status-rows.component.html',
  styles: [
  ]
})
export class StatusRows implements OnInit {
  @Input() minimal: boolean = true;
  @ViewChild("modalTrigger") modalTrigger;
  public modalDetails: any = {};

  public statuses: any[];

  constructor(private statusApi: StatusService) { }

  ngOnInit(): void {
    this.updateStatuses();
  }

  public async updateStatuses(): Promise<void> {
    this.statusApi.getStatuses().then(result => {
      if (result.status == 200) {
        this.statuses = result.results;
      }
    })
  }

  public changeService(changeType, service): void {
    // Exit of not restartable service
    if (!service.can_restart && changeType == "restart")
      return;
    // Get correct API call for change
    let apiCall;
    if (changeType == "restart")
      apiCall = "restartService";
    else if (changeType == "start")
      apiCall = "startService";
    else
      apiCall = "stopService";
    // Trigger call
    this.statusApi[apiCall](service.id).then((response) => {
      this.modalDetails.response_code = response.status;
      this.modalDetails.action = changeType;
      this.modalDetails.service = service.name;
      this.modalTrigger.nativeElement.click();
    })
  }

}

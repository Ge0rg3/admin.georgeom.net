import { Component, OnInit, Input, ViewChild, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ServicesService } from '../../services/services.service';

@Component({
  selector: 'service-rows',
  templateUrl: 'service-rows.component.html',
  styleUrls: ['service-rows.component.scss']
})
export class ServiceRows {
  @Input() services: any[];
  @Input() minimal: boolean = true;
  @Output() serviceChangeRequest = new EventEmitter<any>();
  @Output() serviceChangeResponse = new EventEmitter<any>();
  public modalDetails: any = {};

  constructor(private servicesApi: ServicesService) { }

  ngOnChanges(changes: SimpleChanges) {
    // Update services on call
    if (changes.services) {
      this.services = changes.services.currentValue;
    }
  }
  public changeService(changeType, service): void {
    // Exit if forbidden by API
    if ((changeType === "start" && !service.startable) ||
      (changeType === "stop" && !service.stoppable) ||
      (changeType === "restart" && !service.restartable)
    ) return;
    // Get correct API call for change
    let serviceType = service.type == "common" ? "Common" : "System";
    let apiCall = changeType + serviceType + "Service";
    // Trigger call
    this.serviceChangeRequest.emit({
      "action": changeType,
      "service": service.name,
      "loading": true
    })
    this.servicesApi[apiCall](service.id).then((response) => {
      this.serviceChangeResponse.emit({
        "response_code": response.status,
        "action": changeType,
        "service": service.name,
        "loading": false
      });
    })
  }

}

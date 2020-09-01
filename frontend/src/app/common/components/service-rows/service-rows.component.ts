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
  @Output() serviceChanged = new EventEmitter<any>();
  public modalDetails: any = {};

  constructor(private servicesApi: ServicesService) { }

  ngOnChanges(changes: SimpleChanges) {
    // Update services on call
    if (changes.services) {
      this.services = changes.services.currentValue;
    }
  }
  public changeService(changeType, service): void {
    // Exit of not restartable service
    if (!service.can_restart && changeType == "restart")
      return;
    // Get correct API call for change
    let serviceType = service.type == "common" ? "Common" : "System";
    let apiCall = changeType + serviceType + "Service";
    // Trigger call
    this.servicesApi[apiCall](service.id).then((response) => {
      this.serviceChanged.emit({
        "response_code": response.status,
        "action": changeType,
        "service": service.name
      });
    })
  }

}

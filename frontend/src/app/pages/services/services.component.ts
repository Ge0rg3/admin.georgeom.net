import { Component, OnInit, ViewChild } from '@angular/core';
import { ServicesService } from 'src/app/common/services/services.service';
import { interval } from 'rxjs';

@Component({
  selector: 'services-compnent',
  templateUrl: 'services.component.html',
  styleUrls: ['services.component.scss']
})
export class ServicesComponent implements OnInit {

  @ViewChild("modalTrigger") modalTrigger;
  public commonServices: any[];
  public systemServices: any[];
  public modalDetails: any = {
    "action": "",
    "response_code": "null",
    "service": ""
  };
  // Timer for polling services from API
  public timer: any;

  constructor(private servicesApi: ServicesService) { }

  ngOnInit(): void {
    this.updateServices();
    // Get new services every 10 seconds
    this.timer = interval(10000).subscribe((n) => {
      this.updateServices();
    });
  }

  // End API calls when leaving task page
  ngOnDestroy(): void {
    this.timer.unsubscribe();
  }
  
  public updateServices(): void {
    // Get common Services
    this.servicesApi.getCommonServices().then((result) => {
      if (result.status == 200) {
        this.commonServices = result.results;
      }
    });
    // Get system services
    this.servicesApi.getSystemServices().then((result) => {
      if (result.status == 200) {
        this.systemServices = result.results;
      }
    });
  }

  // Set modal details and open modal
  public catchServiceChangeRequest(details: any): void {
    this.modalDetails = details;
    this.modalTrigger.nativeElement.click();
  }

  // Set response status details for modal
  public catchServiceChangeResponse(details: any): void {
    this.modalDetails = details;
    this.updateServices();
  }

}

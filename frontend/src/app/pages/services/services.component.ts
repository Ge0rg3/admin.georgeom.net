import { Component, OnInit, ViewChild } from '@angular/core';
import { ServicesService } from 'src/app/common/services/services.service';

@Component({
  selector: 'services-compnent',
  templateUrl: 'services.component.html',
  styleUrls: ['services.component.scss']
})
export class ServicesComponent implements OnInit {

  @ViewChild("modalTrigger") modalTrigger;
  public commonServices: any[] = [];
  public systemServices: any[] = [];
  public modalDetails: any = {
    "action": "",
    "response_code": "null",
    "service": ""
  };

  constructor(private servicesApi: ServicesService) { }

  ngOnInit(): void {
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
  public catchServiceChange(details: any): void {
    this.modalDetails = details;
    this.modalTrigger.nativeElement.click();
  }

}

import { Component, OnInit } from '@angular/core';
import { ServicesService } from 'src/app/common/services/services.service';

@Component({
  selector: 'services-compnent',
  templateUrl: 'services.component.html',
  styleUrls: ['services.component.scss']
})
export class ServicesComponent implements OnInit {

  public commonServices: any[] = [];
  public systemServices: any[] = [];

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



}

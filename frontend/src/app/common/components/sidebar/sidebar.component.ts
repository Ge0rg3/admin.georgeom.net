import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from '../../services/auth.service';
import { RoutesArray } from '../../classes/routes';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public sidebarItems: any = [];
  public permission: string;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    let items = RoutesArray;
    this.sidebarItems = items;
    this.permission = localStorage.getItem("permission");
  }

  // Navigates to another page
  public navigate(path: string): void {
    if (this.authService.isAuthenticated() || path == "/login") {
      this.router.navigateByUrl(path);
    }
  }

  // Remove user session token
  public logout(): void {
    localStorage.clear();
    this.authService.check().then((res) => {
      this.navigate("/login");
    });
  }

  // Checks if a user has permission to access a page
  public isPermitted(item: any): boolean {
    let permitted = false;
    let permittedPaths = JSON.parse(localStorage.getItem("paths"));
    for (let path of permittedPaths) {
      if (item.baseapipath.startsWith(path)) {
        permitted = true;
        break;
      }
    }
    return permitted;
  }

}

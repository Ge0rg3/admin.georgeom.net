import { Directive, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Location } from '@angular/common';
import { Router } from "@angular/router";

@Directive({
    selector: '[protected]'
})
export class ProtectedDirective implements OnDestroy {

    private sub: any = null;

    constructor(private authService: AuthService, private router: Router, private location: Location) {
        // If not logged in...
        if (!authService.isAuthenticated()) {
            // Call API to check if still not logged in at network layer
            this.authService.check().then(result => {
                if (!result) {
                    this.location.replaceState('/');
                    this.router.navigate(['login']);
                }
            })
        }
    }

    ngOnDestroy() {
        if (this.sub != null) {
            this.sub.unsubscribe();
        }
    }
}
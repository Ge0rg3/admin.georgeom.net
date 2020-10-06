import { DiskspaceComponent } from '../../pages/diskspace/diskspace.component';
import { ServicesComponent } from '../../pages/services/services.component';
import { LoginComponent } from '../../pages/login/login.component';
import { ProcessesComponent } from '../../pages/processes/processes.component';
import { FirewallComponent } from '../../pages/firewall/firewall.component';

export const RoutesArray = [
    {
        "title": "Login",
        "icon": "",
        "link": "/login",
        "baseapipath": "",
        "component": LoginComponent

    },
    {
        "title": "Diskspace",
        "icon": "storage",
        "link": "/diskspace",
        "baseapipath": "/",
        "component": DiskspaceComponent
    },
    {
        "title": "Services",
        "icon": "thumbs_up_down",
        "link": "/services",
        "baseapipath": "/",
        "component": ServicesComponent
    },
    {
        "title": "Processes",
        "icon": "insights",
        "link": "/processes",
        "baseapipath": "/",
        "component": ProcessesComponent
    },
    {
        "title": "Firewall",
        "icon": "security",
        "link": "/firewall",
        "baseapipath": "/",
        "component": FirewallComponent
    },
    {
        "title": "KF2 Server",
        "icon": "whatshot",
        "link": "/kf2",
        "baseapipath": "/api/kf2",
        "component": DiskspaceComponent
    },
    {
        "title": "MC Server",
        "icon": "public",
        "link": "/mc",
        "baseapipath": "/api/mc",
        "component": DiskspaceComponent
    }
];

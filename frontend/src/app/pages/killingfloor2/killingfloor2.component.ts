import { Component, OnInit, ViewChild } from '@angular/core';
import { Kf2ApiService } from 'src/app/common/services/kf2.service';
import { interval } from 'rxjs';

@Component({
  selector: 'app-killingfloor2',
  templateUrl: 'killingfloor2.component.html',
  styleUrls: ['killingfloor2.component.scss']
})
export class KillingFloor2Component implements OnInit {

  // Modal
  @ViewChild("modalTrigger") modalTrigger;
  @ViewChild("closeModal") closeModal;
  @ViewChild("addIpModalTrigger") addIpModalTrigger;
  @ViewChild("addIpCloseModal") addIpCloseModal;
  public modalLoading: boolean = false;
  public modalError: string = "";
  public modalMessage: string = "";
  public ipInput: string = "";

  // Display trash icons when hovering over whitelist IPs
  public displayTrash: any = {};

  // Only show "Add me" whitelist button if user ip not in list
  public ipExists: boolean = false;

  // Current kf2 server status
  public enabled: boolean = false;

  // Permissions
  public canChangeServerStatus: boolean = false;

  // Public current settings
  public currentGame: any = {}

  // Whitelisted ips
  public whitelist: number[] = [];

  // Game settings sent from API
  public maps: string[] = [];
  public modes: string[] = [];
  public lengths: string[] = [];
  public difficulties: string[] = [];

  // New game inputs
  public gameInput: any = {
    "map": "",
    "mode": "",
    "difficulty": "",
    "length": ""
  }

  // Repeat API calls regularly
  public gameTimer: any;
  public whitelistTimer: any;

  constructor(private kf2api: Kf2ApiService) { }

  ngOnInit(): void {
    // Check permissions
    let permission_paths = localStorage.getItem("paths");
    for (let path of permission_paths) {
      if ("/api/services".startsWith(path)) {
        this.canChangeServerStatus = true;
      }
    }
    // Get server and game details
    this.updateCurrentGame(true);
    this.gameTimer = interval(2500).subscribe((n) => {
      this.updateCurrentGame(false);
    })
    // Update whitelist semi-regularly
    this.updateWhitelist();
    this.whitelistTimer = interval(10000).subscribe((n) => {
      this.updateWhitelist();
    })
  }

  // Get latest server status
  public updateCurrentGame(updateLaunchOptions: boolean = false): void {
    this.kf2api.getKf2Status().then((response) => {
      if (response.status == 200) {
        // Update options
        this.maps = response.maps;
        this.modes = response.modes;
        this.difficulties = response.difficulties;
        this.lengths = response.lengths;
        // (If inputted) update the "Launch new game" options to the previous/ongoing options
        if (updateLaunchOptions) {
          this.gameInput.mode = response.currentgame.mode;
          this.gameInput.difficulty = response.currentgame.difficulty;
          this.gameInput.map = response.currentgame.map;
          if (response.currentgame.length == "Endless (254 waves)") {
            this.gameInput.length = "Long";
          } else {
            this.gameInput.length = response.currentgame.length;
          }
        }
        
        // Change on/off toggle and update current game
        this.enabled = response.serverstatus === "on";
        this.currentGame = response.currentgame;
      }
    })
  }

  // Launch a new game
  public launchGame(): void {
    this.modalLoading = true;
    this.modalError = "";
    this.modalMessage = "Starting new game...";
    this.modalTrigger.nativeElement.click();
    this.kf2api.startGame(this.gameInput).then((response) => {
      this.updateCurrentGame(false);
      this.modalLoading = false;
      if (response.status === 200) {
        this.closeModal.nativeElement.click();
      } else {
        this.modalError = response.error;
      }
    });
  }
  
  // Turn server on/off
  public toggleServer(): void {
    let change = this.enabled;
    // Trigger modal
    this.modalLoading = true;
    this.modalError = "";
    this.modalMessage = (change ? "Starting" : "Stopping") + " server...";
    this.modalTrigger.nativeElement.click();
    // Send API call
    this.kf2api[change ? "enable" : "disable"]().then((response) => {
      this.updateCurrentGame(false);
      this.modalLoading = false;
      if (response.status == 200) {
        this.closeModal.nativeElement.click();
      }
      else {
        this.modalError = response.error;
      }
    }) 
  }

  // Update IP whitelist
  public updateWhitelist(): void {
    this.kf2api.getWhitelist().then((response) => {
      if (response.status === 200) {
        this.whitelist = response.ips;
        this.ipExists = response.ips.indexOf(response.user_ip) != -1;
      }
    })
  }

  // Add our own IP to the whitelist
  public addMe(): void {
    this.kf2api.addIpToWhitelist("me").then((response) => {
      if (response.status === 200) {
        this.updateWhitelist();
      }
    })
  }

  // Remove a given IP from a whitelist
  public removeIpFromWhitelist(ip: string): void {
    this.kf2api.removeIpFromWhitelist(ip).then((response) => {
      if (response.status === 200) {
        this.updateWhitelist();
      }
    })
  }

  // Open "Add IP" modal
  public openAddIpBox(): void {
    this.modalError = "";
    this.ipInput = "";
    this.modalLoading = false;
    this.addIpModalTrigger.nativeElement.click();
  }

  // Add an IP to the KF2 whitelist
  public addWhitelistIp(): void {
    this.modalError = "";
    this.modalLoading = true;
    this.kf2api.addIpToWhitelist(this.ipInput).then((response) => {
      this.modalLoading = false;
      if (response.status === 200) {
        this.addIpCloseModal.nativeElement.click();
      } else {
        this.modalError = response.error;
      }
    })
  }

  // End API calls when leaving task page
  ngOnDestroy(): void {
    if (this.gameTimer) this.gameTimer.unsubscribe();
    if (this.whitelistTimer) this.whitelistTimer.unsubscribe();
  }

}

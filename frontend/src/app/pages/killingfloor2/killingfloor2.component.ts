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
  public modalLoading: boolean = false;
  public modalError: string = "";
  public modalMessage: string = "";

  // Current kf2 server status
  public enabled: boolean = false;

  // Permissions
  public canChangeServerStatus: boolean = false;

  // Public current settings
  public currentGame: any = {}

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

  // Repeat API call regularly
  public timer: any;

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
    this.timer = interval(2500).subscribe((n) => {
      this.updateCurrentGame(false);
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
          this.gameInput.length = response.currentgame.length;
          this.gameInput.map = response.currentgame.map;
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

}

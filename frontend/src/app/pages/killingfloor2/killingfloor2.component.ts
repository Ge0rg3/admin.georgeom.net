import { Component, OnInit, ViewChild } from '@angular/core';
import { Kf2ApiService } from 'src/app/common/services/kf2.service';

@Component({
  selector: 'app-killingfloor2',
  templateUrl: 'killingfloor2.component.html',
  styleUrls: ['killingfloor2.component.scss']
})
export class KillingFloor2Component implements OnInit {

  // Modal
  @ViewChild("launchModalTrigger") launchModalTrigger;
  @ViewChild("closeLaunchModalClose") closeLaunchModalClose;
  public loadingGame: boolean = false;
  public launchError: string = "";

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

  public launchGame(): void {
    this.launchModalTrigger.nativeElement.click();
    this.loadingGame = true;
    this.launchError = "";
    this.kf2api.startGame(this.gameInput).then((response) => {
      this.updateCurrentGame(false);
      this.loadingGame = false;
      if (response.status === 200) {
        this.closeLaunchModalClose.nativeElement.click();
      } else {
        this.launchError = response.error;
      }
    });
  }

}

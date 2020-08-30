import { Injectable } from '@angular/core';
import * as seedrandom from 'seedrandom';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {


  constructor() {
  }

  public randomRgb(seed?: string): string {
    if (seed === undefined) {
      seed = Math.random().toString();
    }
    var r = Math.floor(seedrandom(seed + "__R")() * 255);
    var g = Math.floor(seedrandom(seed + "__G")() * 255);
    var b = Math.floor(seedrandom(seed + "__B")() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  public formatBytes(bytes: number, decimals = 2): string {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    if (bytes === 0) return '0 ' + sizes[0];
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

}
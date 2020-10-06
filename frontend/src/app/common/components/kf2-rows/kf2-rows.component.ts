import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'kf2-rows',
  templateUrl: 'kf2-rows.component.html',
  styleUrls: ['kf2-rows.component.scss']
})
export class Kf2Rows {
  @Input() gamedetails: boolean = true;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    // Update game details on call
    if (changes.gamedetails) {
      this.gamedetails = changes.gamedetails.currentValue;
    }
  }

}

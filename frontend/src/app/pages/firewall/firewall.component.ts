import { Component, OnInit, ViewChild } from '@angular/core';
import { UfwService } from '../../common/services/ufw.service';
import { RouteConfigLoadEnd } from '@angular/router';

@Component({
  selector: 'app-firewall',
  templateUrl: 'firewall.component.html',
  styleUrls: ['firewall.component.scss']
})
export class FirewallComponent implements OnInit {

  // Modal buttons
  @ViewChild("deleteModalTrigger") deleteModalTrigger;
  @ViewChild("deleteModalClose") deleteModalClose;
  @ViewChild("addModalTrigger") addModalTrigger;
  @ViewChild("addModalClose") addModalClose;
  // Stores response from API
  public firewall: any = {
    "enabled": false,
    "rules": []
  };
  // Stores the rule that the user wants to delete
  public selected_rule: any = {};
  // Check api statuses
  public api_statuses: any = {
    "delete": {
      "loading": false,
      "complete": false,
      "error": ""
    },
    "get": {
      "loading": false,
      "complete": false,
      "error": ""
    },
    "add": {
      "loading": false,
      "complete": false,
      "error": ""
    }
  }
  // User input from "Add simple rule" box
  public addRuleInput: any = {
    "type": "allow",
    "port": null,
    "comment": ""
  }

  constructor(private ufwApi: UfwService) { }

  ngOnInit(): void {
    this.updateFirewallData();
  }

  // Update the rules and status from API
  public updateFirewallData(): void {
    this.api_statuses.get.loading = true;
    this.api_statuses.get.complete = false;
    this.ufwApi.getCurrentRules().then((result) => {
      this.api_statuses.get.loading = false;
      this.api_statuses.get.complete = true;
      if (result.status === 200) {
        this.firewall.enabled = result.enabled;
        this.firewall.rules = result.results;
      }
    })
  }

  // Open delete box modal
  public deleteRulePopup(rule: any): void {
    // Reset current status
    this.api_statuses.delete.complete = false;
    this.api_statuses.delete.error = "";
    // Select rule and open modal
    this.selected_rule = rule;
    this.deleteModalTrigger.nativeElement.click();
  }

  // Delete a rule
  public deleteRule(rule: any): void {
    // Show loading icon
    this.api_statuses.delete.loading = true;
    // Send request
    this.ufwApi.deleteRule(rule.id).then((response) => {
      // Remove loading
      this.api_statuses.delete.loading = false;
      this.api_statuses.delete.complete = true;
      if (response.status === 200) {
        // Refresh rules
        this.updateFirewallData();
        // Close modal
        this.deleteModalClose.nativeElement.click();
      } else {
        this.api_statuses.delete.error = response.error;
      }
    })
  }

  // Catch on/off slider changes
  public firewallSliderChange(): void {
    let enabled = this.firewall.enabled;
    if (enabled) {
      this.ufwApi.enable().then(() => this.updateFirewallData());
    } else {
      this.ufwApi.disable().then(() => this.updateFirewallData());
    }
  }

  // Open add rule modal
  public addRulePopup(): void {
    this.api_statuses.add.loading = false;
    this.api_statuses.add.complete = false;
    this.addModalTrigger.nativeElement.click();
  }

  // Get simple rule data from popup and send request
  public addSimpleRule(): void {
    this.api_statuses.add.loading = true;
    this.ufwApi.addPortRule(this.addRuleInput).then((result) => {
      this.api_statuses.add.loading = false;
      this.api_statuses.add.complete = true;
      if (result.status == 200) {
        this.updateFirewallData();
        this.addModalClose.nativeElement.click();
      } else {
        this.api_statuses.add.error = result.error;
      }
    })
  }

}

import { Component, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/common/services/utils.service';

@Component({
  selector: 'app-diskspace',
  templateUrl: 'diskspace.component.html',
  styleUrls: ['diskspace.component.scss']
})
export class DiskspaceComponent implements OnInit {

  public currentPath: string = "/";
  public currentHover: any;
  public files: any[] = [];

  constructor(public utils: UtilsService) { }

  ngOnInit(): void {
  }

  // Update path if graph is clicked on
  public updatePath(newPath: string) {
    this.currentPath = newPath;
  }

  // Get file list from child component
  public setFiles(files: any[]) {
    this.files = files;
  }

  // Handle "open directory" click
  public openDirectory(row: string) {
    // Ignore standard files
    if (row["entry_type"] != "directory" && row["entry_type"] != "link") {
      return;
    }
    else {
      this.updatePath(this.currentPath + row["entry"] + "/");
    }
  }

  // Go back by one directory
  public traverseDirectory() {
    if (this.currentPath == "/")
      return;
    let path_parts = this.currentPath.split("/");
    path_parts.pop();
    path_parts.pop();
    this.updatePath(path_parts.join("/") + "/");
  }

  // Show file details in third bubble
  public viewFile(file) {
    this.currentHover = file;
  }

  // Get pathname chunks for dynamic path view
  public getPathChunks(): string[] {
    let pathchunks = this.currentPath
        .split("/")
        .map(chunk => chunk + "/")
        .slice(0, -1);
    return pathchunks;
  }

  // Update folder path from folder chunk index
  public updatePathByIndex(chunkidx: number): void {
    let chunks = this.getPathChunks().slice(0, chunkidx + 1);
    this.updatePath(chunks.join(""))
  }

  // Get updated file hover from graph
  public updateFileView(filename) {
    let fileobjs = this.files.filter(file => file.entry == filename);
    if (fileobjs.length == 0)
      return;
    let fileobj = fileobjs[0];
    this.viewFile(fileobj);
  }

}

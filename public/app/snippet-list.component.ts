import { Component, OnInit } from '@angular/core';
import { Snippet } from './snippet';
import { SnippetService } from './snippet.service';
import { ServerStatus } from './server-status';

import './rxjs-operators';

@Component({
    providers: [ SnippetService ],
    selector: 'snippet-list',
    template: `
    <a routerLink="/snippet/new">
        <button class="ui button">Add snippet</button>
    </a>

    <button *ngIf="serverStatus == ServerStatus.Running" 
        (click)="pauseServer(); $event.stopPropagation()" 
        [class.disabled]="isPausing" class="ui green button">
            <i class="pause icon"></i>Pause</button>

    <button *ngIf="serverStatus == ServerStatus.Paused" 
        (click)="startServer(); $event.stopPropagation()" 
        [class.disabled]="isStarting" class="ui green button">
            <i class="play icon"></i>Start</button>

    <template [ngIf]="serverStatus == ServerStatus.Stopped">
        <button class="ui green button disabled">
            <i class="play icon"></i>Start</button>

        <div class="ui left pointing red basic label">
            Restart from the command line.
        </div>
    </template>

    <table class="ui celled padded table">
        <thead>
            <tr>
                <th>Name</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <tr *ngFor="let snippet of sortedSnippets()">
                <td class="single line">
                     {{snippet.name}}
                </td>
                <td class="single line">
                    <a routerLink="/snippet/{{snippet.id}}">
                        <button class="ui button">Edit</button>
                    </a>
                    <button (click)="removeSnippet(snippet); $event.stopPropagation()" class="ui red button">Delete</button>
                </td>
            </tr>
        </tbody>
    </table>
    `
})
export class SnippetListComponent implements OnInit { 
    public ServerStatus = ServerStatus;

    snippets: Snippet[];
    errorMessage: string;
    isPausing: boolean;
    isStarting: boolean;
    serverStatus: ServerStatus;
    
    constructor (
        private snippetService: SnippetService
    ) {
        this.serverStatus = ServerStatus.Unknown;
    }
    
    ngOnInit() {
        this.getSnippets();
        this.snippetService.connect('ws://' + window.location.host)
            .subscribe(
                response => this.setServerStatus(ServerStatus[<string>response.data])
            )
    };

    ngOnDestroy() {
    }

    getSnippets() {
        this.snippetService.getSnippets()
            .subscribe(
               snippets => this.snippets = snippets,
               error =>  this.errorMessage = <any>error
        );
    }

    removeSnippet(snippet: Snippet) {
         this.snippetService.removeSnippet(snippet.id)
             .then(() => {
                 this.snippets = this.snippets.filter(s => s !== snippet)
             })
    }

    pauseServer() {
        this.isPausing = true;
        this.snippetService.pause().then(() => {
            this.isPausing = false;
            this.setServerStatus(ServerStatus.Paused);
        });
    }

    startServer() {
        this.isStarting = true;
        this.snippetService.start().then(() => {
            this.isStarting = false;
            this.setServerStatus(ServerStatus.Running);
        });
    }

    sortedSnippets(): Snippet[] {
        return this.snippets;
    }

    private setServerStatus(newStatus: ServerStatus) {
        this.serverStatus = newStatus;
    }

}
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
        (click)="stopServer(); $event.stopPropagation()" 
        [class.disabled]="isStopping" class="ui green button">
            <i class="stop icon"></i>Stop</button>

    <button *ngIf="serverStatus == ServerStatus.Stopped" 
        (click)="startServer(); $event.stopPropagation()" 
        [class.disabled]="isStarting" class="ui green button">
            <i class="play icon"></i>Start</button>

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
    isStopping: boolean;
    isStarting: boolean;
    serverStatus: ServerStatus;
    
    constructor (private snippedService: SnippetService) {
        // TODO sync this from server
        this.serverStatus = ServerStatus.Running;
    }
    
    ngOnInit() {
        this.getSnippets();
    }

    getSnippets() {
        this.snippedService.getSnippets()
            .subscribe(
               snippets => this.snippets = snippets,
               error =>  this.errorMessage = <any>error
        );
    }

    removeSnippet(snippet: Snippet) {
         this.snippedService.removeSnippet(snippet.id)
             .then(() => {
                 this.snippets = this.snippets.filter(s => s !== snippet)
             })
    }

    stopServer() {
        this.isStopping = true;
        this.snippedService.stop().then(() => {
            this.isStopping = false;
            this.serverStatus = ServerStatus.Stopped;
        })
    }

    startServer() {
        this.isStarting = true;
        this.snippedService.start().then(() => {
            this.isStarting = false;
            this.serverStatus = ServerStatus.Running;
        })
    }

    sortedSnippets(): Snippet[] {
        return this.snippets;
    }

}
import { Component, OnInit } from '@angular/core';
import { Snippet } from './snippet';
import { SnippetService } from './snippet.service';

import './rxjs-operators';

@Component({
    providers: [ SnippetService ],
    selector: 'snippet-list',
    template: `
    <a routerLink="/snippet/new">
        <button class="ui green button">Add snippet</button>
    </a>
    <button (click)="toggleStartStop(); $event.stopPropagation()" class="ui black button">Stop</button>
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
                        <button class="ui black button">Edit</button>
                    </a>
                    <button (click)="removeSnippet(snippet); $event.stopPropagation()" class="ui red button">Delete</button>
                </td>
            </tr>
        </tbody>
    </table>
    `
})
export class SnippetListComponent implements OnInit { 
    snippets: Snippet[];
    errorMessage: string;
    
    constructor (private snippedService: SnippetService) {}
    
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

    toggleStartStop() {
        this.snippedService.stop().then(() => {})
    }

    sortedSnippets(): Snippet[] {
        return this.snippets;
    }

}
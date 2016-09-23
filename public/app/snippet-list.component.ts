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
                    <button class="ui red button">Delete</button>
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

    sortedSnippets(): Snippet[] {
        return this.snippets;
    }

}
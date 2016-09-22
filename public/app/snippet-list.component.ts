import { Component, OnInit } from '@angular/core';
import { Snippet } from './snippet';
import { SnippetService } from './snippet.service';

import './rxjs-operators';

@Component({
    providers: [ SnippetService ],
    selector: 'snippet-list',
    template: `
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
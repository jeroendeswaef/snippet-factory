import { Component, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Snippet } from './snippet';
import { SnippetService } from './snippet.service';

import './rxjs-operators';

@Component({
    providers: [ SnippetService ],
    selector: 'edit-snippet',
    template: `

    <form class="ui large form segment">
        <h3 class="ui header">Add a Snippet {{id}}</h3>
        <div class="field">
            <label for="snippet-name">Name:</label>
            <input name="snippet-name" #nameel [value]="snippet.name">
        </div>
        <div class="field">
            <label for="fileSelector">File selector:</label>
            <input name="fileSelector" #fileselectorel [value]="snippet.fileSelector">
        </div>
        <div class="field">
            <label for="search">Search:</label>
            <textarea rows="2" name="search" #searchel [value]="snippet.search"></textarea>
        </div>
        <div class="field">
            <label for="replace">Replace:</label>
            <textarea rows="3" name="replace" #replaceel [value]="snippet.replace"></textarea>
        </div>
        

        <button (click)="addSnippet(nameel, fileselectorel, searchel, replaceel, $event)"
              class="ui positive right floated button">
        Save
        </button>
    </form>
    `
})
export class EditSnippetComponent { 
    @Output() save: EventEmitter<Snippet> = new EventEmitter();
    snippet: Snippet;
    errorMessage: string;

    constructor (
        private snippedService: SnippetService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.snippet = new Snippet();
    }

    ngOnInit() {
        this.route.params.forEach((params: Params) => {
            let id = +params['id']; // (+) converts string 'id' to a number
            console.info(id);
            // this.snippedService.getHero(id).then(hero => this.hero = hero);
            this.snippedService.getSnippet(id)
                .subscribe(
                    snippet => (this.snippet = snippet) && console.info(snippet),
                    error =>  this.errorMessage = <any>error
                );
        });
    }

    addSnippet(snippetNameEl: HTMLInputElement, fileSelectorEl: HTMLInputElement, searchEl: HTMLInputElement, replaceEl: HTMLInputElement, e: Event): void {
        this.snippet.name = snippetNameEl.value;
        this.snippet.fileSelector = fileSelectorEl.value;
        this.snippet.search = searchEl.value;
        this.snippet.replace = replaceEl.value;
        this.save.next(this.snippet);
        this.snippedService.saveSnippet(this.snippet);
        e.preventDefault();
    }
}
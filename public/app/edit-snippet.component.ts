import { Component, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Snippet } from './snippet';
import { SnippetService } from './snippet.service';
import { ModificationType } from './modification-type';

import './rxjs-operators';

@Component({
    providers: [ SnippetService ],
    selector: 'edit-snippet',
    template: `

    <form class="ui large form segment">
        <div class="field">
            <label for="snippet-name">Name:</label>
            <input name="snippet-name" #nameel [value]="snippet.name">
        </div>
        <div class="field">
            <label for="fileSelector">File selector:</label>
            <input name="fileSelector" #fileselectorel [value]="snippet.fileSelector">
        </div>

        <div class="field">
            <label for="search">Type of modification:</label>
            <select #modificationel class="ui dropdown" (change)="onChangeModificationType($event.target.value)">
                <option [selected]="snippet.modificationType === 0" value="RegExp">Regex search/replace</option>
                <option [selected]="snippet.modificationType === 1" value="InsertAtStartOfFile">Insert at start of file</option>
                <option [selected]="snippet.modificationType === 2" value="InsertAtEndOfFile">Insert at end of file</option>
            </select>
        </div>

        <div [hidden]="snippet.modificationType !== 0" class="field">
            <label for="search">Search:</label>
            <textarea rows="2" name="search" #searchel [value]="snippet.search"></textarea>
        </div>
        <div [hidden]="snippet.modificationType !== 0" class="field">
            <label for="replace">Replace:</label>
            <textarea rows="3" name="replace" #replaceel [value]="snippet.replace"></textarea>
        </div>
        <div [hidden]="snippet.modificationType === 0" class="field">
            <label for="replace">Insert:</label>
            <textarea rows="3" name="insersion" #insersionel [value]="snippet.insersion"></textarea>
        </div>

        <button (click)="addSnippet(nameel, fileselectorel, modificationel, searchel, replaceel, insersionel, $event)"
              class="ui positive right floated button">
        Save
        </button>
    </form>
    `
})
export class EditSnippetComponent { 
    @Output() save: EventEmitter<Snippet> = new EventEmitter<Snippet>();
    snippet: Snippet;
    errorMessage: string;
    isCreating: boolean;

    constructor (
        private snippedService: SnippetService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.snippet = new Snippet(null, '', '', ModificationType.RegExp, '', '', '');
    }

    ngOnInit() {
        this.route.params.forEach((params: Params) => {
            if (params['id'] !== 'new') {
                this.isCreating = false;
                let id = +params['id']; // (+) converts string 'id' to a number
                this.snippedService.getSnippet(id)
                    .subscribe(
                        snippet => { this.snippet = snippet },
                        error =>  this.errorMessage = <any>error
                    );
            } else {
                this.isCreating = true;
            }
        });
    }

    onChangeModificationType(newModificationTypeStr: string) {
        const newModificationType: ModificationType = ModificationType[newModificationTypeStr];
        this.snippet.modificationType = newModificationType;
        if (newModificationType === ModificationType.RegExp) {
            this.snippet.insersion = '';
        } else {
            this.snippet.search = '';
            this.snippet.replace = '';
        }
    }

    addSnippet(snippetNameEl: HTMLInputElement, fileSelectorEl: HTMLInputElement, modificationTypeEl: HTMLSelectElement,
        searchEl: HTMLInputElement, replaceEl: HTMLInputElement, insersionEl: HTMLInputElement, e: Event): void {
        this.snippet.name = snippetNameEl.value;
        this.snippet.fileSelector = fileSelectorEl.value;
        this.snippet.modificationType = ModificationType[modificationTypeEl.value];
        this.snippet.search = searchEl.value;
        this.snippet.replace = replaceEl.value;
        this.snippet.insersion = insersionEl.value;
        this.save.next(this.snippet);
        this.snippedService.saveSnippet(this.snippet)
            .subscribe( snippets => this.router.navigate(['/']));
        e.preventDefault();
    }
}
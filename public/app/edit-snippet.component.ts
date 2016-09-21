import { Component, EventEmitter, Output } from '@angular/core';
import { Snippet } from './snippet';

@Component({
    selector: 'edit-snippet',
    template: `

    <form class="ui large form segment">
        <h3 class="ui header">Add a Snippet</h3>
        <div class="field">
            <label for="snippet-name">Name:</label>
            <input name="snippet-name" #nameel>
        </div>
        <div class="field">
            <label for="fileSelector">File selector:</label>
            <input name="fileSelector" #fileselectorel>
        </div>
        <div class="field">
            <label for="search">Search:</label>
            <textarea rows="2" name="search" #searchel></textarea>
        </div>
        <div class="field">
            <label for="replace">Replace:</label>
            <textarea rows="3" name="replace" #replaceel></textarea>
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

    addSnippet(snippetNameEl: HTMLInputElement, fileSelectorEl: HTMLInputElement, searchEl: HTMLInputElement, replaceEl: HTMLInputElement, e: Event): void {
        this.snippet = new Snippet(snippetNameEl.value, fileSelectorEl.value, searchEl.value, replaceEl.value);
        this.save.next(this.snippet);
        e.preventDefault();
    }
}
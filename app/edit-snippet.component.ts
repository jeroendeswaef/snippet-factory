import { Component } from '@angular/core';

@Component({
    selector: 'edit-snippet',
    template: `

    <form class="ui large form segment">
        <h3 class="ui header">Add a Link</h3>
        <div class="field">
            <label for="fileSelector">File selector:</label>
            <input name="fileSelector" #fileselectorel>
        </div>
        <div class="field">
            <label for="search">Search:</label>
            <input name="search" #searchel>
        </div>
        <div class="field">
            <label for="replace">Replace:</label>
            <input name="replace" #replaceel>
        </div>
        

        <button (click)="addSnippet(fileselectorel, searchel, replaceel)"
              class="ui positive right floated button">
        Save
        </button>
    </form>
    `
})
export class EditSnippetComponent { 
    addSnippet(fileSelectorEl: HTMLInputElement, searchEl: HTMLInputElement, replaceEl: HTMLInputElement): void {
        console.info('addSnippet')
    }
}
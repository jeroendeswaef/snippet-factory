import { Component } from '@angular/core';
import { Snippet } from './snippet';

@Component({
    selector: 'my-app',
    template: `
    <!-- Menu Bar -->
    <div class="ui menu">
      <div class="ui container">
        <a href="#" class="header item">
          <img class="logo" src="resources/images/factory.png">
        </a>
        <div class="header item borderless">
          <h1 class="ui header">
            Snippet factory
          </h1>
        </div>
      </div>
    </div>

    <div class="ui main text container">
    	<edit-snippet (save)="addSnippet($event)"></edit-snippet>
    </div>

    <table class="ui celled padded table">
        <thead>
            <tr>
            	<th>Name</th>
    			<th>Active</th>
    			<th></th>
    		</tr>
    	</thead>
  		<tbody>
  			<tr *ngFor="let snippet of sortedSnippets()">
  				<td class="single line">
        			{{snippet.name}}
      			</td>
      			<td class="single line">
        			True
      			</td>
      			<td class="single line">
        			TODO
      			</td>
  			</tr>
  		</tbody>
  	</table>
    `
})
export class AppComponent {
	snippets: Snippet[];

	constructor() {
		this.snippets = []
	}

	addSnippet(snippet: Snippet): void {
		this.snippets.push(snippet);
	}

	sortedSnippets(): Snippet[] {
		return this.snippets;
	}
}


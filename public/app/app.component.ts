import { Component } from '@angular/core';
import { Snippet } from './snippet';

@Component({
    selector: 'my-app',
    template: `
    <!-- Menu Bar -->
    <div class="ui menu">
      <div class="ui container">
        <a href="#" class="header item">
          <img class="logo" src="/static/resources/images/factory.png">
        </a>
        <div class="header item borderless">
          <h1 class="ui header">
            Snippet factory
          </h1>
        </div>
      </div>
    </div>

    <!-- Routed views go here -->
    <router-outlet></router-outlet>
    `
})
export class AppComponent {
	snippets: Snippet[];

	constructor() {
		this.snippets = []
	}

	sortedSnippets(): Snippet[] {
		return this.snippets;
	}
}


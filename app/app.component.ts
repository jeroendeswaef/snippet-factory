import { Component } from '@angular/core';

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
    	Hello
    </div>
    `
})
export class AppComponent { }

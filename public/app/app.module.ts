import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { AppComponent }  from './app.component';
import { EditSnippetComponent }  from './edit-snippet.component';
import { SnippetListComponent } from './snippet-list.component';

import { routing, appRoutingProviders } from './app.routing';

@NgModule({
	imports: [ 
  		BrowserModule, 
  		HttpModule,
  		routing
  	],
  	declarations: [ 
  		AppComponent, 
  		EditSnippetComponent, 
  		SnippetListComponent 
  	],
  	providers: [
  		appRoutingProviders
  	],
  	bootstrap: [ 
  		AppComponent 
  	]
})
export class AppModule { }

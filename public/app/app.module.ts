import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent }  from './app.component';
import { EditSnippetComponent }  from './edit-snippet.component';

@NgModule({
  imports: [ BrowserModule ],
  declarations: [ AppComponent, EditSnippetComponent ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }

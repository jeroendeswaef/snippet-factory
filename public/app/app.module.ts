import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { AppComponent }  from './app.component';
import { EditSnippetComponent }  from './edit-snippet.component';

@NgModule({
  imports: [ BrowserModule, HttpModule ],
  declarations: [ AppComponent, EditSnippetComponent ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }

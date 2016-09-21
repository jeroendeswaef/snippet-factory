import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptionsArgs, RequestOptions } from '@angular/http';

import { Snippet } from './snippet';

@Injectable()
export class SnippetService {
	constructor(private http: Http) {}
	
	private urlAddSnippet = '/add-snippet';

	addSnippet(snippet: Snippet) {
		var body = JSON.stringify({ name: snippet.name, fileSelector: snippet.fileSelector, search: snippet.search, replace: snippet.replace });
		let headers = new Headers({ 'Content-Type': 'application/json' });
    	let options = new RequestOptions({ headers: headers });

		this.http.post(this.urlAddSnippet, body, options)
		     .toPromise()
             .then(this.extractData)
             .catch(this.handleError);
		/*.subscribe(
                     snippet  => console.info('Got snippet!'),
                     error =>  console.info('ERR'));*/
	},

	handleError() {
		console.error("Error in xhr");
	}

	extractData() {
		console.info("In extract data");
	}

}
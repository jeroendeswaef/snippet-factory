import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptionsArgs, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Snippet } from './snippet';

@Injectable()
export class SnippetService {
	constructor(private http: Http) {}
	
	private urlAddSnippet: string = '/add-snippet';
	private urlGetSnippets: string = '/snippets';

	getSnippets(): Observable<Snippet[]> {
		return this.http.get(this.urlGetSnippets)
            .map(this.extractData)
            .catch(this.handleError);
	}

	addSnippet(snippet: Snippet) {
		var body = JSON.stringify({ name: snippet.name, fileSelector: snippet.fileSelector, search: snippet.search, replace: snippet.replace });
		let headers = new Headers({ 'Content-Type': 'application/json' });
    	let options = new RequestOptions({ headers: headers });

		this.http.post(this.urlAddSnippet, body, options)
		     .toPromise()
             .then(this.extractData)
             .catch(this.handleError);
	}

	private extractData(res: Response) {
		var snippets: Snippet[] = [];
	    let body = res.json();
	    for(var i = 0; i < body.length; i++) {
	    	var snippet: Snippet = new Snippet(body[i].id, body[i].name, body[i].fileSelector, body[i].search, body[i].replace);
	    	snippets.push(snippet);
	    }
	    return snippets;
	}

	private handleError (error: any) {
	    let errMsg = (error.message) ? error.message :
	      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
	    console.error(errMsg); // log to console instead
	    return Observable.throw(errMsg);
	}

}
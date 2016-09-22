import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptionsArgs, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Snippet } from './snippet';

@Injectable()
export class SnippetService {
	constructor(private http: Http) {}
	
	private urlAddSnippet: string = '/api/add-snippet';
	private urlSaveSnippet: string = '/api/snippet';
	private urlGetSnippets: string = '/api/snippets';
	private urlGetSnippet: string = '/api/snippet';

	getSnippets(): Observable<Snippet[]> {
		return this.http.get(this.urlGetSnippets)
            .map(res => this.extractData(res))
            .catch(this.handleError);
	}

	getSnippet(id: number): Observable<Snippet> {
		var self = this;
		return this.http.get(this.urlGetSnippet + '/' + id)
            .map(res => self.extractSnippet(res.json()))
            .catch(this.handleError);
	}

	addSnippet(snippet: Snippet) {
		var body = this.snippetToJsonString(snippet);
		let headers = new Headers({ 'Content-Type': 'application/json' });
    	let options = new RequestOptions({ headers: headers });

		this.http.post(this.urlAddSnippet, body, options)
		     .toPromise()
             .then(this.extractData)
             .catch(this.handleError);
	}

	saveSnippet(snippet: Snippet) {
		var body = this.snippetToJsonString(snippet);
		let headers = new Headers({ 'Content-Type': 'application/json' });
    	let options = new RequestOptions({ headers: headers });

		this.http.post(this.urlSaveSnippet, body, options)
		     .toPromise()
             .then(this.extractData)
             .catch(this.handleError);
	}

	private extractSnippet(obj: Map<string, any>): Snippet {
		return new Snippet(obj['id'], obj['name'], obj['fileSelector'], obj['search'], obj['replace']);
	}

	private snippetToJsonString(snippet: Snippet): string {
		return JSON.stringify({ id: snippet.id, name: snippet.name, fileSelector: snippet.fileSelector, search: snippet.search, replace: snippet.replace });
	}

	private extractData(res: Response) {
		var snippets: Snippet[] = [];
	    let body = res.json();
	    for(var i = 0; i < body.length; i++) {
	    	var snippet: Snippet = this.extractSnippet(body[i]);
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
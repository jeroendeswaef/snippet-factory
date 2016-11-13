import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptionsArgs, RequestOptions, Response } from '@angular/http';
import { Subject, Observable, Observer } from 'rxjs/Rx';
import { Snippet } from './snippet';
import { ModificationType } from './modification-type';

@Injectable()
export class SnippetService {
	constructor(private http: Http) {}
	private socket: Subject<MessageEvent>;
	
	private urlSaveSnippet: string = '/api/snippet';
	private urlGetSnippets: string = '/api/snippets';
	private urlGetSnippet: string = '/api/snippet';

	private urlStart: string = '/api/start';
	private urlPause: string = '/api/pause';

	public getSnippets(): Observable<Snippet[]> {
		return this.http.get(this.urlGetSnippets)
            .map(res => this.extractData(res))
            .catch(this.handleError);
	}

	public getSnippet(id: number): Observable<Snippet> {
		var self = this;
		return this.http.get(this.urlGetSnippet + '/' + id)
            .map(res => self.extractSnippet(res.json()))
            .catch(this.handleError);
	}

	public removeSnippet(id: number): Promise<void> {
		return this.http.delete(this.urlGetSnippet + '/' + id)
				.toPromise()
				.then(() => null)
    			.catch(this.handleError);
	}

	public saveSnippet(snippet: Snippet): Observable<Snippet> {
		var body = this.snippetToJsonString(snippet);
		let headers = new Headers({ 'Content-Type': 'application/json' });
    	let options = new RequestOptions({ headers: headers });

		return this.http.post(this.urlSaveSnippet, body, options)
			 .map(res => this.extractSnippet(res.json()))
             .catch(this.handleError);
	}

	public connect(url: string): Subject<MessageEvent> {
        if(!this.socket) {
            this.socket = this.create(url);
        }

        return this.socket;
    }

    private create(url: string): Subject<MessageEvent> {
	    let ws = new WebSocket(url);

	    let observable = Observable.create(
	        (obs: Observer<MessageEvent>) => {
	            ws.onmessage = obs.next.bind(obs);
	            ws.onerror = obs.error.bind(obs);
	            ws.onclose = obs.complete.bind(obs);

	            return ws.close.bind(ws);
	        }
	    );

	    let observer = {
	        next: (data: Object) => {
	            if (ws.readyState === WebSocket.OPEN) {
	                ws.send(JSON.stringify(data));
	            }
	        },
	    };

	    return Subject.create(observer, observable);
	}

	public start() {
		return this.http.post(this.urlStart, "")
			.toPromise()
			.then(() => null)
			.catch(this.handleError);
	}

	public pause() {
		return this.http.post(this.urlPause, "")
			.toPromise()
			.then(() => null)
			.catch(this.handleError);
	}

	private extractSnippet(obj: Map<string, any>): Snippet {
		// Had to do this funcky cast, because otherwise, it wouldn't correctly create a ModificationType
		const modificationTypeStr = <string>obj['modificationType'];
		const modificationType: ModificationType = <ModificationType>(ModificationType[modificationTypeStr]);
		return new Snippet(obj['id'], obj['name'], obj['fileSelector'], modificationType, obj['search'], obj['replace'], obj['insersion']);
	}

	private snippetToJsonString(snippet: Snippet): string {
		return JSON.stringify({ id: snippet.id, name: snippet.name, fileSelector: snippet.fileSelector, modificationType: ModificationType[snippet.modificationType], search: snippet.search, replace: snippet.replace, insersion: snippet.insersion });
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
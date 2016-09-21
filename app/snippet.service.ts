import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Snippet } from './snippet';

@Injectable()
export class SnippetService {
	constructor(private http: Http) {}
	
}
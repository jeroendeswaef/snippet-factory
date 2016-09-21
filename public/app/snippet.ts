
export class Snippet {
	name: string;
	fileSelector: string;
	search: string;
	replace: string;

	constructor(name: string, fileSelector: string, search: string, replace: string) {
		this.name = name;
		this.fileSelector = fileSelector;
		this.search = search;
		this.replace = replace;
	}
}

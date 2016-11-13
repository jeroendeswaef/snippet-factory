import { ModificationType } from './modification-type';

export class Snippet {
	constructor(
		public id?: number, 
		public name?: string, 
		public fileSelector?: string, 
		public modificationType?: ModificationType, 
		public search?: string, 
		public replace?: string,
		public insersion?: string
	) {}
}

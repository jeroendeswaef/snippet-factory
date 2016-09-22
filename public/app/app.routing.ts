import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SnippetListComponent } from './snippet-list.component';
import { EditSnippetComponent } from './edit-snippet.component';

const appRoutes: Routes = [
	{ path: "", component: SnippetListComponent },
	{ path: "snippet/:id", component: EditSnippetComponent }
];

export const appRoutingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
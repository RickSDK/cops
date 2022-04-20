import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { BoardComponent } from './board/board.component';
import { InfoComponent } from './info/info.component';

const routes: Routes = [
	{ path: '', component: MainMenuComponent},
	{ path: 'info', component: InfoComponent},
	{ path: 'board', component: BoardComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

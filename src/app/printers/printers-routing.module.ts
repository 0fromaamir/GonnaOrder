import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrintersListComponent } from './printers-list/printers-list.component';
import { PrintersListGuard } from './printers-list.guard';

const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'list' },
    { path: 'list', component: PrintersListComponent, canActivate: [PrintersListGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})

export class PrintersRoutingModule { }

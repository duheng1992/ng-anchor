import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DemoAnchorComponent } from './demo-basic/demo.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/demo',
    pathMatch: 'full',
  },
  {
    path: 'demo',
    component: DemoAnchorComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

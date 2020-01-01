import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AnchorComponent } from './anchor/anchor.component';
import { AnchorLinkComponent } from './anchor-link/anchor-link.component';
import { DemoAnchorComponent } from './demo-basic/demo.component';

import { AnchorService } from './anchor.service';

@NgModule({
  declarations: [
    AppComponent,
    AnchorComponent,
    AnchorLinkComponent,
    DemoAnchorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    PlatformModule,
  ],
  providers: [AnchorService],
  bootstrap: [AppComponent]
})
export class AppModule { }

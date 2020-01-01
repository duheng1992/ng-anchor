import { Component } from '@angular/core';

@Component({
  selector: 'demo-anchor',
  template: `
    <sui-anchor>
      <sui-link suiHref="#components-anchor-demo-basic" suiTitle="Basic demo"></sui-link>
      <sui-link suiHref="#components-anchor-demo-static" suiTitle="Static demo"></sui-link>
      <sui-link suiHref="#api" suiTitle="API">
        <sui-link suiHref="#nz-anchor" suiTitle="nz-anchor"></sui-link>
        <sui-link suiHref="#nz-link" suiTitle="nz-link"></sui-link>
      </sui-link>
    </sui-anchor>
  `
  // template: `<sui-anchor></sui-anchor>`,
})
export class DemoAnchorComponent {}
import { Platform } from '@angular/cdk/platform';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';

import { AnchorComponent } from '../anchor/anchor.component';

@Component({
  selector: 'sui-link',
  // exportAs: 'suiLink',
  preserveWhitespaces: false,
  templateUrl: './anchor-link.component.html',
  styleUrls: ['./anchor-link.component.sass'],
  host: {
    '[class.ant-anchor-link-active]': 'active'
  },
  styles: [
    `
      link {
        display: block;
      }
    `
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnchorLinkComponent implements OnInit, OnDestroy {
  @Input() suiHref = '#';

  titleStr: string | null = '';
  // tslint:disable-next-line:no-any
  titleTpl: TemplateRef<any>;
  active: boolean = false;

  @Input()
  set suiTitle(value: string | TemplateRef<void>) {
    if (value instanceof TemplateRef) {
      this.titleStr = null;
      this.titleTpl = value;
    } else {
      this.titleStr = value;
    }
  }

  @ContentChild('template', { static: false }) template: TemplateRef<void>;

  constructor(
    public elementRef: ElementRef,
    private anchorComp: AnchorComponent,
    private cdr: ChangeDetectorRef,
    private platform: Platform,
    renderer: Renderer2
  ) {
    renderer.addClass(elementRef.nativeElement, 'ant-anchor-link');
  }

  ngOnInit(): void {
    this.anchorComp.registerLink(this);
  }

  goToClick(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    if (this.platform.isBrowser) {
      this.anchorComp.handleScrollTo(this);
    }
  }

  markForCheck(): void {
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.anchorComp.unregisterLink(this);
  }
}
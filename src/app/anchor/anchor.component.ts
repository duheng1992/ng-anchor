import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { distinctUntilChanged, throttleTime } from 'rxjs/operators';

import { AnchorService } from '../anchor.service';
import { WithConfig } from '../utils';
// import { InputBoolean, InputNumber, NgStyleInterface, NzConfigService, NzScrollService, toNumber, WithConfig } from 'ng-zorro-antd/core';

import { AnchorLinkComponent } from '../anchor-link/anchor-link.component';

interface Section {
  comp: AnchorLinkComponent;
  top: number;
}

const CONFIG_COMPONENT_NAME = 'anchor';
const sharpMatcherRegx = /#([^#]+)$/;

@Component({
  selector: 'sui-anchor',
  // exportAs: 'suiAnchor',
  preserveWhitespaces: false,
  templateUrl: './anchor.component.html',
  styleUrls: ['./anchor.component.sass'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnchorComponent implements OnDestroy, AfterViewInit {
  @ViewChild('ink', { static: false }) private ink: ElementRef;

  @Input() affix = true;

  @Input()
  @WithConfig(CONFIG_COMPONENT_NAME, false)
  showInkInFixed: boolean;

  @Input()
  @WithConfig(CONFIG_COMPONENT_NAME, 5)
  bounds: number;

  @Input()
  @WithConfig<number>(CONFIG_COMPONENT_NAME)
  set offsetTop(value: number) {
    this._offsetTop = value;
    this.wrapperStyle = {
      'max-height': `calc(100vh - ${this._offsetTop}px)`
    };
  }

  get offsetTop(): number {
    return this._offsetTop;
  }

  private _offsetTop: number;

  @Input()
  set suiTarget(el: string | Element) {
    this.target = typeof el === 'string' ? this.doc.querySelector(el) : el;
    this.registerScrollEvent();
  }

  @Output() readonly click = new EventEmitter<string>();
  @Output() readonly scroll = new EventEmitter<AnchorLinkComponent>();

  visible = false;
  wrapperStyle = { 'max-height': '100vh' };

  private links: AnchorLinkComponent[] = [];
  private animating = false;
  private target: Element | null = null;
  private scroll$: Subscription | null = null;
  private destroyed = false;

  constructor(
    // public configService: ConfigService,
    private service: AnchorService,
    /* tslint:disable-next-line:no-any */
    @Inject(DOCUMENT) private doc: any,
    private cdr: ChangeDetectorRef,
    private platform: Platform
  ) {
  }

  registerLink(link: AnchorLinkComponent): void {
    this.links.push(link);
  }

  unregisterLink(link: AnchorLinkComponent): void {
    this.links.splice(this.links.indexOf(link), 1);
  }

  private getTarget(): Element | Window {
    return this.target || window;
  }

  ngAfterViewInit(): void {
    this.registerScrollEvent();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.removeListen();
  }

  private registerScrollEvent(): void {
    if (!this.platform.isBrowser) {
      return;
    }
    this.removeListen();
    this.scroll$ = fromEvent(this.getTarget(), 'scroll')
      .pipe(throttleTime(50), distinctUntilChanged())
      .subscribe(() => this.handleScroll());
    // Browser would maintain the scrolling position when refreshing.
    // So we have to delay calculation in avoid of getting a incorrect result.
    setTimeout(() => this.handleScroll());
  }

  private removeListen(): void {
    if (this.scroll$) {
      this.scroll$.unsubscribe();
    }
  }

  private getOffsetTop(element: HTMLElement): number {
    if (!element || !element.getClientRects().length) {
      return 0;
    }
    const rect = element.getBoundingClientRect();
    if (rect.width || rect.height) {
      if (this.getTarget() === window) {
        return rect.top - element.ownerDocument!.documentElement!.clientTop;
      }
      return rect.top - (this.getTarget() as HTMLElement).getBoundingClientRect().top;
    }
    return rect.top;
  }

  handleScroll(): void {
    if (typeof document === 'undefined' || this.destroyed || this.animating) {
      return;
    }

    const sections: Section[] = [];
    console.log(this.bounds)
    const scope = (this.offsetTop || 0) + this.bounds;
    this.links.forEach(comp => {
      const sharpLinkMatch = sharpMatcherRegx.exec(comp.suiHref.toString());
      if (!sharpLinkMatch) {
        return;
      }
      const target = this.doc.getElementById(sharpLinkMatch[1]);
      if (target) {
        const top = this.getOffsetTop(target);
        if (top < scope) {
          sections.push({
            top,
            comp
          });
        }
      }
    });

    this.visible = !!sections.length;
    if (!this.visible) {
      this.clearActive();
      this.cdr.detectChanges();
    } else {
      const maxSection = sections.reduce((prev, curr) => (curr.top > prev.top ? curr : prev));
      this.handleActive(maxSection.comp);
    }
  }

  private clearActive(): void {
    this.links.forEach(i => {
      i.active = false;
      i.markForCheck();
    });
  }

  private handleActive(comp: AnchorLinkComponent): void {
    this.clearActive();

    comp.active = true;
    comp.markForCheck();

    const linkNode = (comp.elementRef.nativeElement as HTMLDivElement).querySelector('.ant-anchor-link-title') as HTMLElement;
    this.ink.nativeElement.style.top = `${linkNode.offsetTop + linkNode.clientHeight / 2 - 4.5}px`;
    this.visible = true;
    this.cdr.detectChanges();

    this.scroll.emit(comp);
  }

  handleScrollTo(linkComp: AnchorLinkComponent): void {
    const el = this.doc.querySelector(linkComp.suiHref);
    if (!el) {
      return;
    }

    this.animating = true;
    const containerScrollTop = this.service.getScroll(this.getTarget());
    const elOffsetTop = this.getOffsetTop(el);
    const targetScrollTop = containerScrollTop + elOffsetTop - (this.offsetTop || 0);
    this.service.scrollTo(this.getTarget(), targetScrollTop, undefined, () => {
      this.animating = false;
      this.handleActive(linkComp);
    });
    this.click.emit(linkComp.suiHref);
  }
}
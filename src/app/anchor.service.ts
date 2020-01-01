import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { reqAnimFrame } from './request-animation';

type EasyingFn = (t: number, b: number, c: number, d: number) => number;

@Injectable({
  providedIn: 'root'
})
export class AnchorService {

  private doc: Document;

  // constructor(@Inject(DOCUMENT) doc: any) {
  //   this.doc = doc;
  // }

  getScroll(el?: Element | Window, top: boolean = true): number {
    const target = el ? el : window;
    const prop = top ? 'pageYOffset' : 'pageXOffset';
    const method = top ? 'scrollTop' : 'scrollLeft';
    const isWindow = target === window;
    // @ts-ignore
    let ret = isWindow ? target[prop] : target[method];
    if (isWindow && typeof ret !== 'number') {
      ret = this.doc.documentElement![method];
    }
    return ret;
  }

  scrollTo(containerEl: Element | Window, targetTopValue: number = 0, easing?: EasyingFn, callback?: () => void): void {
    const target = containerEl ? containerEl : window;
    const scrollTop = this.getScroll(target);
    const startTime = Date.now();
    const frameFunc = () => {
      const timestamp = Date.now();
      const time = timestamp - startTime;
      this.setScrollTop(target, (easing || this.easeInOutCubic)(time, scrollTop, targetTopValue, 450));
      if (time < 450) {
        reqAnimFrame(frameFunc);
      } else {
        if (callback) {
          callback();
        }
      }
    };
    reqAnimFrame(frameFunc);
  }

  setScrollTop(el: Element | Window, topValue: number = 0): void {
    if (el === window) {
      this.doc.body.scrollTop = topValue;
      this.doc.documentElement!.scrollTop = topValue;
    } else {
      (el as Element).scrollTop = topValue;
    }
  }

  easeInOutCubic(t: number, b: number, c: number, d: number): number {
    const cc = c - b;
    let tt = t / (d / 2);
    if (tt < 1) {
      return (cc / 2) * tt * tt * tt + b;
    } else {
      return (cc / 2) * ((tt -= 2) * tt * tt + 2) + b;
    }
  }

}

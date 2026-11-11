import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';

import { VideoService } from '../services/video.service';

/**
 * Связывает `<video>` с `VideoService`.
 *
 * Директива не содержит бизнес-логики: при инициализации она передаёт элемент
 * сервису (`connect()`), при уничтожении — отвязывает (`disconnect()`).
 *
 * @example
 * ```html
 * <video ngxVideo [src]="src"></video>
 * ```
 *
 * @example
 * Доступ к сервису напрямую через `exportAs`:
 * ```html
 * <video ngxVideo #player="ngxVideo" [src]="src"></video>
 * <button (click)="player.service.toggle()">Play</button>
 * ```
 */
@Directive({
  selector: 'video[ngxVideo]',
  exportAs: 'ngxVideo',
})
export class VideoDirective implements OnInit, OnDestroy {
  private readonly elementRef =
    inject<ElementRef<HTMLVideoElement>>(ElementRef);

  /** Сервис, привязанный к этому элементу. */
  readonly service = inject(VideoService);

  ngOnInit(): void {
    this.service.connect(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.service.disconnect();
  }
}

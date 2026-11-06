import { Component } from '@angular/core';

import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для ChapterMarkersComponent.
 *
 * Живой пример появится, когда кирпич будет реализован в @erst_dev/ngx-video-timeline.
 */
@Component({
  selector: 'app-chapter-markers-demo',
  imports: [DemoShellComponent],
  templateUrl: './chapter-markers-demo.html',
})
export class ChapterMarkersDemo {
  protected readonly responsibilities = [
    'Входы: chapters, duration, customClass; выход: chapterSelect.',
    'Не парсит метаданные видео и не редактирует главы.',
  ];
}

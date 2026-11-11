import { Component } from '@angular/core';

import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для QualitySwitcherComponent.
 *
 * Живой пример появится, когда кирпич будет реализован в @erst_dev/ngx-video-sources.
 */
@Component({
  selector: 'app-quality-switcher-demo',
  imports: [DemoShellComponent],
  templateUrl: './quality-switcher-demo.html',
})
export class QualitySwitcherDemo {
  protected readonly responsibilities = [
    'Входы: qualities, activeId, customClass; выход: qualityChange.',
    'Тип QualityInterface объявлен в core.',
    'Не парсит манифесты и не хранит состояние.',
  ];
}

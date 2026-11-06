import { Component } from '@angular/core';

import { DemoShellComponent } from '../../shared/demo-shell/demo-shell';

/**
 * Демо для KeyboardShortcutsDirective.
 *
 * Живой пример появится, когда кирпич будет реализован в @erst_dev/ngx-video-extras.
 */
@Component({
  selector: 'app-keyboard-shortcuts-demo',
  imports: [DemoShellComponent],
  templateUrl: './keyboard-shortcuts-demo.html',
})
export class KeyboardShortcutsDemo {
  protected readonly responsibilities = [
    'Директива: [ngxKeyboardShortcuts].',
    'Выходы: togglePlay, seekBy, volumeChange, toggleMute, toggleFullscreen.',
    'Не управляет воспроизведением напрямую.',
  ];
}

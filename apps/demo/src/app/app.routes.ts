import { Routes } from '@angular/router';

import { PlayerDemo } from './pages/player-demo/player-demo';

export const appRoutes: Routes = [
  {
    path: '',
    component: PlayerDemo,
  },
  {
    path: '**',
    redirectTo: '',
  },
];

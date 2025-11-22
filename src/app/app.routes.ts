import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Creatures } from './pages/creatures/creatures';
import { Encounters } from './pages/encounters/encounters';
import { MyEncounters } from './pages/my-encounters/my-encounters';
import { PlayEncounter } from './pages/play-encounter/play-encounter';
import { CreateCreature } from './pages/create-creature/create-creature';
import { CreateEncounter } from './pages/create-encounter/create-encounter';
import { Combat } from './pages/combat/combat';
import { Demo } from './pages/demo/demo';
import { Tutorial } from './pages/tutorial/tutorial';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'tutorial', component: Tutorial },
  { path: 'creatures', component: Creatures },
  { path: 'create-creature', component: CreateCreature },
  { path: 'encounters', component: Encounters },
  { path: 'create-encounter', component: CreateEncounter },
  { path: 'my-encounters', component: MyEncounters },
  { path: 'play/:id', component: PlayEncounter },
  { path: 'combat/:id', component: Combat },
  { path: 'combat', component: Combat },  // Also support combat without ID - will get active encounter
  { path: 'demo', component: Demo },
  { path: '**', redirectTo: '' }
];

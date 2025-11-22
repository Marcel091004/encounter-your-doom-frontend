import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attack } from '../models/creature.model';

export interface CombatCreature {
  id: string;
  name: string;
  currentHp: number;
  maxHp: number;
  armorClass: number;
  initiative: number;
  initiativeBonus?: number;  // Initiative bonus for rolling initiative
  statusEffects: string[];
  isPlayer?: boolean;
  attacks?: Attack[];
  resistances?: string[];
  immunities?: string[];
  weaknesses?: string[];
  traits?: string[];
}

export interface CombatState {
  encounterId: string;
  userId: string;
  creatures: CombatCreature[];
  currentTurn: number;
  round: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CombatService {
  private readonly apiUrl = 'https://encounter-your-doom.onrender.com/datev/v1';

  constructor(private http: HttpClient) {}

  // Start encounter (makes it the active encounter for the user)
  // POST /privateEncounter/{id}/user/{userid}
  startEncounter(encounterId: string, userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/privateEncounter/${encounterId}/user/${userId}`, {});
  }

  // Get active encounter for user
  // GET /activeEncounter/{userid}
  getActiveEncounter(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/activeEncounter/${userId}`);
  }

  // Update creature in active encounter
  // PUT /activeEncounter/{userid}/{creatureid}?heal=X&damage=Y&statusEffect=Effect
  updateCreatureInActiveEncounter(
    userId: string,
    creatureId: string,
    options: { heal?: number; damage?: number; statusEffects?: string[] }
  ): Observable<void> {
    let params = '';
    const queryParams: string[] = [];

    if (options.heal !== undefined) {
      queryParams.push(`heal=${options.heal}`);
    }
    if (options.damage !== undefined) {
      queryParams.push(`damage=${options.damage}`);
    }
    if (options.statusEffects && options.statusEffects.length > 0) {
      options.statusEffects.forEach(effect => {
        queryParams.push(`statusEffect=${encodeURIComponent(effect)}`);
      });
    }

    if (queryParams.length > 0) {
      params = '?' + queryParams.join('&');
    }

    return this.http.put<void>(`${this.apiUrl}/activeEncounter/${userId}/${creatureId}${params}`, {});
  }

  // Close active encounter
  // DELETE /activeEncounter/{userid}
  closeActiveEncounter(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/activeEncounter/${userId}`);
  }
}

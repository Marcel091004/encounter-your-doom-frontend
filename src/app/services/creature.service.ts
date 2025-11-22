import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Creature } from '../models/creature.model';
import { Region, Rarity } from '../models/enums';

@Injectable({
  providedIn: 'root'
})
export class CreatureService {
  private readonly apiUrl = 'http://localhost:8080/datev/v1/creature';

  constructor(private http: HttpClient) {}

  getCreatures(region?: Region, rarity?: Rarity, cr?: string): Observable<Creature[]> {
    let params = new HttpParams();
    if (region) params = params.set('region', region);
    if (rarity) params = params.set('rarity', rarity);
    if (cr) params = params.set('cr', cr);
    return this.http.get<Creature[]>(this.apiUrl, { params });
  }

  getCreatureById(id: string): Observable<Creature> {
    return this.http.get<Creature>(`${this.apiUrl}/${id}`);
  }

  getRandomCreature(region?: Region, rarity?: Rarity, cr?: string): Observable<Creature> {
    let params = new HttpParams();
    if (region) params = params.set('region', region);
    if (rarity) params = params.set('rarity', rarity);
    if (cr) params = params.set('cr', cr);
    return this.http.get<Creature>(`${this.apiUrl}/random`, { params });
  }

  createCreature(creature: Creature): Observable<any> {
    return this.http.post(this.apiUrl, creature, { observe: 'response' });
  }

  updateCreature(id: string, creature: Creature): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, creature);
  }
}

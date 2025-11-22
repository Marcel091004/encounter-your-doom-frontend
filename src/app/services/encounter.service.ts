import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Encounter } from '../models/encounter.model';
import { Region, Rarity, DifficultyLevel } from '../models/enums';

@Injectable({
  providedIn: 'root'
})
export class EncounterService {
  private readonly apiUrl = 'http://localhost:8080/datev/v1';

  constructor(private http: HttpClient) {}

  // Public Encounters
  getAllPublicEncounters(
    region?: Region,
    rarity?: Rarity,
    difficultyLevel?: DifficultyLevel,
    partyLevel?: number
  ): Observable<Encounter[]> {
    let params = new HttpParams();
    if (region) params = params.set('region', region);
    if (rarity) params = params.set('rarity', rarity);
    if (difficultyLevel) params = params.set('difficultyLevel', difficultyLevel);
    if (partyLevel) params = params.set('partyLevel', partyLevel.toString());
    return this.http.get<Encounter[]>(`${this.apiUrl}/encounter`, { params });
  }

  getPublicEncounterById(id: string): Observable<Encounter> {
    return this.http.get<Encounter>(`${this.apiUrl}/encounter/${id}`);
  }

  getRandomEncounter(
    region?: Region,
    rarity?: Rarity,
    difficultyLevel?: DifficultyLevel,
    partyLevel?: number
  ): Observable<Encounter> {
    let params = new HttpParams();
    if (region) params = params.set('region', region);
    if (rarity) params = params.set('rarity', rarity);
    if (difficultyLevel) params = params.set('difficultyLevel', difficultyLevel);
    if (partyLevel) params = params.set('partyLevel', partyLevel.toString());
    return this.http.get<Encounter>(`${this.apiUrl}/encounter/random`, { params });
  }

  createPublicEncounter(encounter: Encounter): Observable<any> {
    return this.http.post(`${this.apiUrl}/encounter`, encounter, { observe: 'response' });
  }

  updatePublicEncounter(id: string, encounter: Encounter): Observable<any> {
    return this.http.put(`${this.apiUrl}/encounter/${id}`, encounter);
  }

  moveEncounterToUserSpace(encounterId: string, userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/encounter/${encounterId}/user/${userId}/move`, {});
  }

  // Private Encounters
  getAllEncountersForUser(
    userId: string,
    region?: Region,
    rarity?: Rarity,
    difficultyLevel?: DifficultyLevel,
    partyLevel?: number
  ): Observable<Encounter[]> {
    let params = new HttpParams();
    if (region) params = params.set('region', region);
    if (rarity) params = params.set('rarity', rarity);
    if (difficultyLevel) params = params.set('difficultyLevel', difficultyLevel);
    if (partyLevel) params = params.set('partyLevel', partyLevel.toString());
    return this.http.get<Encounter[]>(`${this.apiUrl}/privateEncounter/${userId}`, { params });
  }

  getEncounterForUser(encounterId: string, userId: string): Observable<Encounter> {
    return this.http.get<Encounter>(`${this.apiUrl}/privateEncounter/${encounterId}/user/${userId}`);
  }

  createEncounterForUser(userId: string, encounter: Encounter): Observable<any> {
    return this.http.post(`${this.apiUrl}/privateEncounter/${userId}`, encounter, { observe: 'response' });
  }

  updateEncounterForUser(encounterId: string, userId: string, encounter: Encounter): Observable<any> {
    return this.http.put(`${this.apiUrl}/privateEncounter/${encounterId}/user/${userId}`, encounter);
  }

  deleteEncounterForUser(encounterId: string, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/privateEncounter/${encounterId}/user/${userId}`);
  }
}

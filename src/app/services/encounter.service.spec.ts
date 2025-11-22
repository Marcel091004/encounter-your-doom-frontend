import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EncounterService } from './encounter.service';
import { Encounter } from '../models/encounter.model';
import { Region, Rarity, DifficultyLevel } from '../models/enums';

describe('EncounterService', () => {
  let service: EncounterService;
  let httpMock: HttpTestingController;
  const apiUrl = 'https://encounter-your-doom.onrender.com/datev/v1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EncounterService]
    });
    service = TestBed.inject(EncounterService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllPublicEncounters', () => {
    it('should get all public encounters without filters', () => {
      const mockEncounters: Encounter[] = [
        { id: '1', name: 'Dragon Lair' },
        { id: '2', name: 'Goblin Cave' }
      ];

      service.getAllPublicEncounters().subscribe(encounters => {
        expect(encounters).toEqual(mockEncounters);
        expect(encounters.length).toBe(2);
      });

      const req = httpMock.expectOne(`${apiUrl}/encounter`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEncounters);
    });

    it('should get public encounters with all filters', () => {
      const mockEncounters: Encounter[] = [
        { id: '1', name: 'Dragon Lair', region: Region.MOUNTAIN, rarity: Rarity.LEGENDARY, difficultyLevel: DifficultyLevel.DEADLY, partyLevel: 10 }
      ];

      service.getAllPublicEncounters(Region.MOUNTAIN, Rarity.LEGENDARY, DifficultyLevel.DEADLY, 10).subscribe(encounters => {
        expect(encounters).toEqual(mockEncounters);
      });

      const req = httpMock.expectOne(`${apiUrl}/encounter?region=${Region.MOUNTAIN}&rarity=${Rarity.LEGENDARY}&difficultyLevel=${DifficultyLevel.DEADLY}&partyLevel=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEncounters);
    });
  });

  describe('getPublicEncounterById', () => {
    it('should get a public encounter by ID', () => {
      const mockEncounter: Encounter = { id: '123', name: 'Dragon Lair' };

      service.getPublicEncounterById('123').subscribe(encounter => {
        expect(encounter).toEqual(mockEncounter);
      });

      const req = httpMock.expectOne(`${apiUrl}/encounter/123`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEncounter);
    });
  });

  describe('getRandomEncounter', () => {
    it('should get a random encounter without filters', () => {
      const mockEncounter: Encounter = { id: '1', name: 'Random Encounter' };

      service.getRandomEncounter().subscribe(encounter => {
        expect(encounter).toEqual(mockEncounter);
      });

      const req = httpMock.expectOne(`${apiUrl}/encounter/random`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEncounter);
    });

    it('should get a random encounter with filters', () => {
      const mockEncounter: Encounter = { id: '1', name: 'Random Mountain Encounter' };

      service.getRandomEncounter(Region.MOUNTAIN, Rarity.RARE, DifficultyLevel.HARD, 5).subscribe(encounter => {
        expect(encounter).toEqual(mockEncounter);
      });

      const req = httpMock.expectOne(`${apiUrl}/encounter/random?region=${Region.MOUNTAIN}&rarity=${Rarity.RARE}&difficultyLevel=${DifficultyLevel.HARD}&partyLevel=5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEncounter);
    });
  });

  describe('createPublicEncounter', () => {
    it('should create a new public encounter', () => {
      const newEncounter: Encounter = { name: 'New Encounter', partyLevel: 5 };

      service.createPublicEncounter(newEncounter).subscribe(response => {
        expect(response.status).toBe(201);
      });

      const req = httpMock.expectOne(`${apiUrl}/encounter`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newEncounter);
      req.flush(null, { status: 201, statusText: 'Created', headers: { 'Location': `${apiUrl}/encounter/123` } });
    });
  });

  describe('updatePublicEncounter', () => {
    it('should update a public encounter', () => {
      const updatedEncounter: Encounter = { id: '123', name: 'Updated Encounter' };

      service.updatePublicEncounter('123', updatedEncounter).subscribe(response => {
        expect(response).toBeDefined();
      });

      const req = httpMock.expectOne(`${apiUrl}/encounter/123`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedEncounter);
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  describe('moveEncounterToUserSpace', () => {
    it('should move an encounter to user space', () => {
      service.moveEncounterToUserSpace('encounter123', 'user456').subscribe(response => {
        expect(response).toBeDefined();
      });

      const req = httpMock.expectOne(`${apiUrl}/encounter/encounter123/user/user456/move`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({});
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  describe('getAllEncountersForUser', () => {
    it('should get all encounters for a user without filters', () => {
      const mockEncounters: Encounter[] = [
        { id: '1', name: 'User Encounter 1' },
        { id: '2', name: 'User Encounter 2' }
      ];

      service.getAllEncountersForUser('user123').subscribe(encounters => {
        expect(encounters).toEqual(mockEncounters);
        expect(encounters.length).toBe(2);
      });

      const req = httpMock.expectOne(`${apiUrl}/privateEncounter/user123`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEncounters);
    });

    it('should get user encounters with all filters', () => {
      const mockEncounters: Encounter[] = [
        { id: '1', name: 'Filtered User Encounter' }
      ];

      service.getAllEncountersForUser('user123', Region.FOREST, Rarity.UNCOMMON, DifficultyLevel.MEDIUM, 8).subscribe(encounters => {
        expect(encounters).toEqual(mockEncounters);
      });

      const req = httpMock.expectOne(`${apiUrl}/privateEncounter/user123?region=${Region.FOREST}&rarity=${Rarity.UNCOMMON}&difficultyLevel=${DifficultyLevel.MEDIUM}&partyLevel=8`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEncounters);
    });
  });

  describe('getEncounterForUser', () => {
    it('should get a specific encounter for a user', () => {
      const mockEncounter: Encounter = { id: 'enc123', name: 'User Encounter' };

      service.getEncounterForUser('enc123', 'user456').subscribe(encounter => {
        expect(encounter).toEqual(mockEncounter);
      });

      const req = httpMock.expectOne(`${apiUrl}/privateEncounter/enc123/user/user456`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEncounter);
    });
  });

  describe('createEncounterForUser', () => {
    it('should create an encounter for a user', () => {
      const newEncounter: Encounter = { name: 'New User Encounter', partyLevel: 3 };

      service.createEncounterForUser('user123', newEncounter).subscribe(response => {
        expect(response.status).toBe(201);
      });

      const req = httpMock.expectOne(`${apiUrl}/privateEncounter/user123`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newEncounter);
      req.flush(null, { status: 201, statusText: 'Created', headers: { 'Location': `${apiUrl}/privateEncounter/123` } });
    });
  });

  describe('updateEncounterForUser', () => {
    it('should update an encounter for a user', () => {
      const updatedEncounter: Encounter = { id: 'enc123', name: 'Updated User Encounter', partyLevel: 5 };

      service.updateEncounterForUser('enc123', 'user456', updatedEncounter).subscribe(response => {
        expect(response).toBeDefined();
      });

      const req = httpMock.expectOne(`${apiUrl}/privateEncounter/enc123/user/user456`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedEncounter);
      req.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('should update encounter with creature IDs', () => {
      const encounterWithCreatureIds: Encounter = {
        id: 'enc123',
        name: 'Encounter with Creatures',
        creatures: ['creature1', 'creature2', 'creature3'] as any
      };

      service.updateEncounterForUser('enc123', 'user456', encounterWithCreatureIds).subscribe(response => {
        expect(response).toBeDefined();
      });

      const req = httpMock.expectOne(`${apiUrl}/privateEncounter/enc123/user/user456`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.creatures).toEqual(['creature1', 'creature2', 'creature3']);
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  describe('deleteEncounterForUser', () => {
    it('should delete an encounter for a user', () => {
      service.deleteEncounterForUser('enc123', 'user456').subscribe(response => {
        expect(response).toBeDefined();
      });

      const req = httpMock.expectOne(`${apiUrl}/privateEncounter/enc123/user/user456`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CombatService, CombatState, CombatCreature } from './combat.service';

describe('CombatService', () => {
  let service: CombatService;
  let httpMock: HttpTestingController;
  const apiUrl = 'https://encounter-your-doom.onrender.com/datev/v1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CombatService]
    });
    service = TestBed.inject(CombatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('startCombat', () => {
    it('should start a combat session', () => {
      const mockCombatState: CombatState = {
        encounterId: 'enc123',
        userId: 'user456',
        creatures: [
          { id: 'c1', name: 'Dragon', currentHp: 100, maxHp: 100, armorClass: 18, initiative: 15, statusEffects: [] }
        ],
        currentTurn: 0,
        round: 1,
        isActive: true
      };

      service.startCombat('enc123', 'user456').subscribe(state => {
        expect(state).toEqual(mockCombatState);
        expect(state.isActive).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/combat/start`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ encounterId: 'enc123', userId: 'user456' });
      req.flush(mockCombatState);
    });
  });

  describe('getCombatState', () => {
    it('should get the current combat state', () => {
      const mockCombatState: CombatState = {
        encounterId: 'enc123',
        userId: 'user456',
        creatures: [],
        currentTurn: 2,
        round: 1,
        isActive: true
      };

      service.getCombatState('enc123', 'user456').subscribe(state => {
        expect(state).toEqual(mockCombatState);
      });

      const req = httpMock.expectOne(`${apiUrl}/combat/enc123/user/user456`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCombatState);
    });
  });

  describe('updateCreatureHp', () => {
    it('should update a creature\'s HP', () => {
      service.updateCreatureHp('enc123', 'user456', 'creature789', 50).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/combat/enc123/user/user456/creature/creature789/hp`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ currentHp: 50 });
      req.flush(null);
    });
  });

  describe('addStatusEffect', () => {
    it('should add a status effect to a creature', () => {
      service.addStatusEffect('enc123', 'user456', 'creature789', 'Poisoned').subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/combat/enc123/user/user456/creature/creature789/status`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ effect: 'Poisoned' });
      req.flush(null);
    });
  });

  describe('removeStatusEffect', () => {
    it('should remove a status effect from a creature', () => {
      service.removeStatusEffect('enc123', 'user456', 'creature789', 'Poisoned').subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/combat/enc123/user/user456/creature/creature789/status/Poisoned`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('updateInitiative', () => {
    it('should update a creature\'s initiative', () => {
      service.updateInitiative('enc123', 'user456', 'creature789', 20).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/combat/enc123/user/user456/creature/creature789/initiative`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ initiative: 20 });
      req.flush(null);
    });
  });

  describe('nextTurn', () => {
    it('should advance to the next turn', () => {
      const mockCombatState: CombatState = {
        encounterId: 'enc123',
        userId: 'user456',
        creatures: [],
        currentTurn: 1,
        round: 1,
        isActive: true
      };

      service.nextTurn('enc123', 'user456').subscribe(state => {
        expect(state).toEqual(mockCombatState);
      });

      const req = httpMock.expectOne(`${apiUrl}/combat/enc123/user/user456/next-turn`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockCombatState);
    });
  });

  describe('endCombat', () => {
    it('should end a combat session', () => {
      service.endCombat('enc123', 'user456').subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/combat/enc123/user/user456/end`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });
  });
});

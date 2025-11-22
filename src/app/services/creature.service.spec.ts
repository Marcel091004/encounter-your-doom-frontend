import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CreatureService } from './creature.service';
import { Creature } from '../models/creature.model';
import { Region, Rarity } from '../models/enums';

describe('CreatureService', () => {
  let service: CreatureService;
  let httpMock: HttpTestingController;
  const apiUrl = 'https://encounter-your-doom.onrender.com/datev/v1/creature';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CreatureService]
    });
    service = TestBed.inject(CreatureService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  const baseMockCreature = {
    initiative: 1,
    HP: 100,
    AC: 15,
    statBlock: { Str: 2, Dex: 1, Con: 2, Int: 1, Wis: 1, Cha: 1 },
    cr: '5',
    attack: [],
    Speed: 30
  };

  describe('getCreatures', () => {
    it('should get all creatures without filters', () => {
      const mockCreatures: Creature[] = [
        { ...baseMockCreature, id: '1', name: 'Dragon' },
        { ...baseMockCreature, id: '2', name: 'Goblin' }
      ];

      service.getCreatures().subscribe(creatures => {
        expect(creatures).toEqual(mockCreatures);
        expect(creatures.length).toBe(2);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockCreatures);
    });

    it('should get creatures with region filter', () => {
      const mockCreatures: Creature[] = [{ ...baseMockCreature, id: '1', name: 'Dragon', region: Region.MOUNTAIN }];

      service.getCreatures(Region.MOUNTAIN).subscribe(creatures => {
        expect(creatures).toEqual(mockCreatures);
      });

      const req = httpMock.expectOne(`${apiUrl}?region=${Region.MOUNTAIN}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCreatures);
    });

    it('should get creatures with rarity filter', () => {
      const mockCreatures: Creature[] = [{ ...baseMockCreature, id: '1', name: 'Dragon', rarity: Rarity.LEGENDARY }];

      service.getCreatures(undefined, Rarity.LEGENDARY).subscribe(creatures => {
        expect(creatures).toEqual(mockCreatures);
      });

      const req = httpMock.expectOne(`${apiUrl}?rarity=${Rarity.LEGENDARY}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCreatures);
    });

    it('should get creatures with CR filter', () => {
      const mockCreatures: Creature[] = [{ ...baseMockCreature, id: '1', name: 'Dragon', cr: '10' }];

      service.getCreatures(undefined, undefined, '10').subscribe(creatures => {
        expect(creatures).toEqual(mockCreatures);
      });

      const req = httpMock.expectOne(`${apiUrl}?cr=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCreatures);
    });

    it('should get creatures with all filters', () => {
      const mockCreatures: Creature[] = [
        { ...baseMockCreature, id: '1', name: 'Dragon', region: Region.MOUNTAIN, rarity: Rarity.LEGENDARY, cr: '10' }
      ];

      service.getCreatures(Region.MOUNTAIN, Rarity.LEGENDARY, '10').subscribe(creatures => {
        expect(creatures).toEqual(mockCreatures);
      });

      const req = httpMock.expectOne(`${apiUrl}?region=${Region.MOUNTAIN}&rarity=${Rarity.LEGENDARY}&cr=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCreatures);
    });
  });

  describe('getCreatureById', () => {
    it('should get a creature by ID', () => {
      const mockCreature: Creature = { ...baseMockCreature, id: '123', name: 'Dragon' };

      service.getCreatureById('123').subscribe(creature => {
        expect(creature).toEqual(mockCreature);
      });

      const req = httpMock.expectOne(`${apiUrl}/123`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCreature);
    });
  });

  describe('getRandomCreature', () => {
    it('should get a random creature without filters', () => {
      const mockCreature: Creature = {
        name: 'Dragon',
        initiative: 1,
        HP: 100,
        AC: 15,
        statBlock: { Str: 2, Dex: 1, Con: 2, Int: 1, Wis: 1, Cha: 1 },
        cr: '5',
        attack: [],
        Speed: 30
      };

      service.getRandomCreature().subscribe(creature => {
        expect(creature).toEqual(mockCreature);
      });

      const req = httpMock.expectOne(`${apiUrl}/random`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCreature);
    });

    it('should get a random creature with filters', () => {
      const mockCreature: Creature = {
        name: 'Dragon',
        initiative: 1,
        HP: 100,
        AC: 15,
        statBlock: { Str: 2, Dex: 1, Con: 2, Int: 1, Wis: 1, Cha: 1 },
        cr: '5',
        attack: [],
        Speed: 30,
        region: Region.MOUNTAIN
      };

      service.getRandomCreature(Region.MOUNTAIN, Rarity.RARE, '5').subscribe(creature => {
        expect(creature).toEqual(mockCreature);
      });

      const req = httpMock.expectOne(`${apiUrl}/random?region=${Region.MOUNTAIN}&rarity=${Rarity.RARE}&cr=5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCreature);
    });
  });

  describe('createCreature', () => {
    it('should create a new creature', () => {
      const newCreature: Creature = {
        name: 'New Dragon',
        initiative: 2,
        HP: 100,
        AC: 18,
        statBlock: { Str: 3, Dex: 2, Con: 3, Int: 2, Wis: 2, Cha: 2 },
        cr: '10',
        attack: [],
        Speed: 40
      };

      service.createCreature(newCreature).subscribe(response => {
        expect(response.status).toBe(201);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newCreature);
      req.flush(null, { status: 201, statusText: 'Created', headers: { 'Location': `${apiUrl}/123` } });
    });
  });

  describe('updateCreature', () => {
    it('should update an existing creature', () => {
      const updatedCreature: Creature = {
        Id: '123',
        name: 'Updated Dragon',
        initiative: 3,
        HP: 150,
        AC: 20,
        statBlock: { Str: 4, Dex: 2, Con: 4, Int: 2, Wis: 2, Cha: 3 },
        cr: '15',
        attack: [],
        Speed: 50
      };

      service.updateCreature('123', updatedCreature).subscribe(response => {
        expect(response).toBeDefined();
      });

      const req = httpMock.expectOne(`${apiUrl}/123`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedCreature);
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });
});

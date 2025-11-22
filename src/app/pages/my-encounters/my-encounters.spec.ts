import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { MyEncounters } from './my-encounters';
import { EncounterService } from '../../services/encounter.service';
import { CreatureService } from '../../services/creature.service';
import { UserService } from '../../services/user.service';
import { Encounter } from '../../models/encounter.model';
import { Creature } from '../../models/creature.model';

describe('MyEncounters - Edit Functionality', () => {
  let component: MyEncounters;
  let fixture: ComponentFixture<MyEncounters>;
  let encounterService: jasmine.SpyObj<EncounterService>;
  let creatureService: jasmine.SpyObj<CreatureService>;
  let userService: jasmine.SpyObj<UserService>;

  const mockEncounter: Encounter = {
    Id: 'enc123',
    name: 'Test Encounter',
    description: 'A test encounter',
    creatures: [
      { Id: 'creature1', name: 'Dragon', HP: 100, AC: 18, cr: '10', initiative: 2 } as Creature
    ]
  };

  const mockCreatures: Creature[] = [
    { Id: 'creature1', name: 'Dragon', HP: 100, AC: 18, cr: '10', initiative: 2 } as Creature,
    { Id: 'creature2', name: 'Goblin', HP: 10, AC: 14, cr: '1/4', initiative: 1 } as Creature,
    { Id: 'creature3', name: 'Orc', HP: 15, AC: 13, cr: '1/2', initiative: 0 } as Creature
  ];

  beforeEach(async () => {
    const encounterServiceSpy = jasmine.createSpyObj('EncounterService', [
      'getAllEncountersForUser',
      'updateEncounterForUser',
      'deleteEncounterForUser'
    ]);
    const creatureServiceSpy = jasmine.createSpyObj('CreatureService', ['getCreatures', 'getCreatureById']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['ensureUserId']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        RouterTestingModule,
        MyEncounters
      ],
      providers: [
        { provide: EncounterService, useValue: encounterServiceSpy },
        { provide: CreatureService, useValue: creatureServiceSpy },
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents();

    encounterService = TestBed.inject(EncounterService) as jasmine.SpyObj<EncounterService>;
    creatureService = TestBed.inject(CreatureService) as jasmine.SpyObj<CreatureService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;

    userService.ensureUserId.and.returnValue('user123');
    encounterService.getAllEncountersForUser.and.returnValue(of([mockEncounter]));
    creatureService.getCreatures.and.returnValue(of(mockCreatures));

    fixture = TestBed.createComponent(MyEncounters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('startEditing', () => {
    it('should enter edit mode and create a deep copy of the encounter', () => {
      component.startEditing(mockEncounter);

      expect(component.isEditMode).toBe(true);
      expect(component.editingEncounter).toBeTruthy();
      expect(component.editingEncounter).not.toBe(mockEncounter);
      expect(component.editingEncounter?.name).toBe(mockEncounter.name);
    });

    it('should load all creatures when entering edit mode', (done) => {
      component.startEditing(mockEncounter);

      // Wait for async operations
      setTimeout(() => {
        expect(component['allCreatures'].length).toBe(3);
        done();
      }, 100);
    });
  });

  describe('addCreatureToEncounter', () => {
    beforeEach(() => {
      component.startEditing(mockEncounter);
      component['allCreatures'] = mockCreatures;
    });

    it('should add a creature to the editing encounter', () => {
      const initialCount = component.editingEncounter?.creatures?.length || 0;
      
      component.addCreatureToEncounter('creature2');

      expect(component.editingEncounter?.creatures?.length).toBe(initialCount + 1);
      expect(component.successMessage).toContain('Added Goblin');
    });

    it('should not add a creature that is already in the encounter', () => {
      component.addCreatureToEncounter('creature1');

      expect(component.error).toContain('already in the encounter');
      expect(component.editingEncounter?.creatures?.length).toBe(1);
    });

    it('should show error if creature is not found', () => {
      component.addCreatureToEncounter('nonexistent');

      expect(component.error).toContain('Creature not found');
    });

    it('should initialize creatures array if undefined', () => {
      component.editingEncounter!.creatures = undefined;
      
      component.addCreatureToEncounter('creature2');

      expect(component.editingEncounter?.creatures).toBeDefined();
      expect(component.editingEncounter?.creatures?.length).toBe(1);
    });
  });

  describe('removeCreatureFromEncounter', () => {
    beforeEach(() => {
      component.startEditing({
        ...mockEncounter,
        creatures: [mockCreatures[0], mockCreatures[1]]
      });
    });

    it('should remove a creature by index', () => {
      const initialCount = component.editingEncounter?.creatures?.length || 0;
      
      component.removeCreatureFromEncounter(0);

      expect(component.editingEncounter?.creatures?.length).toBe(initialCount - 1);
    });

    it('should handle invalid index gracefully', () => {
      const initialCount = component.editingEncounter?.creatures?.length || 0;
      
      component.removeCreatureFromEncounter(999);

      expect(component.editingEncounter?.creatures?.length).toBe(initialCount);
    });
  });

  describe('saveEncounter', () => {
    beforeEach(() => {
      component.startEditing(mockEncounter);
      component['allCreatures'] = mockCreatures;
      encounterService.updateEncounterForUser.and.returnValue(of(null));
    });

    it('should convert creature objects to IDs before saving', (done) => {
      component.addCreatureToEncounter('creature2');
      component.saveEncounter();

      setTimeout(() => {
        expect(encounterService.updateEncounterForUser).toHaveBeenCalled();
        const callArgs = encounterService.updateEncounterForUser.calls.mostRecent().args;
        const savedEncounter = callArgs[2];
        
        // Verify creatures are converted to IDs
        expect(Array.isArray(savedEncounter.creatures)).toBe(true);
        savedEncounter.creatures?.forEach((creature: any) => {
          expect(typeof creature).toBe('string');
        });
        done();
      }, 100);
    });

    it('should exit edit mode on successful save', (done) => {
      component.saveEncounter();

      setTimeout(() => {
        expect(component.isEditMode).toBe(false);
        expect(component.editingEncounter).toBeNull();
        expect(component.successMessage).toContain('updated successfully');
        done();
      }, 100);
    });

    it('should show error on save failure', (done) => {
      encounterService.updateEncounterForUser.and.returnValue(
        throwError(() => new Error('Save failed'))
      );

      component.saveEncounter();

      setTimeout(() => {
        expect(component.error).toContain('Failed to update');
        expect(component.isEditMode).toBe(true);
        done();
      }, 100);
    });

    it('should not save if encounter is invalid', () => {
      component.editingEncounter = null;
      
      component.saveEncounter();

      expect(encounterService.updateEncounterForUser).not.toHaveBeenCalled();
      expect(component.error).toContain('Invalid encounter');
    });
  });

  describe('availableCreatures', () => {
    beforeEach(() => {
      component.startEditing(mockEncounter);
      component['allCreatures'] = mockCreatures;
    });

    it('should exclude creatures already in the encounter', () => {
      const available = component.availableCreatures;

      expect(available.length).toBe(2); // Only creature2 and creature3
      expect(available.find(c => c.Id === 'creature1')).toBeUndefined();
    });

    it('should filter by search term (name)', () => {
      component.creatureSearchTerm = 'gob';

      const available = component.availableCreatures;

      expect(available.length).toBe(1);
      expect(available[0].name).toBe('Goblin');
    });

    it('should filter by search term (CR)', () => {
      component.creatureSearchTerm = '1/2';

      const available = component.availableCreatures;

      expect(available.length).toBe(1);
      expect(available[0].name).toBe('Orc');
    });

    it('should be case insensitive', () => {
      component.creatureSearchTerm = 'ORC';

      const available = component.availableCreatures;

      expect(available.length).toBe(1);
      expect(available[0].name).toBe('Orc');
    });
  });

  describe('cancelEditing', () => {
    it('should exit edit mode and clear editing encounter', () => {
      component.startEditing(mockEncounter);
      
      component.cancelEditing();

      expect(component.isEditMode).toBe(false);
      expect(component.editingEncounter).toBeNull();
    });
  });
});

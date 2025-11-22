import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EncounterService } from '../../services/encounter.service';
import { CreatureService } from '../../services/creature.service';
import { UserService } from '../../services/user.service';
import { Encounter } from '../../models/encounter.model';
import { Creature } from '../../models/creature.model';
import { Region, Rarity, DifficultyLevel } from '../../models/enums';

@Component({
  selector: 'app-create-encounter',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-encounter.html',
  styleUrl: './create-encounter.css',
})
export class CreateEncounter implements OnInit {
  encounter: Encounter = {
    name: '',
    description: '',
    partyLevel: 1,
    creatures: []
  };

  availableCreatures: Creature[] = [];
  selectedCreatureIds: string[] = [];
  
  loading = false;
  loadingCreatures = false;
  error: string | null = null;
  successMessage: string | null = null;
  isPrivate = false;

  // Filter properties
  creatureSearchTerm = '';
  creatureFilterCR = '';
  creatureFilterRegion = '';

  regions = Object.values(Region);
  rarities = Object.values(Rarity);
  difficulties = Object.values(DifficultyLevel);

  private userId = '';

  constructor(
    private encounterService: EncounterService,
    private creatureService: CreatureService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userId = this.userService.ensureUserId();
    this.loadCreatures();
  }

  loadCreatures() {
    this.loadingCreatures = true;
    this.creatureService.getCreatures().subscribe({
      next: (creatures) => {
        this.availableCreatures = creatures;
        this.loadingCreatures = false;
      },
      error: (err) => {
        console.error('Error loading creatures:', err);
        this.loadingCreatures = false;
      }
    });
  }

  toggleCreature(creatureId: string) {
    const index = this.selectedCreatureIds.indexOf(creatureId);
    if (index > -1) {
      this.selectedCreatureIds.splice(index, 1);
    } else {
      this.selectedCreatureIds.push(creatureId);
    }
    this.updateEncounterCreatures();
  }

  isCreatureSelected(creatureId: string): boolean {
    return this.selectedCreatureIds.includes(creatureId);
  }

  updateEncounterCreatures() {
    // Store creature objects for display purposes only
    // The actual API call will use creature IDs
  }

  createEncounter() {
    this.loading = true;
    this.error = null;
    this.successMessage = null;

    // Validate required fields
    if (!this.encounter.name) {
      this.error = 'Please provide an encounter name.';
      this.loading = false;
      return;
    }

    if (!this.encounter.description) {
      this.error = 'Please provide an encounter description.';
      this.loading = false;
      return;
    }

    if (!this.encounter.difficultyLevel) {
      this.error = 'Please select a difficulty level.';
      this.loading = false;
      return;
    }

    if (this.selectedCreatureIds.length === 0) {
      this.error = 'Please select at least one creature for the encounter.';
      this.loading = false;
      return;
    }

    // Build the encounter payload according to OpenAPI spec
    // creatures should be an array of UUIDs, not full creature objects
    const encounterPayload: any = {
      name: this.encounter.name,
      description: this.encounter.description,
      difficultyLevel: this.encounter.difficultyLevel,
      creatures: this.selectedCreatureIds  // Send only IDs as per OpenAPI spec
    };

    // Add optional fields if they have values
    if (this.encounter.Region) {
      encounterPayload.Region = this.encounter.Region;
    }
    if (this.encounter.partyLevel) {
      encounterPayload.partyLevel = this.encounter.partyLevel;
    }

    console.log('Creating encounter with payload:', encounterPayload);

    const createObservable = this.isPrivate
      ? this.encounterService.createEncounterForUser(this.userId, encounterPayload)
      : this.encounterService.createPublicEncounter(encounterPayload);

    createObservable.subscribe({
      next: () => {
        this.successMessage = `Encounter created successfully as ${this.isPrivate ? 'private' : 'public'}!`;
        this.loading = false;
        setTimeout(() => {
          this.router.navigate([this.isPrivate ? '/my-encounters' : '/encounters']);
        }, 1500);
      },
      error: (err) => {
        this.error = 'Failed to create encounter. Please try again.';
        this.loading = false;
        console.error('Error creating encounter:', err);
      }
    });
  }

  cancel() {
    this.router.navigate(['/encounters']);
  }

  formatRegion(region: string): string {
    return region.replace(/_/g, ' ');
  }

  formatRarity(rarity: string): string {
    return rarity.replace(/_/g, ' ');
  }

  formatDifficulty(difficulty: string): string {
    return difficulty.replace(/_/g, ' ');
  }

  getFilteredCreatures(): Creature[] {
    let filtered = this.availableCreatures;

    // Search by name
    if (this.creatureSearchTerm) {
      const searchLower = this.creatureSearchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchLower)
      );
    }

    // Filter by CR
    if (this.creatureFilterCR) {
      if (this.creatureFilterCR === '1') {
        filtered = filtered.filter(c => {
          const cr = parseFloat(c.cr || '0');
          return cr >= 1 && cr <= 5;
        });
      } else if (this.creatureFilterCR === '6') {
        filtered = filtered.filter(c => {
          const cr = parseFloat(c.cr || '0');
          return cr >= 6 && cr <= 10;
        });
      } else if (this.creatureFilterCR === '11') {
        filtered = filtered.filter(c => {
          const cr = parseFloat(c.cr || '0');
          return cr >= 11 && cr <= 15;
        });
      } else if (this.creatureFilterCR === '16') {
        filtered = filtered.filter(c => {
          const cr = parseFloat(c.cr || '0');
          return cr >= 16 && cr <= 20;
        });
      } else if (this.creatureFilterCR === '21') {
        filtered = filtered.filter(c => {
          const cr = parseFloat(c.cr || '0');
          return cr >= 21;
        });
      } else {
        filtered = filtered.filter(c => c.cr === this.creatureFilterCR);
      }
    }

    // Filter by Region
    if (this.creatureFilterRegion) {
      filtered = filtered.filter(c => c.Region === this.creatureFilterRegion);
    }

    return filtered;
  }
}

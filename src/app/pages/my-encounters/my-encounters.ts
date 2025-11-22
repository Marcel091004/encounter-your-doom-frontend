import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EncounterService } from '../../services/encounter.service';
import { CreatureService } from '../../services/creature.service';
import { UserService } from '../../services/user.service';
import { Encounter } from '../../models/encounter.model';
import { Creature } from '../../models/creature.model';
import { Modal } from '../../components/modal/modal';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-my-encounters',
  imports: [CommonModule, FormsModule, RouterLink, Modal],
  templateUrl: './my-encounters.html',
  styleUrl: './my-encounters.css',
})
export class MyEncounters implements OnInit {
  encounters: Encounter[] = [];
  loading = false;
  error: string | null = null;
  
  // Modal state
  isModalOpen = false;
  selectedEncounter: Encounter | null = null;
  isCreatureModalOpen = false;
  selectedCreature: Creature | null = null;
  
  // Edit mode
  isEditMode = false;
  editingEncounter: Encounter | null = null;
  successMessage: string | null = null;
  
  // Search/filter for creatures when editing
  creatureSearchTerm = '';
  
  private userId = '';
  private allCreatures: Creature[] = [];

  constructor(
    private encounterService: EncounterService,
    private creatureService: CreatureService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userId = this.userService.ensureUserId();
    this.loadMyEncounters();
    this.loadAllCreatures();
  }

  private loadAllCreatures() {
    this.creatureService.getCreatures().subscribe({
      next: (creatures) => {
        this.allCreatures = creatures;
      },
      error: (err) => {
        console.error('Error loading creatures:', err);
      }
    });
  }

  loadMyEncounters() {
    this.loading = true;
    this.error = null;

    this.encounterService.getAllEncountersForUser(this.userId).subscribe({
      next: (data) => {
        this.encounters = data;
        // Fetch full creature details for each encounter
        this.loadCreaturesForEncounters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load your encounters. Please try again.';
        this.loading = false;
        console.error('Error loading user encounters:', err);
      }
    });
  }

  private loadCreaturesForEncounters() {
    // For each encounter, if creatures is an array of strings (IDs), fetch the full creature objects
    this.encounters.forEach(encounter => {
      if (encounter.creatures && encounter.creatures.length > 0) {
        const firstCreature = encounter.creatures[0];
        // Check if creatures are just IDs (strings) rather than full objects
        if (typeof firstCreature === 'string') {
          const creatureIds = encounter.creatures as unknown as string[];
          const creatureRequests = creatureIds.map(id => this.creatureService.getCreatureById(id));
          
          if (creatureRequests.length > 0) {
            forkJoin(creatureRequests).subscribe({
              next: (creatures: Creature[]) => {
                encounter.creatures = creatures;
              },
              error: (err) => {
                console.error('Error loading creatures for encounter:', err);
                // Keep IDs as fallback - show just the ID
                encounter.creatures = creatureIds.map(id => ({
                  Id: id,
                  name: `Creature ${id.substring(0, 8)}...`,
                  HP: 0,
                  AC: 0,
                  initiative: 0,
                  Speed: 0,
                  cr: '?',
                  statBlock: { Str: 0, Dex: 0, Con: 0, Int: 0, Wis: 0, Cha: 0 },
                  attack: []
                } as Creature));
              }
            });
          }
        }
      }
    });
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

  openEncounterModal(encounter: Encounter, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.selectedEncounter = encounter;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedEncounter = null;
  }

  openCreatureModal(creature: Creature, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.selectedCreature = creature;
    this.isCreatureModalOpen = true;
  }

  closeCreatureModal() {
    this.isCreatureModalOpen = false;
    this.selectedCreature = null;
  }

  getCreatureRegion(creature: Creature): string {
    const region = creature.Region || creature.region;
    return region ? this.formatRegion(region as string) : '';
  }

  getCreatureRarity(creature: Creature): string {
    const rarity = creature.Rarity || creature.rarity;
    return rarity ? this.formatRarity(rarity as string) : '';
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  formatDamageType(damageType: string | string[]): string {
    return Array.isArray(damageType) ? damageType.join(', ') : damageType;
  }

  startEditing(encounter: Encounter, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.editingEncounter = JSON.parse(JSON.stringify(encounter)); // Deep copy
    this.isEditMode = true;
    this.closeModal();
  }

  cancelEditing() {
    this.isEditMode = false;
    this.editingEncounter = null;
    this.error = null;
    this.successMessage = null;
  }

  saveEncounter() {
    if (!this.editingEncounter || !this.editingEncounter.Id) {
      this.error = 'Cannot save: Invalid encounter';
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    // Prepare encounter for backend - convert creature objects to IDs
    const encounterToSave = {
      ...this.editingEncounter,
      creatures: this.editingEncounter.creatures?.map(c => c.Id || c.id) as any
    };

    this.encounterService.updateEncounterForUser(
      this.editingEncounter.Id,
      this.userId,
      encounterToSave
    ).subscribe({
      next: () => {
        this.successMessage = 'Encounter updated successfully!';
        this.loading = false;
        this.isEditMode = false;
        this.editingEncounter = null;
        this.loadMyEncounters();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.error = 'Failed to update encounter. Please try again.';
        this.loading = false;
        console.error('Error updating encounter:', err);
        console.error('Error details:', err.error);
      }
    });
  }

  deleteEncounter(encounter: Encounter, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }

    if (!encounter.Id) {
      this.error = 'Cannot delete: Invalid encounter';
      return;
    }

    if (!confirm(`Are you sure you want to delete "${encounter.name}"? This action cannot be undone.`)) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.encounterService.deleteEncounterForUser(encounter.Id, this.userId).subscribe({
      next: () => {
        this.successMessage = 'Encounter deleted successfully!';
        this.loading = false;
        this.loadMyEncounters();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.error = 'Failed to delete encounter. Please try again.';
        this.loading = false;
        console.error('Error deleting encounter:', err);
      }
    });
  }

  addCreatureToEncounter(creatureId: string) {
    if (!this.editingEncounter) {
      console.error('No encounter being edited');
      return;
    }

    const creature = this.allCreatures.find(c => (c.Id || c.id) === creatureId);
    if (!creature) {
      this.error = `Creature not found. Available creatures: ${this.allCreatures.length}`;
      setTimeout(() => this.error = null, 3000);
      console.error('Creature not found with ID:', creatureId, 'Available:', this.allCreatures.length);
      return;
    }

    if (!this.editingEncounter.creatures) {
      this.editingEncounter.creatures = [];
    }

    // Check if creature is already in encounter
    const exists = this.editingEncounter.creatures.some(
      c => (c.Id || c.id) === creatureId
    );

    if (exists) {
      this.error = 'This creature is already in the encounter';
      setTimeout(() => this.error = null, 3000);
      return;
    }

    this.editingEncounter.creatures.push(creature);
    this.successMessage = `Added ${creature.name} to encounter`;
    setTimeout(() => this.successMessage = null, 2000);
  }

  removeCreatureFromEncounter(index: number) {
    if (!this.editingEncounter || !this.editingEncounter.creatures) return;
    this.editingEncounter.creatures.splice(index, 1);
  }

  get availableCreatures(): Creature[] {
    if (!this.editingEncounter) return this.allCreatures;
    
    const encounterCreatureIds = (this.editingEncounter.creatures || []).map(
      c => c.Id || c.id
    );
    
    let filtered = this.allCreatures.filter(
      c => !encounterCreatureIds.includes(c.Id || c.id)
    );
    
    // Apply search filter
    if (this.creatureSearchTerm && this.creatureSearchTerm.trim()) {
      const term = this.creatureSearchTerm.toLowerCase().trim();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(term) ||
        (c.cr && c.cr.toString().includes(term))
      );
    }
    
    return filtered;
  }

  viewCreatureDetails(creature: Creature, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.selectedCreature = creature;
    this.isCreatureModalOpen = true;
  }
}

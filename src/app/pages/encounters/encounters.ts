import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EncounterService } from '../../services/encounter.service';
import { CreatureService } from '../../services/creature.service';
import { UserService } from '../../services/user.service';
import { Encounter } from '../../models/encounter.model';
import { Creature } from '../../models/creature.model';
import { Region, Rarity, DifficultyLevel } from '../../models/enums';
import { Modal } from '../../components/modal/modal';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-encounters',
  imports: [CommonModule, FormsModule, RouterLink, Modal],
  templateUrl: './encounters.html',
  styleUrl: './encounters.css',
})
export class Encounters implements OnInit {
  encounters: Encounter[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Modal
  isModalOpen = false;
  selectedEncounter: Encounter | null = null;
  isCreatureModalOpen = false;
  selectedCreature: Creature | null = null;

  // Filters
  selectedRegion: Region | '' = '';
  selectedRarity: Rarity | '' = '';
  selectedDifficulty: DifficultyLevel | '' = '';
  selectedPartyLevel = '';

  // Enums for templates
  regions = Object.values(Region);
  rarities = Object.values(Rarity);
  difficulties = Object.values(DifficultyLevel);

  private userId = '';

  constructor(
    private encounterService: EncounterService,
    private creatureService: CreatureService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userId = this.userService.ensureUserId();
    this.loadEncounters();
  }

  loadEncounters() {
    this.loading = true;
    this.error = null;
    this.successMessage = null;

    const region = this.selectedRegion || undefined;
    const rarity = this.selectedRarity || undefined;
    const difficulty = this.selectedDifficulty || undefined;
    const partyLevel = this.selectedPartyLevel ? parseInt(this.selectedPartyLevel) : undefined;

    this.encounterService.getAllPublicEncounters(region, rarity, difficulty, partyLevel).subscribe({
      next: (data) => {
        this.encounters = data;
        // Fetch full creature details for each encounter
        this.loadCreaturesForEncounters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load encounters. Please try again.';
        this.loading = false;
        console.error('Error loading encounters:', err);
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

  getRandomEncounter() {
    this.loading = true;
    this.error = null;
    this.successMessage = null;

    const region = this.selectedRegion || undefined;
    const rarity = this.selectedRarity || undefined;
    const difficulty = this.selectedDifficulty || undefined;
    const partyLevel = this.selectedPartyLevel ? parseInt(this.selectedPartyLevel) : undefined;

    this.encounterService.getRandomEncounter(region, rarity, difficulty, partyLevel).subscribe({
      next: (data) => {
        this.encounters = [data];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to get random encounter. Please try again.';
        this.loading = false;
        console.error('Error getting random encounter:', err);
      }
    });
  }

  copyToPrivate(encounter: Encounter) {
    // Use Id (capital I) to match OpenAPI spec, fallback to id for backward compatibility
    const encounterId = encounter.Id || encounter.id;
    
    if (!encounterId) {
      this.error = 'Invalid encounter ID';
      return;
    }

    this.error = null;
    this.successMessage = null;

    this.encounterService.moveEncounterToUserSpace(encounterId, this.userId).subscribe({
      next: () => {
        this.successMessage = 'Encounter successfully copied to your private collection!';
        setTimeout(() => this.successMessage = null, 5000);
      },
      error: (err) => {
        this.error = 'Failed to copy encounter. Please try again.';
        console.error('Error copying encounter:', err);
        setTimeout(() => this.error = null, 5000);
      }
    });
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

  copyToPrivateFromModal(encounter: Encounter) {
    this.copyToPrivate(encounter);
    this.closeModal();
  }

  clearFilters() {
    this.selectedRegion = '';
    this.selectedRarity = '';
    this.selectedDifficulty = '';
    this.selectedPartyLevel = '';
    this.loadEncounters();
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

  getCreatureRegion(creature: Creature): string {
    const region = creature.Region || creature.region;
    return region ? this.formatRegion(region as string) : '';
  }

  getCreatureRarity(creature: Creature): string {
    const rarity = creature.Rarity || creature.rarity;
    return rarity ? this.formatRarity(rarity as string) : '';
  }
}

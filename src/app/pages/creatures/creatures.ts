import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CreatureService } from '../../services/creature.service';
import { Creature } from '../../models/creature.model';
import { Region, Rarity } from '../../models/enums';
import { Modal } from '../../components/modal/modal';

@Component({
  selector: 'app-creatures',
  imports: [CommonModule, FormsModule, RouterLink, Modal],
  templateUrl: './creatures.html',
  styleUrl: './creatures.css',
})
export class Creatures implements OnInit {
  creatures: Creature[] = [];
  loading = false;
  error: string | null = null;

  // Modal
  isModalOpen = false;
  selectedCreature: Creature | null = null;

  // Filters
  selectedRegion: Region | '' = '';
  selectedRarity: Rarity | '' = '';
  selectedCr = '';

  // Enums for templates
  regions = Object.values(Region);
  rarities = Object.values(Rarity);

  constructor(private creatureService: CreatureService) {}

  ngOnInit() {
    this.loadCreatures();
  }

  loadCreatures() {
    this.loading = true;
    this.error = null;

    const region = this.selectedRegion || undefined;
    const rarity = this.selectedRarity || undefined;
    const cr = this.selectedCr || undefined;

    this.creatureService.getCreatures(region, rarity, cr).subscribe({
      next: (data) => {
        this.creatures = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load creatures. Please try again.';
        this.loading = false;
        console.error('Error loading creatures:', err);
      }
    });
  }

  getRandomCreature() {
    this.loading = true;
    this.error = null;

    const region = this.selectedRegion || undefined;
    const rarity = this.selectedRarity || undefined;
    const cr = this.selectedCr || undefined;

    this.creatureService.getRandomCreature(region, rarity, cr).subscribe({
      next: (data) => {
        this.creatures = [data];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to get random creature. Please try again.';
        this.loading = false;
        console.error('Error getting random creature:', err);
      }
    });
  }

  clearFilters() {
    this.selectedRegion = '';
    this.selectedRarity = '';
    this.selectedCr = '';
    this.loadCreatures();
  }

  openCreatureModal(creature: Creature) {
    this.selectedCreature = creature;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedCreature = null;
  }

  formatRegion(region: string): string {
    return region.replace(/_/g, ' ');
  }

  formatRarity(rarity: string): string {
    return rarity.replace(/_/g, ' ');
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  formatDamageType(damageType: string | string[]): string {
    return Array.isArray(damageType) ? damageType.join(', ') : damageType;
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CreatureService } from '../../services/creature.service';
import { Creature, Attack } from '../../models/creature.model';
import { Region, Rarity } from '../../models/enums';

@Component({
  selector: 'app-create-creature',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-creature.html',
  styleUrl: './create-creature.css',
})
export class CreateCreature {
  creature: Creature = {
    name: '',
    initiative: 0,
    HP: 0,
    AC: 0,
    statBlock: {
      Str: 0,
      Dex: 0,
      Con: 0,
      Int: 0,
      Wis: 0,
      Cha: 0
    },
    cr: '',
    attack: [],
    Speed: 30,
    description: '',
    statusEffects: [],
    resistances: [],
    immunities: [],
    weaknesses: [],
    traits: []
  };

  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Defense inputs (comma-separated strings)
  resistancesInput = '';
  immunitiesInput = '';
  weaknessesInput = '';

  regions = Object.values(Region);
  rarities = Object.values(Rarity);

  constructor(
    private creatureService: CreatureService,
    private router: Router
  ) {}

  createCreature() {
    this.loading = true;
    this.error = null;
    this.successMessage = null;

    // Validate required fields with specific error messages
    if (!this.creature.name || this.creature.name.trim().length === 0) {
      this.error = 'Creature name is required. Please provide a name for your creature.';
      this.loading = false;
      return;
    }

    if (!this.creature.cr || this.creature.cr.trim().length === 0) {
      this.error = 'Challenge Rating (CR) is required. Examples: "1", "1/2", "5", "20"';
      this.loading = false;
      return;
    }

    if (!this.creature.Speed || this.creature.Speed <= 0) {
      this.error = 'Speed is required and must be greater than 0.';
      this.loading = false;
      return;
    }

    if (!this.creature.HP || this.creature.HP <= 0) {
      this.error = 'Hit Points (HP) is required and must be greater than 0.';
      this.loading = false;
      return;
    }

    if (!this.creature.AC || this.creature.AC < 0) {
      this.error = 'Armor Class (AC) is required and cannot be negative.';
      this.loading = false;
      return;
    }

    if (this.creature.initiative === null || this.creature.initiative === undefined) {
      this.error = 'Initiative Bonus is required.';
      this.loading = false;
      return;
    }

    if (!this.creature.statBlock) {
      this.error = 'Stat Block is required. Please fill in all ability scores.';
      this.loading = false;
      return;
    }

    if (!this.creature.attack || this.creature.attack.length === 0) {
      this.error = 'At least one attack is required. Click "Add Attack" to create an attack.';
      this.loading = false;
      return;
    }

    // Validate attacks
    for (let i = 0; i < this.creature.attack.length; i++) {
      const attack = this.creature.attack[i];
      if (!attack.name || attack.name.trim().length === 0) {
        this.error = `Attack ${i + 1} needs a name. Please provide a name for all attacks.`;
        this.loading = false;
        return;
      }
      
      // Validate damage format if provided
      if (attack.damage && attack.damage.trim().length > 0) {
        if (!this.isValidDiceNotation(attack.damage)) {
          this.error = `Attack ${i + 1} has invalid damage format: "${attack.damage}". Use dice notation like "2d6+3", "1d8", or "3d10-1".`;
          this.loading = false;
          return;
        }
      }
    }

    // Process defense inputs (convert comma-separated strings to arrays)
    if (this.resistancesInput.trim()) {
      this.creature.resistances = this.resistancesInput.split(',').map(r => r.trim()).filter(r => r);
    }
    if (this.immunitiesInput.trim()) {
      this.creature.immunities = this.immunitiesInput.split(',').map(i => i.trim()).filter(i => i);
    }
    if (this.weaknessesInput.trim()) {
      this.creature.weaknesses = this.weaknessesInput.split(',').map(w => w.trim()).filter(w => w);
    }

    this.creatureService.createCreature(this.creature).subscribe({
      next: () => {
        this.successMessage = 'Creature created successfully!';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/creatures']);
        }, 1500);
      },
      error: (err) => {
        const errorMessage = err?.error?.message || err?.message || 'Unknown error';
        this.error = `Failed to create creature: ${errorMessage}. Please check your input and try again.`;
        this.loading = false;
        console.error('Error creating creature:', err);
      }
    });
  }

  cancel() {
    this.router.navigate(['/creatures']);
  }

  /**
   * Validates dice notation format (e.g., "2d6+3", "1d8", "3d10-1")
   */
  isValidDiceNotation(notation: string): boolean {
    if (!notation || notation.trim().length === 0) {
      return true; // Empty is valid (optional field)
    }
    
    // Pattern: XdY or XdY+Z or XdY-Z where X, Y, Z are positive integers
    const pattern = /^\d+d\d+(?:\s*[+-]\s*\d+)?$/i;
    return pattern.test(notation.trim());
  }

  formatRegion(region: string): string {
    return region.replace(/_/g, ' ');
  }

  formatRarity(rarity: string): string {
    return rarity.replace(/_/g, ' ');
  }

  // Attack management
  addAttack() {
    if (!this.creature.attack) {
      this.creature.attack = [];
    }
    this.creature.attack.push({
      name: '',
      attackBonus: 0,
      damage: '',
      damageType: [],
      range: '',
      description: ''
    });
  }

  removeAttack(index: number) {
    if (this.creature.attack) {
      this.creature.attack.splice(index, 1);
    }
  }
}

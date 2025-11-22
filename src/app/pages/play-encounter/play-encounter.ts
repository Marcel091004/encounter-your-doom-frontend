import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EncounterService } from '../../services/encounter.service';
import { CreatureService } from '../../services/creature.service';
import { UserService } from '../../services/user.service';
import { CombatService } from '../../services/combat.service';
import { Encounter } from '../../models/encounter.model';
import { Creature } from '../../models/creature.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-play-encounter',
  imports: [CommonModule, RouterLink],
  templateUrl: './play-encounter.html',
  styleUrl: './play-encounter.css',
})
export class PlayEncounter implements OnInit {
  encounter: Encounter | null = null;
  loading = false;
  error: string | null = null;
  starting = false;
  private userId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private encounterService: EncounterService,
    private creatureService: CreatureService,
    private userService: UserService,
    private combatService: CombatService
  ) {}

  ngOnInit() {
    this.userId = this.userService.ensureUserId();
    const encounterId = this.route.snapshot.paramMap.get('id');
    
    if (encounterId) {
      this.loadEncounter(encounterId);
    } else {
      this.error = 'Invalid encounter ID';
    }
  }

  loadEncounter(encounterId: string) {
    this.loading = true;
    this.error = null;

    this.encounterService.getEncounterForUser(encounterId, this.userId).subscribe({
      next: (data) => {
        this.encounter = data;
        this.loadCreaturesForEncounter();
      },
      error: (err) => {
        this.error = 'Failed to load encounter. Please try again.';
        this.loading = false;
        console.error('Error loading encounter:', err);
      }
    });
  }

  private loadCreaturesForEncounter() {
    if (!this.encounter || !this.encounter.creatures || this.encounter.creatures.length === 0) {
      this.loading = false;
      return;
    }

    const firstCreature = this.encounter.creatures[0];
    // Check if creatures are just IDs (strings) rather than full objects
    if (typeof firstCreature === 'string') {
      const creatureIds = this.encounter.creatures as unknown as string[];
      const creatureRequests = creatureIds.map(id => this.creatureService.getCreatureById(id));
      
      if (creatureRequests.length > 0) {
        forkJoin(creatureRequests).subscribe({
          next: (creatures: Creature[]) => {
            this.encounter!.creatures = creatures;
            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading creatures for encounter:', err);
            this.error = 'Failed to load creature details.';
            this.loading = false;
          }
        });
      } else {
        this.loading = false;
      }
    } else {
      // Creatures are already full objects
      this.loading = false;
    }
  }

  startCombat() {
    if (!this.encounter || !this.encounter.Id) {
      this.error = 'Cannot start combat: Invalid encounter';
      return;
    }

    this.starting = true;
    this.error = null;

    this.combatService.startEncounter(this.encounter.Id, this.userId).subscribe({
      next: () => {
        // Successfully started encounter, navigate to combat page with encounter ID
        this.router.navigate(['/combat', this.encounter!.Id]);
      },
      error: (err) => {
        this.error = 'Failed to start combat. Make sure the backend API is running.';
        this.starting = false;
        console.error('Error starting combat:', err);
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

  formatDamageType(damageType: string | string[]): string {
    return Array.isArray(damageType) ? damageType.join(', ') : damageType;
  }

  getCreatureRegion(creature: any): string {
    const region = creature.Region || creature.region;
    return region ? this.formatRegion(region) : '';
  }

  getCreatureRarity(creature: any): string {
    const rarity = creature.Rarity || creature.rarity;
    return rarity ? this.formatRarity(rarity) : '';
  }

  getRarityClass(creature: any): string {
    const rarity = creature.Rarity || creature.rarity;
    return rarity ? `rarity-${rarity.toLowerCase()}` : '';
  }
}

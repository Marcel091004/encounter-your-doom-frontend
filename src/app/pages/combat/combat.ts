import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CombatService, CombatState, CombatCreature } from '../../services/combat.service';
import { UserService } from '../../services/user.service';
import { DiceRoller } from '../../components/dice-roller/dice-roller';
import { AttackRollDisplay, AttackRollResult } from '../../components/attack-roll-display/attack-roll-display';

@Component({
  selector: 'app-combat',
  imports: [CommonModule, FormsModule, DiceRoller, AttackRollDisplay],
  templateUrl: './combat.html',
  styleUrl: './combat.css',
})
export class Combat implements OnInit {
  combatState = signal<CombatState | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Creature management
  selectedCreatureId = signal<string | null>(null);
  damageAmount = signal(0);
  healAmount = signal(0);
  newStatusEffect = signal('');
  
  // Initiative
  initiativeValues = signal<Record<string, number>>({});
  
  // Attack roll display
  attackRollResult = signal<AttackRollResult | null>(null);
  isAttackRollOpen = signal(false);
  
  private userId = '';
  private encounterId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private combatService: CombatService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userId = this.userService.ensureUserId();
    this.encounterId = this.route.snapshot.paramMap.get('id') || '';
    
    // Try to start combat - if no ID is provided, we'll try to get the active encounter
    this.startCombat();
  }

  startCombat() {
    this.loading.set(true);
    this.error.set(null);

    // Get the active encounter (should already be started from play-encounter page)
    this.combatService.getActiveEncounter(this.userId).subscribe({
      next: (activeEncounter: any) => {
        // Convert API response to combat state
        const creatures: CombatCreature[] = activeEncounter.creatures.map((c: any) => ({
          id: c.Id || c.id,
          name: c.name,
          currentHp: c.HP,
          maxHp: c.HP,
          armorClass: c.AC,
          initiative: 0,
          initiativeBonus: c.initiative || 0,
          statusEffects: c.statusEffects || [],
          attacks: c.attack || [],
          resistances: c.resistances || [],
          immunities: c.immunities || [],
          weaknesses: c.weaknesses || [],
          traits: c.traits || []
        }));

        const state: CombatState = {
          encounterId: this.encounterId,
          userId: this.userId,
          creatures: creatures,
          currentTurn: 0,
          round: 1,
          isActive: true
        };

        this.combatState.set(state);
        this.loading.set(false);
        
        // Initialize initiative values
        const initiatives: Record<string, number> = {};
        creatures.forEach(c => {
          initiatives[c.id] = c.initiative || 0;
        });
        this.initiativeValues.set(initiatives);
      },
      error: (err: any) => {
        this.error.set('Failed to load combat. Please try again.');
        this.loading.set(false);
        console.error('Error loading combat:', err);
      }
    });
  }

  sortedCreatures = computed(() => {
    const state = this.combatState();
    if (!state) return [];
    
    return [...state.creatures].sort((a, b) => b.initiative - a.initiative);
  });

  currentCreature = computed(() => {
    const state = this.combatState();
    const sorted = this.sortedCreatures();
    if (!state || sorted.length === 0) return null;
    
    return sorted[state.currentTurn % sorted.length];
  });

  selectCreature(creatureId: string) {
    this.selectedCreatureId.set(creatureId);
  }

  applyDamage(creatureId: string) {
    const damage = this.damageAmount();
    if (damage <= 0) return;

    const creature = this.combatState()?.creatures.find(c => c.id === creatureId);
    if (!creature) return;

    const newHp = Math.max(0, creature.currentHp - damage);
    
    // Update creature in active encounter with damage
    this.combatService.updateCreatureInActiveEncounter(this.userId, creatureId, { damage }).subscribe({
      next: () => {
        creature.currentHp = newHp;
        this.combatState.set({...this.combatState()!});
        this.damageAmount.set(0);
      },
      error: (err: any) => {
        console.error('Error updating HP:', err);
      }
    });
  }

  applyHealing(creatureId: string) {
    const heal = this.healAmount();
    if (heal <= 0) return;

    const creature = this.combatState()?.creatures.find(c => c.id === creatureId);
    if (!creature) return;

    const newHp = Math.min(creature.maxHp, creature.currentHp + heal);
    
    // Update creature in active encounter with heal
    this.combatService.updateCreatureInActiveEncounter(this.userId, creatureId, { heal }).subscribe({
      next: () => {
        creature.currentHp = newHp;
        this.combatState.set({...this.combatState()!});
        this.healAmount.set(0);
      },
      error: (err: any) => {
        console.error('Error updating HP:', err);
      }
    });
  }

  addStatusEffect(creatureId: string) {
    const effect = this.newStatusEffect().trim();
    if (!effect) return;

    const creature = this.combatState()?.creatures.find(c => c.id === creatureId);
    if (!creature) return;

    // Update creature with new status effect
    this.combatService.updateCreatureInActiveEncounter(this.userId, creatureId, { 
      statusEffects: [...creature.statusEffects, effect] 
    }).subscribe({
      next: () => {
        creature.statusEffects.push(effect);
        this.combatState.set({...this.combatState()!});
        this.newStatusEffect.set('');
      },
      error: (err: any) => {
        console.error('Error adding status effect:', err);
      }
    });
  }

  removeStatusEffect(creatureId: string, effect: string) {
    const creature = this.combatState()?.creatures.find(c => c.id === creatureId);
    if (!creature) return;

    const newEffects = creature.statusEffects.filter(e => e !== effect);

    // Update creature with removed status effect
    this.combatService.updateCreatureInActiveEncounter(this.userId, creatureId, { 
      statusEffects: newEffects 
    }).subscribe({
      next: () => {
        creature.statusEffects = newEffects;
        this.combatState.set({...this.combatState()!});
      },
      error: (err: any) => {
        console.error('Error removing status effect:', err);
      }
    });
  }

  updateInitiative(creatureId: string) {
    const initiative = this.initiativeValues()[creatureId];
    if (initiative === undefined) return;

    const creature = this.combatState()?.creatures.find(c => c.id === creatureId);
    if (creature) {
      creature.initiative = initiative;
      this.combatState.set({...this.combatState()!});
    }
  }

  rollInitiative() {
    const state = this.combatState();
    if (!state) return;

    // Roll 1d20 for each creature and add their initiative bonus
    state.creatures.forEach(creature => {
      const roll = Math.floor(Math.random() * 20) + 1;
      const bonus = creature.initiativeBonus || 0;
      const total = roll + bonus;
      creature.initiative = total;
      
      // Update initiative values for display
      const currentValues = this.initiativeValues();
      currentValues[creature.id] = total;
      this.initiativeValues.set({...currentValues});
    });

    // Sort creatures by initiative
    state.creatures.sort((a, b) => b.initiative - a.initiative);
    this.combatState.set({...state});
  }

  nextTurn() {
    const state = this.combatState();
    if (!state) return;

    // Handle turn advancement locally
    state.currentTurn++;
    if (state.currentTurn >= state.creatures.length) {
      state.currentTurn = 0;
      state.round++;
    }
    
    // Auto-select the creature whose turn it is now
    const sorted = this.sortedCreatures();
    if (sorted && sorted.length > state.currentTurn) {
      this.selectedCreatureId.set(sorted[state.currentTurn].id);
    }
    
    this.combatState.set({...state});
  }

  endCombat() {
    if (!confirm('Are you sure you want to end this combat?')) return;

    // Close the active encounter
    this.combatService.closeActiveEncounter(this.userId).subscribe({
      next: () => {
        this.router.navigate(['/my-encounters']);
      },
      error: (err: any) => {
        console.error('Error ending combat:', err);
      }
    });
  }

  getHpPercentage(creature: CombatCreature): number {
    return (creature.currentHp / creature.maxHp) * 100;
  }

  getHpColor(percentage: number): string {
    if (percentage > 75) return '#4ade80';
    if (percentage > 50) return '#fbbf24';
    if (percentage > 25) return '#fb923c';
    return '#ef4444';
  }

  isCurrentTurn(creatureId: string): boolean {
    return this.currentCreature()?.id === creatureId;
  }

  rollAttack(attack: any, creatureName: string) {
    if (!attack) return;
    
    // Roll attack (d20 + attackBonus)
    const attackRoll = Math.floor(Math.random() * 20) + 1;
    const attackBonus = attack.attackBonus || 0;
    const attackTotal = attackRoll + attackBonus;
    
    const isCrit = attackRoll === 20;
    const isFail = attackRoll === 1;
    
    // Roll damage if damage notation exists
    let damageRolls: number[] | undefined;
    let damageModifier: number | undefined;
    let damageTotal: number | undefined;
    
    if (attack.damage) {
      const damageData = this.rollDamageNotationDetailed(attack.damage, isCrit);
      if (damageData) {
        damageRolls = damageData.rolls;
        damageModifier = damageData.modifier;
        damageTotal = damageData.total;
      }
    }
    
    // Show attack roll display
    this.attackRollResult.set({
      attackRoll,
      attackBonus,
      attackTotal,
      isCritical: isCrit,
      isFail,
      damageRolls,
      damageModifier,
      damageTotal,
      attackName: attack.name,
      creatureName
    });
    this.isAttackRollOpen.set(true);
  }

  private rollDamageNotationDetailed(notation: string, isCritical: boolean): { rolls: number[], modifier: number, total: number } | null {
    // Parse notation like "2d6+3" or "1d8"
    const match = notation.match(/(\d+)d(\d+)(?:\s*([+-])\s*(\d+))?/i);
    if (!match) return null;
    
    let count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const modifier = match[3] && match[4] ? (match[3] === '+' ? parseInt(match[4]) : -parseInt(match[4])) : 0;
    
    // Double dice count on critical hit (not the modifier)
    if (isCritical) {
      count *= 2;
    }
    
    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
    const sum = rolls.reduce((a, b) => a + b, 0);
    const total = sum + modifier;
    
    return { rolls, modifier, total };
  }

  closeAttackRoll() {
    this.isAttackRollOpen.set(false);
  }
}

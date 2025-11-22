import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiceRoller } from '../../components/dice-roller/dice-roller';
import { CombatCreature } from '../../services/combat.service';

@Component({
  selector: 'app-demo',
  imports: [CommonModule, FormsModule, DiceRoller],
  templateUrl: './demo.html',
  styleUrl: './demo.css',
})
export class Demo implements OnInit {
  mockCreatures = signal<CombatCreature[]>([
    {
      id: '1',
      name: 'Ancient Red Dragon',
      currentHp: 450,
      maxHp: 546,
      armorClass: 22,
      initiative: 18,
      initiativeBonus: 0,
      statusEffects: ['Flying'],
      isPlayer: false,
      attacks: [
        { name: 'Bite', attackBonus: 17, damage: '2d10 + 10', damageType: ['piercing'], range: '15 ft.' },
        { name: 'Claw', attackBonus: 17, damage: '2d6 + 10', damageType: ['slashing'], range: '10 ft.' },
        { name: 'Fire Breath', attackBonus: 0, damage: '26d6', damageType: ['fire'], range: '90 ft. cone', description: 'DC 24 Dex save for half damage' }
      ]
    },
    {
      id: '2',
      name: 'Elf Wizard',
      currentHp: 42,
      maxHp: 42,
      armorClass: 15,
      initiative: 17,
      initiativeBonus: 3,
      statusEffects: [],
      isPlayer: true,
      attacks: [
        { name: 'Fire Bolt', attackBonus: 8, damage: '2d10', damageType: ['fire'], range: '120 ft.' },
        { name: 'Dagger', attackBonus: 5, damage: '1d4 + 3', damageType: ['piercing'], range: '5 ft. or 20/60 ft.' }
      ]
    },
    {
      id: '3',
      name: 'Dwarf Paladin',
      currentHp: 68,
      maxHp: 92,
      armorClass: 19,
      initiative: 12,
      initiativeBonus: -1,
      statusEffects: ['Blessed', 'Shield of Faith'],
      isPlayer: true,
      attacks: [
        { name: 'Warhammer', attackBonus: 9, damage: '1d8 + 5', damageType: ['bludgeoning'], range: '5 ft.' },
        { name: 'Divine Smite', attackBonus: 9, damage: '1d8 + 5 + 2d8', damageType: ['bludgeoning', 'radiant'], range: '5 ft.', description: 'Uses spell slot' }
      ]
    },
    {
      id: '4',
      name: 'Goblin Scout',
      currentHp: 7,
      maxHp: 7,
      armorClass: 13,
      initiative: 15,
      initiativeBonus: 2,
      statusEffects: [],
      isPlayer: false,
      attacks: [
        { name: 'Scimitar', attackBonus: 4, damage: '1d6 + 2', damageType: ['slashing'], range: '5 ft.' },
        { name: 'Shortbow', attackBonus: 4, damage: '1d6 + 2', damageType: ['piercing'], range: '80/320 ft.' }
      ]
    }
  ]);

  selectedCreatureId = signal<string>('2');
  currentTurn = signal(1);
  round = signal(2);
  damageAmount = signal(0);
  healAmount = signal(0);
  newStatusEffect = signal('');

  ngOnInit() {}

  sortedCreatures() {
    return [...this.mockCreatures()].sort((a, b) => b.initiative - a.initiative);
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
    const sorted = this.sortedCreatures();
    const currentIndex = this.currentTurn() % sorted.length;
    return sorted[currentIndex]?.id === creatureId;
  }

  selectCreature(id: string) {
    this.selectedCreatureId.set(id);
  }

  applyDamage(id: string) {
    const creatures = this.mockCreatures();
    const creature = creatures.find(c => c.id === id);
    if (creature && this.damageAmount() > 0) {
      creature.currentHp = Math.max(0, creature.currentHp - this.damageAmount());
      this.mockCreatures.set([...creatures]);
      this.damageAmount.set(0);
    }
  }

  applyHealing(id: string) {
    const creatures = this.mockCreatures();
    const creature = creatures.find(c => c.id === id);
    if (creature && this.healAmount() > 0) {
      creature.currentHp = Math.min(creature.maxHp, creature.currentHp + this.healAmount());
      this.mockCreatures.set([...creatures]);
      this.healAmount.set(0);
    }
  }

  addStatusEffect(id: string) {
    const effect = this.newStatusEffect().trim();
    if (!effect) return;
    
    const creatures = this.mockCreatures();
    const creature = creatures.find(c => c.id === id);
    if (creature) {
      creature.statusEffects.push(effect);
      this.mockCreatures.set([...creatures]);
      this.newStatusEffect.set('');
    }
  }

  removeStatusEffect(id: string, effect: string) {
    const creatures = this.mockCreatures();
    const creature = creatures.find(c => c.id === id);
    if (creature) {
      creature.statusEffects = creature.statusEffects.filter(e => e !== effect);
      this.mockCreatures.set([...creatures]);
    }
  }

  rollInitiative() {
    const creatures = this.mockCreatures();
    
    // Roll 1d20 for each creature and add their initiative bonus
    creatures.forEach(creature => {
      const roll = Math.floor(Math.random() * 20) + 1;
      const bonus = creature.initiativeBonus || 0;
      creature.initiative = roll + bonus;
    });

    // Sort by initiative
    creatures.sort((a, b) => b.initiative - a.initiative);
    this.mockCreatures.set([...creatures]);
  }

  nextTurn() {
    this.currentTurn.update(t => t + 1);
    const sorted = this.sortedCreatures();
    if (this.currentTurn() % sorted.length === 0) {
      this.round.update(r => r + 1);
    }
  }
}

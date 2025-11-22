import { Injectable, signal } from '@angular/core';
import { Creature } from '../models/creature.model';
import { Encounter } from '../models/encounter.model';
import { Region, Rarity, DifficultyLevel } from '../models/enums';

@Injectable({
  providedIn: 'root'
})
export class DemoDataService {
  // Demo Creatures
  demoCreatures: Creature[] = [
    {
      Id: 'demo-creature-1',
      name: 'Ancient Red Dragon',
      initiative: 0,
      HP: 546,
      AC: 22,
      statBlock: { Str: 5, Dex: 0, Con: 4, Int: 2, Wis: 1, Cha: 3 },
      cr: '24',
      attack: [
        { name: 'Bite', attackBonus: 17, damage: '2d10 + 10', damageType: ['piercing'], range: '15 ft.' },
        { name: 'Claw', attackBonus: 17, damage: '2d6 + 10', damageType: ['slashing'], range: '10 ft.' }
      ],
      Speed: 40,
      Region: Region.VOLCANIC,
      Rarity: Rarity.LEGENDARY,
      CreatureDescription: 'The most powerful and greedy of chromatic dragons, ancient red dragons are fearsome predators of the skies.',
      // Legacy fields
      id: 'demo-creature-1',
      description: 'The most powerful and greedy of chromatic dragons, ancient red dragons are fearsome predators of the skies.',
      speed: '40 ft., climb 40 ft., fly 80 ft.',
      abilities: {
        strength: 30,
        dexterity: 10,
        constitution: 29,
        intelligence: 18,
        wisdom: 15,
        charisma: 23
      }
    },
    {
      Id: 'demo-creature-2',
      name: 'Goblin Scout',
      initiative: 2,
      HP: 7,
      AC: 13,
      statBlock: { Str: -1, Dex: 2, Con: 0, Int: 0, Wis: -1, Cha: -1 },
      cr: '1/4',
      attack: [
        { name: 'Scimitar', attackBonus: 4, damage: '1d6 + 2', damageType: ['slashing'], range: '5 ft.' }
      ],
      Speed: 30,
      Region: Region.FOREST,
      Rarity: Rarity.COMMON,
      CreatureDescription: 'A sneaky goblin that scouts ahead for its tribe, adept at stealth and ambush tactics.',
      // Legacy fields
      id: 'demo-creature-2',
      description: 'A sneaky goblin that scouts ahead for its tribe, adept at stealth and ambush tactics.',
      speed: '30 ft.',
      abilities: {
        strength: 8,
        dexterity: 14,
        constitution: 10,
        intelligence: 10,
        wisdom: 8,
        charisma: 8
      }
    },
    {
      Id: 'demo-creature-3',
      name: 'Owlbear',
      initiative: 1,
      HP: 59,
      AC: 13,
      statBlock: { Str: 3, Dex: 1, Con: 2, Int: -4, Wis: 1, Cha: -2 },
      cr: '3',
      attack: [
        { name: 'Beak', attackBonus: 7, damage: '1d10 + 5', damageType: ['piercing'], range: '5 ft.' },
        { name: 'Claws', attackBonus: 7, damage: '2d8 + 5', damageType: ['slashing'], range: '5 ft.' }
      ],
      Speed: 40,
      Region: Region.FOREST,
      Rarity: Rarity.UNCOMMON,
      CreatureDescription: 'A monstrosity that combines the worst aspects of an owl and a bear, known for its ferocity.',
      // Legacy
      id: 'demo-creature-3',
      description: 'A monstrosity that combines the worst aspects of an owl and a bear, known for its ferocity.',
      speed: '40 ft.',
      abilities: {
        strength: 20,
        dexterity: 12,
        constitution: 17,
        intelligence: 3,
        wisdom: 12,
        charisma: 7
      }
    },
    {
      Id: 'demo-creature-4',
      name: 'Gelatinous Cube',
      initiative: -4,
      HP: 84,
      AC: 6,
      statBlock: { Str: 1, Dex: -4, Con: 3, Int: -5, Wis: -2, Cha: -5 },
      cr: '2',
      attack: [
        { name: 'Pseudopod', attackBonus: 4, damage: '3d6', damageType: ['acid'], range: '5 ft.' }
      ],
      Speed: 15,
      Region: Region.DUNGEON,
      Rarity: Rarity.UNCOMMON,
      CreatureDescription: 'A transparent ooze that fills dungeon corridors, dissolving anything it engulfs.',
      // Legacy
      id: 'demo-creature-4',
      description: 'A transparent ooze that fills dungeon corridors, dissolving anything it engulfs.',
      speed: '15 ft.',
      abilities: {
        strength: 14,
        dexterity: 3,
        constitution: 20,
        intelligence: 1,
        wisdom: 6,
        charisma: 1
      }
    },
    {
      Id: 'demo-creature-5',
      name: 'Mind Flayer',
      initiative: 1,
      HP: 71,
      AC: 15,
      statBlock: { Str: 0, Dex: 1, Con: 1, Int: 4, Wis: 3, Cha: 3 },
      cr: '7',
      attack: [
        { name: 'Tentacles', attackBonus: 7, damage: '2d10 + 4', damageType: ['psychic'], range: '5 ft.' },
        { name: 'Mind Blast', attackBonus: 0, damage: '4d8 + 4', damageType: ['psychic'], range: '60 ft. cone' }
      ],
      Speed: 30,
      Region: Region.UNDERDARK,
      Rarity: Rarity.RARE,
      CreatureDescription: 'An aberration with powerful psionic abilities that feeds on the brains of sentient creatures.',
      // Legacy
      id: 'demo-creature-5',
      description: 'An aberration with powerful psionic abilities that feeds on the brains of sentient creatures.',
      speed: '30 ft.',
      abilities: {
        strength: 11,
        dexterity: 12,
        constitution: 12,
        intelligence: 19,
        wisdom: 17,
        charisma: 17
      }
    },
    {
      Id: 'demo-creature-6',
      name: 'Beholder',
      initiative: 2,
      HP: 180,
      AC: 18,
      statBlock: { Str: 0, Dex: 2, Con: 3, Int: 3, Wis: 2, Cha: 3 },
      cr: '13',
      attack: [
        { name: 'Bite', attackBonus: 5, damage: '4d6', damageType: ['piercing'], range: '5 ft.' },
        { name: 'Eye Rays', attackBonus: 0, damage: 'Various', damageType: ['various'], range: '120 ft.' }
      ],
      Speed: 0,
      Region: Region.UNDERDARK,
      Rarity: Rarity.LEGENDARY,
      CreatureDescription: 'A floating orb of flesh with a large mouth, single central eye, and many smaller eyestalks on top.',
      // Legacy
      id: 'demo-creature-6',
      description: 'A floating orb of flesh with a large mouth, single central eye, and many smaller eyestalks on top.',
      speed: '0 ft., fly 20 ft. (hover)',
      abilities: {
        strength: 10,
        dexterity: 14,
        constitution: 18,
        intelligence: 17,
        wisdom: 15,
        charisma: 17
      }
    },
    {
      Id: 'demo-creature-7',
      name: 'Shadow Demon',
      initiative: 2,
      HP: 66,
      AC: 13,
      statBlock: { Str: -5, Dex: 3, Con: 1, Int: 2, Wis: 1, Cha: 2 },
      cr: '4',
      attack: [
        { name: 'Claws', attackBonus: 5, damage: '2d6 + 3', damageType: ['psychic'], range: '5 ft.' }
      ],
      Speed: 30,
      Region: Region.SHADOWFELL,
      Rarity: Rarity.RARE,
      CreatureDescription: 'A demonic entity of living shadow that thrives in darkness and despair.',
      // Legacy
      id: 'demo-creature-7',
      description: 'A demonic entity of living shadow that thrives in darkness and despair.',
      speed: '30 ft., fly 30 ft.',
      abilities: {
        strength: 1,
        dexterity: 17,
        constitution: 17,
        intelligence: 14,
        wisdom: 13,
        charisma: 14
      }
    },
    {
      Id: 'demo-creature-8',
      name: 'Frost Giant',
      initiative: -1,
      HP: 138,
      AC: 15,
      statBlock: { Str: 4, Dex: -1, Con: 4, Int: -1, Wis: 0, Cha: 1 },
      cr: '8',
      attack: [
        { name: 'Greataxe', attackBonus: 9, damage: '3d12 + 6', damageType: ['slashing'], range: '10 ft.' },
        { name: 'Rock', attackBonus: 9, damage: '4d10 + 6', damageType: ['bludgeoning'], range: '60/240 ft.' }
      ],
      Speed: 40,
      Region: Region.ARCTIC,
      Rarity: Rarity.UNCOMMON,
      CreatureDescription: 'A towering giant adapted to frigid environments, wielding massive weapons of ice.',
      // Legacy
      id: 'demo-creature-8',
      description: 'A towering giant adapted to frigid environments, wielding massive weapons of ice.',
      speed: '40 ft.',
      abilities: {
        strength: 23,
        dexterity: 9,
        constitution: 21,
        intelligence: 9,
        wisdom: 10,
        charisma: 12
      }
    }
  ];

  // Demo Encounters
  demoEncounters: Encounter[] = [
    {
      id: 'demo-encounter-1',
      name: 'Dragon\'s Lair Assault',
      description: 'A legendary battle against an ancient red dragon in its volcanic lair. Prepare for fire breath and devastating attacks!',
      Region: Region.VOLCANIC,
      Rarity: Rarity.LEGENDARY,
      difficultyLevel: DifficultyLevel.DEADLY,
      partyLevel: 15,
      creatures: [this.demoCreatures[0]] // Ancient Red Dragon
    },
    {
      id: 'demo-encounter-2',
      name: 'Goblin Ambush',
      description: 'A group of goblins has set up an ambush along the forest road. Watch out for their hit-and-run tactics!',
      Region: Region.FOREST,
      Rarity: Rarity.COMMON,
      difficultyLevel: DifficultyLevel.EASY,
      partyLevel: 2,
      creatures: [
        this.demoCreatures[1], // Goblin Scout
        this.demoCreatures[1], // Goblin Scout
        this.demoCreatures[1]  // Goblin Scout
      ]
    },
    {
      id: 'demo-encounter-3',
      name: 'Forest Guardian',
      description: 'An owlbear has made its nest in these woods and doesn\'t take kindly to trespassers.',
      Region: Region.FOREST,
      Rarity: Rarity.UNCOMMON,
      difficultyLevel: DifficultyLevel.MEDIUM,
      partyLevel: 4,
      creatures: [this.demoCreatures[2]] // Owlbear
    },
    {
      id: 'demo-encounter-4',
      name: 'Dungeon Delve',
      description: 'Navigate through a dungeon filled with oozes and other hazards. The gelatinous cube blocks your path!',
      Region: Region.DUNGEON,
      Rarity: Rarity.UNCOMMON,
      difficultyLevel: DifficultyLevel.MEDIUM,
      partyLevel: 3,
      creatures: [this.demoCreatures[3]] // Gelatinous Cube
    },
    {
      id: 'demo-encounter-5',
      name: 'Mind Flayer Colony',
      description: 'Deep in the Underdark, you\'ve stumbled upon a mind flayer settlement. Protect your minds!',
      Region: Region.UNDERDARK,
      Rarity: Rarity.RARE,
      difficultyLevel: DifficultyLevel.HARD,
      partyLevel: 8,
      creatures: [
        this.demoCreatures[4], // Mind Flayer
        this.demoCreatures[4]  // Mind Flayer
      ]
    },
    {
      id: 'demo-encounter-6',
      name: 'Beholder\'s Domain',
      description: 'The ultimate test of strategy - face a beholder with its deadly eye rays in its lair.',
      Region: Region.UNDERDARK,
      Rarity: Rarity.LEGENDARY,
      difficultyLevel: DifficultyLevel.DEADLY,
      partyLevel: 12,
      creatures: [this.demoCreatures[5]] // Beholder
    },
    {
      id: 'demo-encounter-7',
      name: 'Shadow Realm Invasion',
      description: 'Demons from the Shadowfell have crossed into your realm. Stop them before they spread darkness!',
      Region: Region.SHADOWFELL,
      Rarity: Rarity.RARE,
      difficultyLevel: DifficultyLevel.HARD,
      partyLevel: 7,
      creatures: [
        this.demoCreatures[6], // Shadow Demon
        this.demoCreatures[6], // Shadow Demon
        this.demoCreatures[6]  // Shadow Demon
      ]
    },
    {
      id: 'demo-encounter-8',
      name: 'Frozen Wasteland Battle',
      description: 'Frost giants have descended from the mountains. Survive the cold and their brutal strength!',
      Region: Region.ARCTIC,
      Rarity: Rarity.UNCOMMON,
      difficultyLevel: DifficultyLevel.HARD,
      partyLevel: 10,
      creatures: [
        this.demoCreatures[7], // Frost Giant
        this.demoCreatures[7]  // Frost Giant
      ]
    }
  ];

  getDemoCreatures(): Creature[] {
    return this.demoCreatures;
  }

  getDemoEncounters(): Encounter[] {
    return this.demoEncounters;
  }

  getDemoCreatureById(id: string): Creature | undefined {
    return this.demoCreatures.find(c => c.id === id);
  }

  getDemoEncounterById(id: string): Encounter | undefined {
    return this.demoEncounters.find(e => e.id === id);
  }
}

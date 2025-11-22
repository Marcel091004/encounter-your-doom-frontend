import { Region, Rarity } from './enums';

export interface Attack {
  name: string;
  attackBonus?: number;
  damage?: string;
  damageType?: string[];
  description?: string;
  range?: string;
}

export interface StatBlock {
  Str: number;
  Dex: number;
  Con: number;
  Int: number;
  Wis: number;
  Cha: number;
}

export interface Creature {
  Id?: string;
  name: string;
  initiative: number;
  HP: number;
  AC: number;
  statBlock: StatBlock;
  cr: string;
  attack: Attack[];
  Speed: number;
  Region?: Region;
  Rarity?: Rarity;
  CreatureDescription?: string;
  statusEffects?: string[];
  resistances?: string[];
  immunities?: string[];
  weaknesses?: string[];
  traits?: string[];
  // Legacy fields for backward compatibility
  id?: string;
  region?: Region;
  rarity?: Rarity;
  description?: string;
  speed?: string;
  abilities?: {
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
  };
  attacks?: Attack[];
  imageUrl?: string;
}

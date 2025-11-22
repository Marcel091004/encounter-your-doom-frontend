import { Region, Rarity, DifficultyLevel } from './enums';
import { Creature } from './creature.model';

export interface Encounter {
  Id?: string;  // Capital I to match OpenAPI spec
  id?: string;  // Legacy field for backward compatibility
  name: string;
  description?: string;
  Region?: Region;
  region?: Region;  // Legacy field
  Rarity?: Rarity;
  rarity?: Rarity;  // Legacy field
  difficultyLevel?: DifficultyLevel;
  partyLevel?: number;
  creatures?: Creature[];  // Full creature objects for display
  reward?: string;
  isPublic?: boolean;
}

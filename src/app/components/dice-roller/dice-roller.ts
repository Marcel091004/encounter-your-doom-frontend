import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DiceRoll {
  type: number;
  result: number;
  timestamp: number;
  count?: number; // Number of dice rolled
  individual?: number[]; // Individual dice results
  total?: number; // Total sum
  modifier?: number; // Modifier added
}

@Component({
  selector: 'app-dice-roller',
  imports: [CommonModule, FormsModule],
  templateUrl: './dice-roller.html',
  styleUrl: './dice-roller.css',
})
export class DiceRoller {
  isRolling = signal(false);
  currentResult = signal<number | null>(null);
  diceType = signal(20);
  diceCount = signal(1);
  modifier = signal(0);
  rollHistory = signal<DiceRoll[]>([]);
  
  // For multi-dice roll display
  multiResults = signal<number[]>([]);
  
  rollDice(sides: number = this.diceType(), count: number = this.diceCount(), mod: number = this.modifier()) {
    this.isRolling.set(true);
    this.diceType.set(sides);
    this.diceCount.set(count);
    this.modifier.set(mod);
    this.currentResult.set(null);
    this.multiResults.set([]);

    // Simulate realistic dice roll duration
    const rollDuration = 1500;
    
    // Animate intermediate values for realism
    const intervalDuration = 50;
    const steps = rollDuration / intervalDuration;
    let step = 0;

    const interval = setInterval(() => {
      // Show animated intermediate values for each die
      const tempResults = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
      this.multiResults.set(tempResults);
      this.currentResult.set(tempResults.reduce((a, b) => a + b, 0) + mod);
      step++;
      
      if (step >= steps) {
        clearInterval(interval);
        
        // Roll final results
        const finalResults = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
        const total = finalResults.reduce((a, b) => a + b, 0) + mod;
        
        this.multiResults.set(finalResults);
        this.currentResult.set(total);
        this.isRolling.set(false);
        
        // Add to history
        const roll: DiceRoll = {
          type: sides,
          result: total,
          count: count,
          individual: finalResults,
          total: total,
          modifier: mod,
          timestamp: Date.now()
        };
        this.rollHistory.update(history => [roll, ...history].slice(0, 10));
      }
    }, intervalDuration);
  }

  // Helper method to parse and roll dice notation (e.g., "2d6+3")
  rollDiceNotation(notation: string) {
    const match = notation.match(/(\d+)d(\d+)(?:\s*([+-])\s*(\d+))?/i);
    if (!match) return;
    
    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const modifier = match[3] && match[4] ? (match[3] === '+' ? parseInt(match[4]) : -parseInt(match[4])) : 0;
    
    this.rollDice(sides, count, modifier);
  }

  clearHistory() {
    this.rollHistory.set([]);
  }

  getDiceColor(type: number): string {
    const colors: Record<number, string> = {
      4: '#FF6B6B',
      6: '#4ECDC4',
      8: '#45B7D1',
      10: '#96CEB4',
      12: '#FFEAA7',
      20: '#DDA15E'
    };
    return colors[type] || '#A8DADC';
  }

  isCritical(result: number, type: number): boolean {
    return result === type;
  }

  isCriticalFail(result: number): boolean {
    return result === 1;
  }
}

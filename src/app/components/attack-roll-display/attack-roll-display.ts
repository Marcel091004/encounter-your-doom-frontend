import { Component, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AttackRollResult {
  attackRoll: number;
  attackBonus: number;
  attackTotal: number;
  isCritical: boolean;
  isFail: boolean;
  damageRolls?: number[];
  damageModifier?: number;
  damageTotal?: number;
  attackName: string;
  creatureName: string;
}

@Component({
  selector: 'app-attack-roll-display',
  imports: [CommonModule],
  templateUrl: './attack-roll-display.html',
  styleUrl: './attack-roll-display.css',
  standalone: true
})
export class AttackRollDisplay {
  @Input() result: AttackRollResult | null = null;
  @Input() isOpen = false;
  @Output() closeDisplay = new EventEmitter<void>();
  
  isAnimating = signal(false);
  
  ngOnChanges() {
    if (this.isOpen && this.result) {
      this.startAnimation();
    }
  }
  
  startAnimation() {
    this.isAnimating.set(true);
    
    // Animation duration
    setTimeout(() => {
      this.isAnimating.set(false);
    }, 1500);
  }
  
  close() {
    this.closeDisplay.emit();
  }
}

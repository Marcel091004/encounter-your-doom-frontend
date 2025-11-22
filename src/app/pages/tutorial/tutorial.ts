import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DemoDataService } from '../../services/demo-data.service';
import { Creature } from '../../models/creature.model';
import { Encounter } from '../../models/encounter.model';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  action?: string;
  targetRoute?: string;
  completed: boolean;
  icon: string;
  demoContent?: 'creatures' | 'encounters' | 'combat' | 'none';
}

@Component({
  selector: 'app-tutorial',
  imports: [CommonModule],
  templateUrl: './tutorial.html',
  styleUrl: './tutorial.css'
})
export class Tutorial implements OnInit {
  currentStep = signal(0);
  showWelcome = signal(true);
  tutorialActive = signal(false);
  
  demoCreatures = signal<Creature[]>([]);
  demoEncounters = signal<Encounter[]>([]);
  selectedDemoItem = signal<Creature | Encounter | null>(null);

  steps: TutorialStep[] = [
    {
      id: 0,
      title: 'Welcome to Encounter Your Doom!',
      description: 'This interactive tutorial will guide you through all features of the D&D encounter management system. All demonstrations use built-in demo data so you can explore without needing a backend connection.',
      icon: '⚔️',
      completed: false,
      demoContent: 'none'
    },
    {
      id: 1,
      title: 'Explore the Creatures Library',
      description: 'Browse through our demo collection of 8 pre-loaded creatures. Click on any creature card below to view its full stats, abilities, and description. The real creatures page works the same way but pulls data from your backend.',
      action: 'View Demo Creatures',
      icon: '🐉',
      completed: false,
      demoContent: 'creatures'
    },
    {
      id: 2,
      title: 'Create Your Own Creature',
      description: 'In the real application, you can create custom creatures with the creation form. Only Name and Challenge Rating are required - all other fields are optional for maximum flexibility.',
      action: 'View Creation Guide',
      icon: '✨',
      completed: false,
      demoContent: 'none'
    },
    {
      id: 3,
      title: 'Discover Public Encounters',
      description: 'Explore our 8 demo encounters below, ranging from Easy goblin ambushes to Deadly dragon lairs. Click any encounter to see its full details and creature roster. You can filter by difficulty, region, and party level.',
      action: 'View Demo Encounters',
      icon: '⚔️',
      completed: false,
      demoContent: 'encounters'
    },
    {
      id: 4,
      title: 'Build Your Own Encounter',
      description: 'The encounter builder lets you select creatures and organize them into custom encounters. You can make them public for the community or keep them private in your collection.',
      action: 'View Builder Guide',
      icon: '🎲',
      completed: false,
      demoContent: 'none'
    },
    {
      id: 5,
      title: 'Manage Your Private Collection',
      description: 'Your private collection stores encounters you\'ve created or copied from the public library. You can edit your private encounters - add or remove creatures, change names and descriptions. Use the search feature to quickly find creatures to add. From here, you can start combat sessions to track initiative, HP, and status effects.',
      action: 'View Collection Info',
      icon: '📜',
      completed: false,
      demoContent: 'none'
    },
    {
      id: 6,
      title: 'Try the Combat Tracker',
      description: 'The combat tracker is fully functional with demo data! It features initiative tracking, HP management, status effects, multi-dice rolling, and clickable attacks that automatically roll attack and damage. Try the interactive demo to see it in action.',
      action: 'Launch Combat Demo',
      targetRoute: '/demo',
      icon: '🎯',
      completed: false,
      demoContent: 'none'
    },
    {
      id: 7,
      title: '🎉 Congratulations, Dungeon Master! 🎉',
      description: 'You\'ve successfully completed the tutorial! You now know how to browse creatures, create encounters, and manage combat. The tutorial used demo data to show you how everything works. When you connect to a backend, all these features will work with real, persistent data. You can restart this tutorial anytime using the button below. Now go forth and create epic adventures!',
      icon: '🏆',
      completed: false,
      demoContent: 'none'
    }
  ];

  constructor(
    private router: Router,
    private demoDataService: DemoDataService
  ) {}

  ngOnInit() {
    this.loadDemoData();
    this.loadProgress();
  }

  private loadProgress() {
    const savedStep = localStorage.getItem('tutorialStep');
    const savedCompletion = localStorage.getItem('tutorialCompleted');
    
    if (savedCompletion === 'true') {
      this.showWelcome.set(false);
      this.tutorialActive.set(false);
      // Show completion screen instead
      this.currentStep.set(this.steps.length - 1);
    } else if (savedStep) {
      const step = parseInt(savedStep, 10);
      if (step >= 0 && step < this.steps.length) {
        this.currentStep.set(step);
        if (step > 0) {
          this.showWelcome.set(false);
          this.tutorialActive.set(true);
        }
      }
    }
  }

  private saveProgress() {
    localStorage.setItem('tutorialStep', this.currentStep().toString());
    if (this.currentStep() === this.steps.length - 1 && this.steps[this.currentStep()].completed) {
      localStorage.setItem('tutorialCompleted', 'true');
    }
  }

  loadDemoData() {
    this.demoCreatures.set(this.demoDataService.getDemoCreatures());
    this.demoEncounters.set(this.demoDataService.getDemoEncounters());
  }

  startTutorial() {
    this.showWelcome.set(false);
    this.tutorialActive.set(true);
    this.currentStep.set(0);
    this.saveProgress();
  }

  nextStep() {
    if (this.currentStep() < this.steps.length - 1) {
      this.steps[this.currentStep()].completed = true;
      this.currentStep.update(step => step + 1);
      this.selectedDemoItem.set(null);
      this.saveProgress();
    } else if (this.currentStep() === this.steps.length - 1) {
      // Mark final step as completed
      this.steps[this.currentStep()].completed = true;
      this.saveProgress();
    }
  }

  previousStep() {
    if (this.currentStep() > 0) {
      this.currentStep.update(step => step - 1);
      this.selectedDemoItem.set(null);
      this.saveProgress();
    }
  }

  goToStep(index: number) {
    this.currentStep.set(index);
    this.selectedDemoItem.set(null);
    this.saveProgress();
  }

  performAction() {
    const currentStepData = this.steps[this.currentStep()];
    if (currentStepData.targetRoute) {
      // Navigate to the route (like combat demo)
      this.router.navigate([currentStepData.targetRoute]);
    } else {
      // Just move to next step for info-only steps
      this.nextStep();
    }
  }

  skipTutorial() {
    this.router.navigate(['/']);
  }

  restartTutorial() {
    this.steps.forEach(step => step.completed = false);
    this.currentStep.set(0);
    this.showWelcome.set(true);
    this.tutorialActive.set(false);
    this.selectedDemoItem.set(null);
    localStorage.removeItem('tutorialStep');
    localStorage.removeItem('tutorialCompleted');
    this.saveProgress();
  }

  finishTutorial() {
    this.steps[this.currentStep()].completed = true;
    localStorage.setItem('tutorialCompleted', 'true');
    this.saveProgress();
  }

  get isTutorialCompleted(): boolean {
    return this.currentStep() === this.steps.length - 1 && this.steps[this.currentStep()].completed;
  }

  selectDemoItem(item: Creature | Encounter) {
    this.selectedDemoItem.set(item);
  }

  closeDemoModal() {
    this.selectedDemoItem.set(null);
  }

  isCreature(item: any): item is Creature {
    return item && 'cr' in item;
  }

  isEncounter(item: any): item is Encounter {
    return item && 'creatures' in item && 'difficultyLevel' in item;
  }

  get asCreature(): Creature | null {
    const item = this.selectedDemoItem();
    return item && this.isCreature(item) ? item : null;
  }

  get asEncounter(): Encounter | null {
    const item = this.selectedDemoItem();
    return item && this.isEncounter(item) ? item : null;
  }

  get currentStepData(): TutorialStep {
    return this.steps[this.currentStep()];
  }

  get progress(): number {
    return ((this.currentStep() + 1) / this.steps.length) * 100;
  }

  get completedSteps(): number {
    return this.steps.filter(s => s.completed).length;
  }

  get showDemoCreatures(): boolean {
    return this.currentStepData.demoContent === 'creatures';
  }

  get showDemoEncounters(): boolean {
    return this.currentStepData.demoContent === 'encounters';
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  userId: string = '';
  showTutorialBanner = signal(true);

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userId = this.userService.ensureUserId();
    // Check if tutorial banner was dismissed
    const dismissed = localStorage.getItem('tutorial-banner-dismissed');
    this.showTutorialBanner.set(!dismissed);
  }

  dismissTutorialBanner() {
    localStorage.setItem('tutorial-banner-dismissed', 'true');
    this.showTutorialBanner.set(false);
  }
}

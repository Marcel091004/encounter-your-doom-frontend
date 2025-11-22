import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  highlightTutorial = signal(true);

  constructor(private router: Router) {}

  ngOnInit() {
    // Check if tutorial was visited
    const visited = localStorage.getItem('tutorial-visited');
    this.highlightTutorial.set(!visited);

    // Mark tutorial as visited when navigating to it
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (event.url === '/tutorial') {
        localStorage.setItem('tutorial-visited', 'true');
        this.highlightTutorial.set(false);
      }
    });
  }
}

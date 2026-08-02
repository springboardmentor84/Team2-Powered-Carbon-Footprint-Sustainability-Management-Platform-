import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing implements OnInit, OnDestroy {

  activeLink: string = 'home';
  isScrolled: boolean = false;

  private observer!: IntersectionObserver;
  private scrollListener!: () => void;
  private sections = ['home', 'features', 'pricing', 'about', 'contact'];

  constructor(private router: Router, private zone: NgZone) {}

  ngOnInit() {
    // Navbar shadow on scroll
    this.scrollListener = () => {
      this.zone.run(() => {
        this.isScrolled = window.scrollY > 10;
      });
    };
    window.addEventListener('scroll', this.scrollListener);

    // IntersectionObserver — runs outside Angular zone for perf, then re-enters
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.zone.run(() => {
              this.activeLink = entry.target.id;
            });
          }
        });
      },
      {
        root: null,
        rootMargin: '-70px 0px -50% 0px',
        threshold: 0
      }
    );

    setTimeout(() => {
      this.sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) this.observer.observe(el);
      });
    }, 200);
  }

  ngOnDestroy() {
    if (this.observer) this.observer.disconnect();
    if (this.scrollListener) window.removeEventListener('scroll', this.scrollListener);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }

  scrollTo(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  setActive(link: string) {
    this.activeLink = link;
  }

}

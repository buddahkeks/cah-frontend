import { Component } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router, NavigationEnd, Event } from '@angular/router';
import { CahService } from './cah.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('routerTrigger', [
      state('out', style({
        opacity: 0,
        transform: 'translateY(50px)'
      })),
      state('in', style({
        opacity: 1
      })),
      
      transition('in=>out', animate('250ms ease')),
      transition('out=>in', animate('200ms ease'))
    ])
  ]
})
export class AppComponent {
  title: string = 'cah';
  bar_elements: object[] = [
    { link: '/home', title: 'CAH' },
    { link: '/play', title: 'Play!' }
  ]

  routerContentState: string;
  targetURL: string;

  constructor(
    private router: Router,
    private cahService: CahService
  ) {
  }

  ngOnInit() {
    this.routerContentState = 'out';

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.routerContentState = 'in';
      }
    });

    this.cahService.setRootComponent(this);

    if (this.cahService.cookieIsSet('cah_token') &&
        this.cahService.cookieIsSet('cah_username')) {
      this.cahService.doesLobbyExist(
        this.cahService.getCookie('cah_token'), v => {
          if (!v) {
            this.cahService.removeCookie('cah_token');
            this.cahService.removeCookie('cah_username');

            this.router.navigateByUrl('/play');
            return;
          } else {
            this.bar_elements.push(
              { link: `/lobby/${this.cahService.getCookie('cah_token')}`,
                title: 'Current game' }
            );
          }
        });
    }
  }

  changeRoute(url: string): void {
    if (this.router.isActive(url, true)) 
      return;

    this.routerContentState = 'out';
    this.targetURL = url;
  }

  routingAnimDone(): void {
    if (this.routerContentState === 'out') {
      if (this.targetURL)
        this.router.navigateByUrl(this.targetURL);
      else
        this.routerContentState = 'in';
    }
  }
}

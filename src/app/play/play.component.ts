import { Component, OnInit } from '@angular/core';
import { CahService } from '../cah.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss'],
  animations: [
    trigger('errorOutTrigger', [
      state('visible', style({
        height: 'auto',
        padding: '10px 15px'
      })),
      state('invisible', style({
        height: '0',
        padding: '0'
      })),

      transition('invisible<=>visible', animate('250ms ease'))
    ])
  ]
})
export class PlayComponent implements OnInit {
  q_packs: string[] = undefined;
  a_packs: string[] = undefined;

  errorState: string;
  errTimeout = null;

  constructor(
    private cahService: CahService,
    private router: Router
  ) { }

  ngOnInit() {
    this.errorState = 'invisible';

    this.cahService.getPacks('question', res => {
      this.q_packs = res;
    });
    this.cahService.getPacks('answer', res => {
      this.a_packs = res;
    });
  }

  logError(msg: string, duration?: number): void {
    window.clearTimeout(this.errTimeout);

    let errTd = document.getElementById('error-out'),
      errDiv = document.getElementById('error-msg');

    errDiv.innerHTML = msg;
    this.errorState = 'visible';

    this.errTimeout = window.setTimeout(() => {
      this.errorState = 'invisible';
      errDiv.innerHTML = '';
    }, duration || 3500);
  }

  startGame(): void {
    let q_packs = (<HTMLInputElement>document.getElementById('qp-in'))
      .value,
      a_packs = (<HTMLInputElement>document.getElementById('ap-in'))
        .value,
      username = (<HTMLInputElement>document.getElementById('uname-in'))
        .value;

    if (username.length == 0) {
      this.logError("Error: No username entered!");
      return;
    }

    try {
      this.cahService.createGame(username, [q_packs], [a_packs],
        token => {
          this.cahService.rootComponent.bar_elements.push(
            { link: `/lobby/${token}`,
              title: 'Current game' }
          );
          this.router.navigateByUrl(
            `/lobby/${token}`);
        });
    } catch (e) {
      this.logError(e);
    }
  }

  joinGame(): void {
    let token = (<HTMLInputElement>document.getElementById('token-in')).value,
      username = (<HTMLInputElement>document.getElementById('join-uname-in')).value;

    if (token.length == 0) {
      this.logError('Error: No party token entered!');
      return;
    }
    if (username.length == 0) {
      this.logError('Error: No username entered!');
      return;
    }

    this.cahService.joinGame(token, username, err => {
      if (err) {
        this.logError(err);
        return;
      }

      this.router.navigateByUrl(
        `/lobby/${token}`);
    });
  }
}

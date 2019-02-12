import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CahService } from '../cah.service';

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {
  private token: string;
  private username: string;
  private refresh_int;

  gameInfo: object;
  players: string[];

  faArrowLeft = faArrowLeft;

  constructor(
    private route: ActivatedRoute,
    private cahService: CahService,
    private router: Router
  ) { }

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token');
    this.username = this.cahService.getCookie('cah_username');

    if (this.cahService.getCookie('cah_token') == '' ||
      this.cahService.getCookie('cah_username') == '') {
      this.leaveLobby();
      return;
    }
    if (this.token != this.cahService.getCookie('cah_token')) {
      this.leaveLobby();
      return;
    }

    this.cahService.doesLobbyExist(this.token, v => {
      if (!v) {
        this.leaveLobby();
        return;
      }

      this.cahService.isPlayerIn(this.token,
        this.username, v => {
          if (!v) {
            this.leaveLobby();
            return;
          }

          this.cahService.getGameSettings(this.token, s =>
            this.gameInfo = s);

          this.lobbyRefresh();
          this.refresh_int = window.setInterval(this.lobbyRefresh.bind(this),
            1000);
        });
    });
  }

  leaveLobby(): void {
    window.clearInterval(this.refresh_int);

    this.cahService.removeCookie('cah_token');
    this.cahService.removeCookie('cah_username');

    this.router.navigateByUrl('/play');
  }

  lobbyRefresh(): void {
    this.cahService.doesLobbyExist(this.token, v => {
      if (!v) {
        this.router.navigateByUrl('/play');
        return;
      }

      this.cahService.isPlayerIn(this.token,
        this.username, v => {
          if (!v) {
            this.leaveLobby();
            return;
          }

          this.cahService.gameHasStarted(this.token,
            v => {
              if (v) {
                this.gameStart();
              } else {
                this.cahService.getPlayers(this.token,
                  ps => this.players = ps);
              }
            });
        });
    });
  }

  startGame(): void {
    this.cahService.startGame(this.token, () => {
      this.gameStart();
    });
  }

  gameStart(): void {
    window.clearInterval(this.refresh_int);
    this.cahService.rootComponent.bar_elements[this.cahService
      .rootComponent.bar_elements.length-1].link =
      `/lobby/${this.token}/play`;

    this.router.navigateByUrl(`/lobby/${this.token}/play`);
  }

  leaveGame(): void {
    window.clearInterval(this.refresh_int);

    this.cahService.leaveGame(this.token, this.username,
      () => {
        this.cahService.rootComponent.bar_elements.splice(
          this.cahService.rootComponent.bar_elements.length - 1, 1
        );
        this.router.navigateByUrl('/play');
        return;
      });
  }
}

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CahService } from '../cah.service';
import { ActivatedRoute, Router } from '@angular/router';

import { faCrown, faCheck, faCommentDots, faArrowLeft,
  faTimesCircle, faForward }
  from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GameComponent implements OnInit {
  private token: string;
  public username: string;
  private refresh_int;

  public players;
  public round;
  public turnedCards = [];

  public question: string;
  public answerCards: string[];

  faCrown = faCrown;
  faCheck = faCheck;
  faCommentDots = faCommentDots;
  faArrowLeft = faArrowLeft;
  faTimesCircle = faTimesCircle;
  faForward = faForward;

  constructor(
    private cahService: CahService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token');
    this.username = this.cahService.getCookie('cah_username');

    if (this.cahService.getCookie('cah_token') == '' ||
      this.cahService.getCookie('cah_username') == '') {
      this.errorLeave();
      return;
    }
    if (this.token != this.cahService.getCookie('cah_token')) {
      this.errorLeave();
      return;
    }

    this.cahService.doesLobbyExist(this.token,
      v => {
        if (!v) {
          this.errorLeave();
          return;
        }

        this.cahService.isPlayerIn(this.token, this.username,
          v => {
            if (!v) {
              this.errorLeave();
              return;
            }

            this.refreshGame();
            this.refresh_int = window.setInterval(
              this.refreshGame.bind(this), 1000
            );
          });
      });
  }

  private errorLeave(): void {
    window.clearInterval(this.refresh_int);

    this.cahService.removeCookie('cah_token');
    this.cahService.removeCookie('cah_username');

    this.router.navigateByUrl('/play');
  }

  refreshGame(): void {
    this.cahService.doesLobbyExist(this.token,
      v => {
        if (!v) {
          this.errorLeave();
          return;
        }

        this.cahService.isPlayerIn(this.token, this.username,
          v => {
            if (!v) {
              this.errorLeave();
              return;
            }

            this.cahService.getPlayers(this.token,
              ps => this.players = ps);
            this.cahService.getPlayersCards(this.token,
              this.username, cs => {
                this.answerCards = cs;

                this.cahService.getRound(this.token,
                  r => {
                    this.round = r;
                    this.question = this.round.question.replace(
                      /{\\\\__\/}/g, '<span class="question-blank">...</span>'
                    );

                    let els = document
                      .getElementsByClassName('question-blank'),
                      u_ans = null;

                    for (let a of this.round.answers) {
                      if (a.username == this.username)
                        u_ans = a.content;
                    }

                    if (u_ans && els.length > 0) {
                      for (let i = 0; i < u_ans.length; i++) {
                        els[i].innerHTML = u_ans[i];
                      }
                    } else {
                      for (let i = 0; i < els.length; i++) {
                        els[i].innerHTML = "...";
                      }
                    }
                  });
              });
          });
      });
  }

  hasAnswered(username: string) {
    if (!this.round)
      return false;

    return (this.round.answers.map(v => v.username)
      .includes(username) &&
      this.round.answers[this.round.answers
        .map(v => v.username).indexOf(username)].content
        .length >= this.round.blanks);
  }

  answer(ans: string) {
    this.cahService.addAnswer(this.token, this.username,
      ans, () => { });
  }

  allAnswers(): boolean {
    if (this.players.length - 1 != this.round.answers.length)
      return false;

    for (let a of this.round.answers) {
      if (a.content.length != this.round.blanks)
        return false;
    }

    return true;
  }

  turnCard(el) {
    if (this.allAnswers() && !this.turnedCards
      .includes(+el.getAttribute('i'))) {
      this.turnedCards.push(+el.getAttribute('i'));

      this.cahService.turnCard(this.token,
        this.round.answers[+el.getAttribute('i')]
          .username);
    } else if (this.turnedCards.includes(+el.getAttribute('i'))) {
      this.cahService.chooseWinner(this.token,
        this.round.answers[+el.getAttribute('i')]
          .username);

      this.turnedCards = [];
    }
  }

  leaveGame() {
    this.cahService.leaveGame(this.token, this.username,
      () => {
        this.cahService.rootComponent.bar_elements.splice(
          this.cahService.rootComponent.bar_elements.length - 1, 1
        );
      });
  }

  removeCard(el) {
    if (el.tagName.toLowerCase() == 'svg')
      el = el.parentNode;
    if (el.tagName.toLowerCase() == 'path')
      el = el.parentNode.parentNode;

    console.log(el);

    this.cahService.removeCard(this.token, 
      +el.getAttribute('i'));
  }

  writeCard(c) {
    this.cahService.addAnswer(this.token, 
      this.username, c, () => {});
  }

  skipQuestion() {
    this.cahService.skipQuestion(this.token);
  }
}

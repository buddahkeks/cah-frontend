import { Injectable, Component } from '@angular/core';


const conf = {
  server_addr: 'http://localhost'
}


@Injectable({
  providedIn: 'root'
})
export class CahService {
  public rootComponent;

  constructor() {
  }


  public setRootComponent(c) {
    this.rootComponent = c;
  }


  private xHttpRequest(method: string, url: string,
    callback, body?: string): void {
    body = body || "";

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (this.readyState == XMLHttpRequest.DONE &&
        this.status == 200) {
        callback(this.responseText);
      }
    };

    if (method.toLowerCase() == 'post') {
      xhr.open(method, url, true);
      xhr.setRequestHeader('Content-Type',
        'application/x-www-form-urlencoded');
      xhr.withCredentials = true;
      xhr.send(body);
    } else {
      xhr.open(method, url + "?" + body, true);
      xhr.withCredentials = true;
      xhr.send();
    }
  }
  private handleError(response: string, callback): void {
    if (response.toUpperCase().startsWith('[ERROR]')) {
      callback(new Error(
        response.substring(9, 10).toUpperCase() +
        response.substring(10)
      ), response);
    } else {
      callback(undefined, response);
    }
  }
  private URLEncode(o: object): string {
    let ret: string = "";
    for (let k of Object.keys(o)) {
      ret += ret.length != 0 ? '&' : '';
      ret += encodeURIComponent(k) + "=" +
        encodeURIComponent(o[k]);
    }

    return ret;
  }


  public getCookie(name: string): string {
    for (let c of decodeURIComponent(document.cookie)
      .split(';')) {
      c = c.trim();

      if (c.startsWith(name)) {
        return c.substring(name.length + 1);
      }
    }

    return "";
  }
  public cookieIsSet(name: string): boolean {
    return this.getCookie(name) != '';
  }
  public removeCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }



  public addPack(type: string, pack: object) {

  }
  public addCard(type: string, card: object) {

  }
  public addCards(type: string, cards: object[]) {

  }



  public getCards(type: string, pTitle: string,
    callback) {
    this.xHttpRequest('GET',
      `${conf.server_addr}/api/get-${type}-cards/${pTitle}`,
      res => {
        this.handleError(res, (err, res) => {
          if (err) throw err;
          callback(JSON.parse(res));
        });
      });
  }
  public randomCard(type: string, pTitle: string,
    callback) {
    this.xHttpRequest('GET',
      `${conf.server_addr}/api/random-${type}-card/${pTitle}`,
      res => {
        this.handleError(res, (err, res) => {
          if (err) throw err;
          callback(res);
        });
      });
  }

  public getPacks(type: string, callback) {
    this.xHttpRequest('GET',
      `${conf.server_addr}/api/get-${type}-packs/`,
      res => {
        this.handleError(res, (err, res) => {
          if (err) throw err;
          callback(JSON.parse(res));
        });
      });
  }

  public randomPack(type: string, token: string,
    callback) {
    this.xHttpRequest('GET',
      `${conf.server_addr}/api/random-${type}-pack/${token}`,
      res => {
        this.handleError(res, (err, res) => {
          if (err) throw err;
          callback(res);
        });
      });
  }



  public isPlayerIn(token: string, username: string,
    callback) {
    this.xHttpRequest('GET',
      `${conf.server_addr}/api/play/is-player-in-${token}/`,
      res => {
        this.handleError(res, (err, res) => {
          if (err) throw err;
          callback(res === 'true');
        });
      },
      this.URLEncode({
        username: username
      }));
  }
  public getPlayers(token: string, callback) {
    this.xHttpRequest('GET',
      `${conf.server_addr}/api/play/players-in-${token}/`,
      res => {
        this.handleError(res, (err, res) => {
          if (err) throw err;
          callback(JSON.parse(res));
        });
      });
  }
  public getGameSettings(token: string, callback) {
    this.xHttpRequest('GET',
      `${conf.server_addr}/api/play/game-settings/${token}`,
      res => {
        this.handleError(res, (err, res) => {
          if (err) throw err;
          callback(JSON.parse(res));
        });
      });
  }
  public getRound(token: string, callback) {
    this.xHttpRequest('GET',
      `${conf.server_addr}/api/play/round-info/${token}`,
      res => {
        this.handleError(res, (err, res) => {
          if (err) throw err;
          callback(JSON.parse(res));
        });
      });
  }
  public doesLobbyExist(token: string, callback) {
    this.xHttpRequest('GET',
      `${conf.server_addr}/api/play/lobby-exists/${token}`,
      res => {
        this.handleError(res, (err, res) => {
          if (err) throw err;
          callback(res.toLowerCase() === 'true');
        });
      });
  }
  public gameHasStarted(token: string, callback) {
    this.xHttpRequest('GET',
      `${conf.server_addr}/api/play/${token}-has-started`,
      res => {
        this.handleError(res, (err, res) => {
          if (err) throw err;
          callback(res.toLowerCase() === 'true');
        });
      });
  }
  public getPlayersCards(token: string, username: string,
    callback) {
    this.xHttpRequest('GET',
      `${conf.server_addr}/api/play/get-${username}-cards/${token}`,
      res => {
        this.handleError(res, (err, res) => {
          if (err) throw err;
          callback(JSON.parse(res));
        });
      });
  }




  public createGame(username: string, q_packs: string[],
    a_packs: string[], callback?) {
    this.xHttpRequest('POST',
      `${conf.server_addr}/api/play/create/`,
      res => {
        this.handleError(res, (err, res) => {
          if (err) throw err;
          if (callback) callback(res);
        });
      },
      this.URLEncode({
        q_packs: q_packs,
        a_packs: a_packs,
        username: username
      }));
  }
  public joinGame(token: string, username: string,
    callback?) {
    this.xHttpRequest('POST',
      `${conf.server_addr}/api/play/join/${token}`,
      res => {
        this.handleError(res, (err, res) => {
          if (err && callback) callback(err, res);
          else if (callback) callback(undefined, res);
          else if (err) throw err;
        });
      },
      this.URLEncode({
        username: username
      }));
  }
  public leaveGame(token: string, username: string,
    callback?) {
    this.xHttpRequest('POST',
      `${conf.server_addr}/api/play/leave/${token}`,
      res => {
        this.handleError(res, (err, res) => {
          if (err) throw err;
          if (callback) callback(res);
        });
      },
      this.URLEncode({
        username: username
      }));
  }
  public startGame(token: string, callback?) {
    this.xHttpRequest('POST',
      `${conf.server_addr}/api/play/start/${token}`,
      res => {
        this.handleError(res, (err, res) => {
          if (err) throw err;
          if (callback) callback(res);
        });
      });
  }
  public skipQuestion(token: string, callback?) {
    this.xHttpRequest('POST', 
      `${conf.server_addr}/api/play/skip-question/${token}`,
      res => {
        this.handleError(res, (err, res) => {
          if (err) throw err;
          if (callback) callback(res);
        });
      });
  }
  public addAnswer(token: string, username: string,
    answer: string, callback?) {
    this.xHttpRequest('POST',
      `${conf.server_addr}/api/play/add-answer/${token}`,
      res => {
        this.handleError(res, (err, res) => {
          if (err) throw err;
          if (callback) callback(res);
        });
      },
      this.URLEncode({
        username: username,
        content: answer
      }));
  }
  public removeCard(token: string, index: number, callback?) {
    this.xHttpRequest('POST',
      `${conf.server_addr}/api/play/remove-card/${token}`,
      res => {
        this.handleError(res, (err, res) => {
          if (err) throw err;
          if (callback) callback(res);
        });
      }, 
      this.URLEncode({
        index: index
      }));
  }
  public turnCard(token: string, username: string,
    callback?) {
    this.xHttpRequest('POST',
      `${conf.server_addr}/api/play/turn-card/${token}`,
      res => {
        this.handleError(res, (err, res) => {
          if (err) throw err;
          if (callback) callback(res);
        });
      },
      this.URLEncode({
        username: username
      }));
  }
  public chooseWinner(token: string, username: string,
    callback?) {
    this.xHttpRequest('POST',
      `${conf.server_addr}/api/play/choose-winner/${token}`,
      res => {
        this.handleError(res, (err, res) => {
          if (err) throw err;
          if (callback) callback(res);
        });
      },
      this.URLEncode({
        username: username
      }));
  }
}

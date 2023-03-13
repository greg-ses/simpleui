import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';


/**     ZMQ NOTES
 *    if PULL/SUB socket goes down, they can recconect to PUSH/PUB seamlessly
 *    if PUSH/PUB socket goes down, the PULL/SUB socket needs help reconnecting
 *
 * pull sockets can reconnect to push sockets, but push sockets cant reconnect to pull sockets
 *
 */



/**
 * server reads props
 * server creates zmq pull/sub (data) socket (1 per required port) and
 * s
 * props gotten
 * start websocket
 * send struct containing zmq port+command to server via websocket (AppComponent.onTabSelect()
 *
 * Server sends data when pull / sub socket gets data
 *
 *
 */
export interface DataMessage {
  appName: string;
  propsStub: string;
  tabName: string;
  zmqPort: number;
  zmqCommand: string;
}


@Injectable({
  providedIn: 'root'
})
export class DataService {

  private socket$: WebSocketSubject<any>;

  constructor() {
    this.socket$ = new WebSocketSubject('wss://localhost:9991');
  }


  /**
   * Sends a message through the websocket
   * @param msg
   */
  send(msg: DataMessage) {
    try {
      const _msg = JSON.stringify(msg);   // double check that I have to stringify this. DOnt if I dont need to
      this.socket$.next(_msg);
    } catch (err) {
      console.error('Could not send websocket message', msg);
    }
  }





  /**
   * listen for messages
   */
  recieve(): Observable<any> {
    return this.socket$.asObservable();
  }
}

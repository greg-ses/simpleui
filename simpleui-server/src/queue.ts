import { EventEmitter } from "events";
import {ParamsDictionary, Request, Response} from 'express-serve-static-core';
import { Logger, LogLevel } from "server-logger";


export class Queue {
    elements: Array<any>;
    MAX_QUEUE_SIZE: number;
    events: EventEmitter;

    constructor() {
        this.elements = [];
        this.MAX_QUEUE_SIZE = 32;
        this.events = new EventEmitter();
    }

    /**
     * add item to back of queue
     * @param element
     */
    enqueue(element: any) {
        while (this.elements.length >= this.MAX_QUEUE_SIZE) {
            this.dequeue();
        }
        this.elements.push(element);
        this.events.emit('item_added');
    }

    /**
     * remove item from front of queue
     * @returns
     */
    dequeue() {
        return this.isEmpty() ? "Queue Underflow" : this.elements.shift();
    }

    view_all() {
        console.log(this.elements);
    }

    isEmpty() {
        return this.elements.length === 0;
    }

    get front() {
        return this.elements.at(0);
    }
    get back() {
        return this.elements.at(-1);
    }

    get length() {
        return this.elements.length;
    }

    set max_queue_length(val: number) {
        this.MAX_QUEUE_SIZE = val;
    }

}



export class HttpQueue extends Queue {
    constructor() {
        super();
        this.elements = [] as Array<[Request<ParamsDictionary>, Response]>;
    }

    /**
     * Iterates through the queue and sends
     * responses to the client.
     */
    flush_queue() {
        while (!this.isEmpty()) {
            let [_req, _res] = this.dequeue();
            Logger.log(LogLevel.DEBUG, `Clearing HTTP Queue, ${this.length} items left`);
            _res.status(200).json({"ZMQ_error": "flushing_queue"});

        }
    }

}

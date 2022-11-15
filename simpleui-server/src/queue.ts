

export class Queue {
    elements: Array<any>;
    MAX_QUEUE_SIZE: number;

    constructor() {
        this.elements = [];
        this.MAX_QUEUE_SIZE = 32;
    }

    /**
     * add item to back of queue
     * @param element 
     */
    enqueue(element: any) {
        while (this.elements.length >= this.MAX_QUEUE_SIZE) {
            console.log(this.elements.length)
            this.dequeue();
        }
        this.elements.push(element);
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
        return this.elements.length === 0 ? true : false;
    }

    get length() {
        return this.elements.length
    }

    set max_queue_length(val: number) {
        this.MAX_QUEUE_SIZE = val;
    }

}
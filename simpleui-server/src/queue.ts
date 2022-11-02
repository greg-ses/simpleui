

export class Queue {
    elements: Array<string>;

    constructor() {
        this.elements = [];
    }

    /**
     * add item to back of queue
     * @param element 
     */
    enqueue(element: any) {
        this.elements.push(element)
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

}

import { Queue } from '../src/queue'



describe('Queue class testing', () => {
    let test_queue: Queue;

    beforeAll(() => {
        test_queue = new Queue();
    });

    // afterAll( () => {
    //     test_queue = null;
    // });

    it('Should be defined', () => {
        expect(test_queue).toBeDefined();
    });

    it('should add an element', () => {
        expect(test_queue.length).toEqual(0);
        test_queue.enqueue("item");
        expect(test_queue.length).toEqual(1);
    });

    it('should remove an element', () => {
        expect(test_queue.length).toEqual(1);
        test_queue.dequeue();
        expect(test_queue.length).toEqual(0);
    });

    it('should not contain more items than its max', () => {
        const queue_max = test_queue.MAX_QUEUE_SIZE;
        const value_above_max = queue_max + 5;
        for (let i = 0; i <= value_above_max; i++) {
            test_queue.enqueue("junk");
        }
        expect(test_queue.length).toBeLessThanOrEqual(queue_max);
    });

    it('should add to the beginning of the queue', () => {
        test_queue.elements = [0,0,0];
        test_queue.enqueue(1);
        expect(test_queue.elements).toEqual([0,0,0,1]);
    });

    it('should remove from the back of the queue', () => {
        test_queue.elements = [1,0,0,0];
        test_queue.dequeue();
        expect(test_queue.elements).toEqual([0,0,0]);
    });

    it.todo('should read the front of the queue and get the oldest item');

    it.todo('should read the back of the queue and get the most recent item');
});


describe('Queue class event testing', () => {
    let test_queue: Queue;

    beforeAll( () => {
        test_queue = new Queue();
    });

    it("should emit 'item_added' event when item is enqueued", (done) => {
        test_queue.events.on('item_added', () => {
            expect(test_queue.length).toEqual(1);
            done();
        });
        test_queue.enqueue(["res", "req"]);
    });
});

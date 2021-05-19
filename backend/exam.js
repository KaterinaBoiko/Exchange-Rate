const EventEmitter = require('events');
const { connect } = require('http2');

class Collection extends Map {
    constructor(data) {
        super();
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                super.set(key, value);
            }
        }
        this.events = {};
    }

    on(event, callback) {
        if (typeof this.events[event] !== 'object') {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    set(key, value) {
        super.set(key, value);
        this.events['insert'].forEach(cb => {
            cb(key, value);
        });
    }
    then(callback) {
        callback(this.entries());
    }
}

(async function () {
    const c = new Collection({ first: null, second: undefined });
    c.on('insert', function (key, value) {
        console.log(key, value);
    });
    c.set('second', 2);
    const entries = await c;
    console.log(entries);
})();
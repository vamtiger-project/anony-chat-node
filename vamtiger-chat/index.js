var Server = require("vamtiger-chat-server"),
    Handle = require("vamtiger-handle"),
    Database = require("vamtiger-database");

class VamtigerChat {
    constructor() {
        this.handle = new Handle(this);
        this.server = new Server(this);
        this.database = new Database(this);

        // Create a map to optionally link each socket to an email.
        this.sockets = new Map();
    }

    start() {
        this.server.http.listen(8888);
        this.server.socket.on("connection", this.handle.socketConnection)
    }

    exit() {
        process.exit(1);
    }

    bind(Class, instance) {
        VamtigerChat.bindInstanceMethods(Class, instance);
    }

    static bindInstanceMethods(Class, instance) {
        var propertyNames = Object.getOwnPropertyNames(Class.prototype);

        VamtigerChat.regex = VamtigerChat._regex;

        propertyNames.forEach((properyName) => {
            if (!VamtigerChat.regex.ignoreBind.test(properyName))
                Class.prototype[properyName] =
                    instance[properyName].bind(instance);
        });
    }

    static get _regex() {
        var regex = {
            ignoreBind: /^(?:bindInstanceMethods|_\w+)$/
        };

        return regex;
    }
}

module.exports = VamtigerChat;

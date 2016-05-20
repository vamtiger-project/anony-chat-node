var http = require("http"),
    socketIo = require("socket.io"),
    Database = require("./Database");

class VamtigerChatRoom {
    constructor() {
        VamtigerChatRoom.bindInstanceMethods(this);

        this.regex = this._regex;

        this.config = this._config;

        this.httpServer = this._httpServer;
        this.socketServer = this._socketServer;

        this.sockets = this._sockets;

        this.database = this._database;
    }

    ignore() {}

    get _regex() {
        var regex = {
            config: /^(?:-{1,})(\w+)$/
        };

        return regex;
    }

    get _config() {
        var argumentMatch,
            configuration = process.argv.reduce((config, arg, index) => {
                argumentMatch = this.regex.config.exec(arg);

                if (argumentMatch)
                    config[argumentMatch[1]] =
                    process.argv[index + 1] ?
                    Number(process.argv[index + 1]) || process.argv[index + 1] :
                    null;

                return config;
            }, {});

        return configuration;
    }

    get _httpServer() {
        var httpServer = http.createServer(this.handleHttpRequest);

        return httpServer;
    }

    get _socketServer() {
        var socketServer = socketIo(this.httpServer);

        return socketServer;
    }

    get _sockets() {
        return new Map();
    }

    get _database() {
        return new Database();
    }

    handleHttpRequest(request, response) {}

    handleSocketDisconnection(socket) {
        this.sockets.delete(socket);
    }

    handleSocketRegistration(socket) {
        this.database.register(socket);
    }

    handleSocketChat(socket, appId) {
        this.sockets.set(socket, appId);
        console.log(">> chat:", socket.id, appId);

        this.sockets.forEach((registeredAppId, registeredSocket) => {
            if (appId !== registeredAppId)
                registeredSocket.emit("stranger", {
                    message: "Hey there, Stranger!",
                    stranger: appId
                });
        });
    }

    handleSocketConnection(socket) {
        socket.on("disconnect", () => this.handleSocketDisconnection(socket));
        socket.on("register", () => this.handleSocketRegistration(socket));
        socket.on("chat", (data) => this.handleSocketChat(socket, data));

        this.sockets.set(socket);
    }

    start () {
        this.httpServer.listen(this.config.port);
        this.socketServer.on("connection", this.handleSocketConnection);
    }

    static bindInstanceMethods(instance) {
        var propertyNames = Object.getOwnPropertyNames(this.prototype);

        VamtigerChatRoom.regex = VamtigerChatRoom._regex;

        propertyNames.forEach((properyName) => {
            if (!VamtigerChatRoom.regex.ignoreBind.test(properyName))
                this.prototype[properyName] =
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

module.exports = VamtigerChatRoom;

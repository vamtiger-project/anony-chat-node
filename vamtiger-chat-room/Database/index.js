var sqlite3 = require("sqlite3").verbose(),
    SqlTemplate = require("./SqlTemplate");

class Database {
    constructor() {
        this._db = this.__db;

        this.template = this._template;

        this._createTables();
    }

    get __db() {
        return new sqlite3.Database("./anony-chat.db");
    }

    get _template() {
        return new SqlTemplate();
    }

    get _date() {
        var date = new Date();

        return date.toString();
    }

    _createTables() {
        this._db.run(this.template.appRegistrationTable);
    }

    register(socket) {
        this._db.serialize(() => {
            var statement = this._db
                .prepare(this.template.appRegistrationInsert);

            statement.run(socket.id, this._date);

            statement.finalize(() => socket.emit("registration", socket.id));
        });
    }
}

module.exports = Database;

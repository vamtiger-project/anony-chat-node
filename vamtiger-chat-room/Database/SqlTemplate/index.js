class SqlTemplate {
    get _createTable() {
        var snippet = "CREATE TABLE IF NOT EXISTS";

        return snippet;
    }

    get _appRegistration() {
        var snippet = "AppRegistration(id INTEGER, date TEXT)";

        return snippet;
    }

    get _insert() {
        var snippet = "INSERT INTO";

        return snippet;
    }

    get appRegistrationTable() {
        var command = `
            ${this._createTable} ${this._appRegistration}
        `;

        return command;
    }

    get appRegistrationInsert() {
        var command = `
            ${this._insert} AppRegistration VALUES (?, ?)
        `;

        return command;
    }
}

module.exports = SqlTemplate;

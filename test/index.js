var chai = require("chai"),
    assert = chai.assert,
    should = chai.should(),
    chaiAsPromised = require("chai-as-promised"),
    client_socket = require("socket.io-client"),
    socketServerUrl = "http://localhost:8888",
    pause = () => new Promise((resolve, reject) => setTimeout(resolve, 750));

chai.use(chaiAsPromised);

describe("A web based chat application", function() {
    it("should allow a user to connect via web sockets", function (done) {
        let user = client_socket(socketServerUrl);

        user.on("connect", function () {
            user.disconnect();
            done();
        });
    });

    it("should allow for user registration", function (done) {
        let userCount = 10,
            users = [],
            connectedCount = 0;
            registeredCount = 0,
            register = function () {
                connectedCount ++;

                if (connectedCount === userCount)
                    users.forEach(function (user, index) {
                        user.emit("register", {
                            email: "test_" + index + "_@email.com",
                            password: "testPassword"
                        });
                    });
            },
            registered = function (savedObject) {
                registeredCount ++;

                if (registeredCount === userCount) {
                    users.forEach(function (user, index) {
                        user.disconnect();
                    });

                    done();
                }
            };

        for (let i = 0; i < userCount; i++) {
            users.push(client_socket(socketServerUrl));
            users[i].on("connect", register);
            users[i].on("registered", registered);
        }
    });

    describe("The user registration mechanism", function () {
        it("should require an email", function (done) {
            let user = client_socket(socketServerUrl)
                register = function () {
                    user.emit("register", {
                        password: "testPassword"
                    });
                },
                noEmail = function (error) {
                    user.disconnect();
                    done();
                };

            user.on("connect", register);
            user.on("noEmail", noEmail);
        });

        it("should reject duplicate emails", function (done) {
            let user = client_socket(socketServerUrl)
                register = function () {
                    user.emit("register", {
                        email: "test_0_@email.com",
                        password: "testPassword"
                    });
                },
                duplicateEmail = function (error) {
                    user.disconnect();
                    done();
                };

            user.on("connect", register);
            user.on("duplicateEmail", duplicateEmail);
        });

        it("should reject invalid emails", function (done) {
            let user = client_socket(socketServerUrl)
                register = function () {
                    user.emit("register", {
                        email: "test@email.com.",
                        password: "testPassword"
                    });
                },
                invalidEmail = function (error) {
                    user.disconnect();
                    done();
                };

            user.on("connect", register);
            user.on("invalidEmail", invalidEmail);
        });

        it("should require a password", function (done) {
            let user = client_socket(socketServerUrl)
                register = function () {
                    user.emit("register", {
                        email: "test@email.com"
                    });
                },
                noPassword = function (error) {
                    user.disconnect();
                    done();
                };

            user.on("connect", register);
            user.on("noPassword", noPassword);
        })

        it("should reject short passwords", function (done) {
            let user = client_socket(socketServerUrl)
                register = function () {
                    user.emit("register", {
                        email: "test@email.com",
                        password: "pass"
                    });
                },
                shortPassword = function (error) {
                    user.disconnect();
                    done();
                };

            user.on("connect", register);
            user.on("shortPassword", shortPassword);
        })
    })

    describe("The chat mechanism", function () {
        it("should persist chats to a data store", function (done) {
            let user1 = client_socket(socketServerUrl),
                user1Info = {
                    email: "test_01_@email.com",
                    password: "testPassword"
                },

                user2 = client_socket(socketServerUrl),
                user2Info = {
                    email: "test_02_@email.com"
                },

                directMessage = function (data) {
                    user1.emit("directMessage", {
                        message: "Hello there User 2!",
                        sender: user1Info.email,
                        recipient: user2Info.email
                    });
                },

                directMessageRecieved = function (data) {
                    done();
                },

                directMessageError = function (error) {
                    throw new Error("Direct message not delivered!");
                }

                userCount = 2,
                emailMappedCount = 0,
                directMessageCount = 0,

                emailMapped = function () {
                    emailMappedCount ++
                    if (emailMappedCount === userCount)
                        directMessage();
                };

                user1.on("connect", function () {
                    user1.emit("mapToEmail", user1Info.email);
                });
                user2.on("connect", function () {
                    user2.emit("mapToEmail", user2Info.email);
                });
                user1.on("emailMapped", emailMapped);
                user2.on("emailMapped", emailMapped);
                user1.on("directMessageError", directMessageError);
                user2.on("directMessageRecieved", directMessageRecieved);
        });

        it("should allow a customer to take part in multiple chats", function (done) {
            let userCount = 3,
                users = [],
                connected = 0,
                individualBraodcasts = 0,
                handleMultiChat = function (data) {
                    individualBraodcasts++

                    if (individualBraodcasts === userCount)
                        done();
                },
                multiChat = function () {
                    users.forEach(function (user) {
                        user.emit("multiChat", {
                            message: "Hello, there!"
                        });
                    });
                },
                handleConnect = function () {
                    connected++;
                    if (connected === userCount)
                        multiChat();
                };

            for (let i = 1; i <= userCount; i ++) {
                users[i] = client_socket(socketServerUrl);
                users[i].on("connect", handleConnect);
                users[i].on("multiChat", handleMultiChat);
            }
        });

        it("should allow chats to be searched", function (done) {
            let user1 = client_socket(socketServerUrl),
                user1Info = {
                    sender: "test_01_@email.com",
                    message: "hello"
                },
                chatSearchResults = function (results) {
                    done();
                },
                chatSearchError = function (error) {
                    console.log(error);
                    throw new Error(">> Chat search error!");
                };

            user1.on("connect", function () {
                user1.emit("searchChats", user1Info);
            });
            user1.on("chatSearchResults", chatSearchResults);
            user1.on("chatSearchError", chatSearchError);
        });
    });
});

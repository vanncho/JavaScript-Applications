let navigationHandler = {};

$(() => {

    navigationHandler.get = {

        index: function (context) {
            fillLoggedUserData(context);
            displayHome(context);
        },

        home: function (context) {
            let isLogged = fillLoggedUserData(context);

            if (isLogged) {
                displayHomeLogged(context);
            } else {
                displayHome(context);
            }
        },

        login: function (context) {
            fillLoggedUserData(context);

            context.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/user/login.hbs');
            })
        },

        register: function (context) {
            fillLoggedUserData(context);

            context.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/user/register.hbs');
            })
        },

        logout: function (context) {

            context.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                authentication.logout();
                displayHome(context);
                setTimeout(() => authentication.showInfo('Logged out...'), 500);
            })
        },

        myMessages: function (context) {
            let username = sessionStorage.getItem('username');
            context.loggedUser = username;
            let isLogged = authentication.isLoggedIn();
            context.isLoggedIn = isLogged;

            if (isLogged) {
                messageProcessor.getMyMessages(username)
                    .then(function (messagesData) {

                        for (let msg of messagesData) {
                            msg.sender_name = formatSender(msg.sender_name, msg.sender_username);
                            msg._kmd.lmt = formatDate(msg._kmd.lmt);
                        }

                        context.messages = messagesData;

                        context.loadPartials({
                            header: './templates/common/header.hbs',
                            message: './templates/message/message.hbs',
                            footer: './templates/common/footer.hbs'
                        }).then(function () {
                            this.partial('./templates/message/messagesTable.hbs')
                        })
                    }).catch(authentication.showError);
            } else {
                displayHome(context);
            }
        },

        send: function (context) {
            let isLogged = fillLoggedUserData(context);

            if (isLogged) {
                userProcessor.getAllUsers()
                    .then(function (usersData) {

                        for (let user of usersData) {
                            user.name = formatSender(user.name, user.username);
                        }

                        context.users = usersData;

                        context.loadPartials({
                            header: './templates/common/header.hbs',
                            user: './templates/user/userSendOption.hbs',
                            footer: './templates/common/footer.hbs'
                        }).then(function () {
                            this.partial('./templates/message/sendMessage.hbs');
                        })

                    }).catch(authentication.showError);
            } else {
                displayHome(context);
            }
        },

        archiveSent: function (context) {
            let username = sessionStorage.getItem('username');
            context.loggedUser = username;
            let isLogged = authentication.isLoggedIn();
            context.isLoggedIn = isLogged;

            if (isLogged) {
                messageProcessor.getMySentMessages(username)
                    .then(function (messagesData) {

                        for (let msg of messagesData) {
                            msg._kmd.lmt = formatDate(msg._kmd.lmt);
                        }

                        context.messages = messagesData;

                        context.loadPartials({
                            header: './templates/common/header.hbs',
                            message: './templates/message/sentMessage.hbs',
                            footer: './templates/common/footer.hbs'
                        }).then(function () {
                            this.partial('./templates/message/archiveMessagesList.hbs').then(function () {

                                $('button').on('click', (e) => {
                                    let messageTr = $(e.target).parent().parent();
                                    let messageId = messageTr.attr('data-id');
                                    messageTr.remove();
                                    messageProcessor.deleteMessage(messageId)
                                        .then(function () {
                                            context.redirect('#/archiveSent');
                                            setTimeout(() => authentication.showInfo(`Message deleted.`), 500);
                                        }).catch(authentication.showError);
                                });
                            })
                        })

                    }).catch(authentication.showError);
            } else {
                displayHome(context);
            }
        }
    };

    navigationHandler.post = {

        login: function (context) {
            let username = context.params.username;
            let password = context.params.password;

            authentication.login(username, password)
                .then(function (userData) {
                    authentication.saveAuthInSession(userData);
                    context.trigger('formLogin');
                    context.redirect('#');
                    displayHomeLogged(context);
                    setTimeout(() => authentication.showInfo(`User: ${username} logged.`), 500);
                }).catch(authentication.showError);
        },

        register: function (context) {
            let username = context.params.username;
            let password = context.params.password;
            let name = context.params.name;

            if (authentication.checkValidUserData(username, password, name)) {

                authentication.register(username, password, name)
                    .then(function (userData) {
                        authentication.saveAuthInSession(userData);
                        displayHome(context);
                        setTimeout(() => authentication.showInfo('Registration complete successful.'), 500);
                    }).catch(authentication.showError);
            }
        },

        send: function (context) {
            let recipient = context.params.recipient;
            let text = context.params.text;

            let newMsgObj = {
                sender_username: sessionStorage.getItem('username'),
                sender_name: sessionStorage.getItem('name'),
                recipient_username: recipient,
                text: text
            };

            messageProcessor.sendMessage(newMsgObj)
                .then(function () {
                    context.redirect('#/archiveSent');
                    setTimeout(() => authentication.showInfo('Message sent.'), 500);
                }).catch(authentication.showError);
        }
    };

    function formatSender(name, username) {
        if (!name)
            return username;
        else
            return username + ' (' + name + ')';
    }

    function formatDate(dateISO8601) {
        let date = new Date(dateISO8601);
        if (Number.isNaN(date.getDate()))
            return '';
        return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
            "." + date.getFullYear() + ' ' + date.getHours() + ':' +
            padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

        function padZeros(num) {
            return ('0' + num).slice(-2);
        }
    }

    function displayHomeLogged(context) {
        fillLoggedUserData(context);

        context.loadPartials({
            header: './templates/common/header.hbs',
            footer: './templates/common/footer.hbs'
        }).then(function () {
            this.partial('./templates/home/homeLogged.hbs')
        });
    }

    function displayHome(context) {
        fillLoggedUserData(context);

        context.loadPartials({
            header: './templates/common/header.hbs',
            footer: './templates/common/footer.hbs'
        }).then(function () {
            this.partial('./templates/home/home.hbs')
        });
    }

    function fillLoggedUserData(context) {
        context.loggedUser = sessionStorage.getItem('username');
        let isLogged = authentication.isLoggedIn();
        context.isLoggedIn = isLogged;
        return isLogged;
    }
});
let navigationHandler = {};

$(() => {

    navigationHandler.get = {

        index: function (context) {
            displayHome(context);
        },

        home: function (context) {
            displayHome(context)
        },

        about: function (context) {

            context.loggedIn = sessionStorage.getItem('authtoken') !== null;
            context.username = sessionStorage.getItem('username');

            context.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/about/about.hbs')
            })
        },

        login: function (context) {

            context.loggedIn = sessionStorage.getItem('authtoken') !== null;
            context.username = sessionStorage.getItem('username');

            context.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                loginForm: './templates/login/loginForm.hbs'
            }).then(function () {
                this.partial('./templates/login/loginPage.hbs')
            })
        },

        logout: function (context) {

            authentication.logout()
                .then(function () {

                    sessionStorage.clear();
                    authentication.showInfo('Logged out');
                    displayHome(context);
                }).catch(authentication.handleError);
        },

        register: function (context) {
            context.loggedIn = sessionStorage.getItem('authtoken') !== null;
            context.username = sessionStorage.getItem('username');

            context.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                registerForm: './templates/register/registerForm.hbs'
            }).then(function () {
                this.partial('./templates/register/registerPage.hbs')
            })
        },

        catalog: function (context) {
            context.loggedIn = sessionStorage.getItem('authtoken') !== null;
            context.username = sessionStorage.getItem('username');

            teamsService.loadTeams()
                .then(function (teams) {
                    context.hasNoTeam = sessionStorage.getItem('teamId') === null ||
                        sessionStorage.getItem('teamId') === 'undefined';
                    context.teams = teams;
                    context.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        team: './templates/catalog/team.hbs'
                    }).then(function () {
                        this.partial('./templates/catalog/teamCatalog.hbs');
                    })
                });
        },

        createCatalog: function (context) {
            context.loggedIn = sessionStorage.getItem('authtoken') !== null;
            context.username = sessionStorage.getItem('username');

            context.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                createForm: './templates/create/createForm.hbs',
            }).then(function () {
                this.partial('./templates/create/createPage.hbs');
            })
        },

        fromCatalogById: function (context) {
            context.loggedIn = sessionStorage.getItem('authtoken') !== null;
            context.username = sessionStorage.getItem('username');

            let teamId = context.params.id.substr(1);

            teamsService.loadTeamDetails(teamId)
                .then(function (teamInfo) {

                    context.teamId = teamId;
                    context.name = teamInfo.name;
                    context.comment = teamInfo.comment;
                    context.isAuthor = teamInfo._acl.creator === sessionStorage.getItem('userId');
                    context.isOnTeam = teamInfo._id === sessionStorage.getItem('teamId');

                    context.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        teamControls: './templates/catalog/teamControls.hbs',
                    }).then(function () {
                        this.partial('./templates/catalog/details.hbs');
                    })
                }).catch(authentication.handleError);
        },

        joinTeam: function (context) {
            context.loggedIn = sessionStorage.getItem('authtoken') !== null;
            context.username = sessionStorage.getItem('username');

            let teamId = context.params.id.substr(1);

            teamsService.joinTeam(teamId)
                .then(function (userInfo) {
                    authentication.saveSession(userInfo);
                    authentication.showInfo('Joined team.');
                    // displayCatalog(context);
                    navigationHandler.get.catalog(context);
                }).catch(authentication.handleError);
        },

        leaveTeam: function (context) {

            teamsService.leaveTeam()
                .then(function (userInfo) {
                    authentication.saveSession(userInfo);
                    authentication.showInfo('Left the team.');
                    // displayCatalog(context);
                    navigationHandler.get.catalog(context);
                }).catch(authentication.handleError);
        },

        editById: function (context) {
            let teamId = context.params.id.substr(1);

            teamsService.loadTeamDetails(teamId)
                .then(function (teamInfo) {
                    context.teamId = teamId;
                    context.name = teamInfo.name;
                    context.comment = teamInfo.comment;

                    context.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        editForm: './templates/edit/editForm.hbs'
                    }).then(function () {
                        this.partial('./templates/edit/editPage.hbs')
                    })
                }).catch(authentication.handleError);
        }
    };

    navigationHandler.post = {

        login: function (context) {
            let username = context.params.username;
            let password = context.params.password;

            authentication.login(username, password)
                .then(function (userInfo) {

                    authentication.saveSession(userInfo);
                    authentication.showInfo('Logged in');
                    displayHome(context);
                }).catch(authentication.handleError);
        },

        register: function (context) {
            let username = context.params.username;
            let password = context.params.password;
            let repeatPassword = context.params.repeatPassword;

            if (password !== repeatPassword) {
                authentication.showError('Passwords do not match!');
            } else {
                authentication.register(username, password)
                    .then(function (userInfo) {
                        authentication.saveSession(userInfo);
                        authentication.showInfo('Registered.');
                        displayHome(context);
                    }).cache(authentication.handleError);
            }

            authentication.login(username, password)
                .then(function (userInfo) {
                    authentication.saveSession(userInfo);
                    authentication.showInfo('Logged in');
                    displayHome(context);
                }).catch(authentication.handleError);
        },

        createCatalog: function (context) {
            let teamName = context.params.name;
            let teamComment = context.params.comment;

            teamsService.createTeam(name, teamComment)
                .then(function (teamInfo) {
                    teamsService.joinTeam(teamInfo._id)
                        .then(function (userInfo) {
                            authentication.saveSession(userInfo);
                            authentication.showInfo(`Team ${teamName} created!`);
                            // displayCatalog(context);
                            navigationHandler.get.catalog(context);
                        }).catch(authentication.handleError);
                }).catch(authentication.handleError);
        },

        editById: function (context) {
            let teamId = context.params.id.substr(1);
            let teamName = context.params.name;
            let teamComment = context.params.comment;

            teamsService.edit(teamId, teamName, teamComment)
                .then(function () {
                    authentication.showInfo(`Team ${teamName} edited.`);
                    // displayCatalog(ctx);
                    navigationHandler.get.catalog(context);
                }).catch(authentication.handleError);
        }
    };

    function displayHome(context) {

        context.loggedIn = sessionStorage.getItem('authtoken') !== null;
        context.username = sessionStorage.getItem('username');

        context.loadPartials({
            header: './templates/common/header.hbs',
            footer: './templates/common/footer.hbs'
        }).then(function () {
            this.partial('./templates/home/home.hbs')
        })
    }
});
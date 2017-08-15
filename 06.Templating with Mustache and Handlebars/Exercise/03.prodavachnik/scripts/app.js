$(() => {
    const app = Sammy('#main', function () {
        this.use('Handlebars', 'hbs');

        this.get('index.html', function (context) {
            context.loggedUser = sessionStorage.getItem('username');
            context.isLoggedIn = authentication.isLoggedIn();

            context.loadPartials({
                header: './templates/header.hbs',
                footer: './templates/footer.hbs'
            }).then(function () {
                this.partial('./templates/home.hbs');
            })
        });

        this.get('#/login', function (context) {
            context.isLoggedIn = authentication.isLoggedIn();

            context.loadPartials({
                header: './templates/header.hbs',
                footer: './templates/footer.hbs'
            }).then(function () {
                this.partial('./templates/login.hbs');
            })
        });

        this.post('#/login', function (context) {
            let username = context.params.username;
            let password = context.params.passwd;

            authentication.login(username, password)
                .then(function (userData) {
                    authentication.saveAuthInSession(userData);
                    context.trigger('formLogin');
                    context.redirect('#');
                    displayHome(context);
                    setTimeout(() => authentication.showInfo(`User: ${username} logged.`), 800);
                }).catch(authentication.showError);
        });

        this.get('#/logout', function (context) {

            this.loadPartials({
                header: './templates/header.hbs',
                footer: './templates/footer.hbs'
            }).then(function () {
                authentication.logout();
                displayHome(context);
                setTimeout(() => authentication.showInfo('Logged out...'), 800);
            })
        });

        this.get('#/register', function (context) {
            context.isLoggedIn = authentication.isLoggedIn();

            context.loadPartials({
                header: './templates/header.hbs',
                footer: './templates/footer.hbs'
            }).then(function () {
                this.partial('./templates/register.hbs')
            });
        });

        this.post('#/register', function (context) {

            let username = context.params.username;
            let password = context.params.passwd;
            let repeatPassword = context.params.passwdRpt;

            if (authentication.checkValidUserData(username, password, repeatPassword)) {

                authentication.register(username, password)
                    .then(function (userData) {
                        authentication.saveAuthInSession(userData);
                        displayHome(context);
                        setTimeout(() => authentication.showInfo('Registration complete successful.'), 800);
                    }).catch(authentication.showError);
            }
        });

        this.get('#/ads', function (context) {
            context.loggedUser = sessionStorage.getItem('username');
            let isLogged = authentication.isLoggedIn();
            context.isLoggedIn = isLogged;

            if (isLogged) {
                adsProcessor.getAdsVisitsSortedDesc()
                    .then(function (adsVisitsData) {
                        adsProcessor.filterAdsVisitsData(adsVisitsData);

                        adsProcessor.getAllAds()
                            .then(function (allAds) {

                                let adsSorted = adsProcessor.prepareOrderOfAdsBeforeListing(allAds);
                                context.ads = adsSorted;

                            }).then(function () {
                            context.loadPartials({
                                header: './templates/header.hbs',
                                ad: './templates/ad.hbs',
                                footer: './templates/footer.hbs'
                            }).then(function () {
                                this.partial('./templates/listAds.hbs');
                            })
                        }).catch(authentication.showError);
                    }).catch(authentication.showError);

            } else {
                displayHome(context);
            }
        });

        this.get('#/read/:id', function (context) {
            context.loggedUser = sessionStorage.getItem('username');
            context.isLoggedIn = authentication.isLoggedIn();
            let adId = context.params.id.substr(1);

            adsProcessor.getReadAd(adId)
                .then(function (adData) {
                    context.imageUrl = adData.imageUrl;
                    context.title = adData.title;
                    context.description = adData.description;
                    context.publisher = adData.publisher;
                    context.datePublished = adData.datePublished;

                    adsProcessor.getAdVisitsCount(adId)
                        .then(function (adVisitsData) {
                            $('#showAd').text(adVisitsData[0].visits);

                            let editAdObj = {
                                advertId: adVisitsData[0].advertId,
                                visits: Number(adVisitsData[0].visits) + 1
                            };

                            adsProcessor.updateAdVisits(adVisitsData[0]._id, editAdObj)
                                .catch(authentication.showError);
                        }).catch(authentication.showError);
                }).then(function () {
                context.loadPartials({
                    header: './templates/header.hbs',
                    footer: './templates/footer.hbs',
                }).then(function () {
                    this.partial('./templates/read.hbs');
                })
            }).catch(authentication.showError);
        });

        this.get('#/edit/:id', function (context) {
            context.loggedUser = sessionStorage.getItem('username');
            context.isLoggedIn = authentication.isLoggedIn();
            let adId = context.params.id.substr(1);

            adsProcessor.getEditAd(adId)
                .then(function (adData) {

                    context._id = adId;
                    context.title = adData.title;
                    context.publisher = adData.publisher;
                    context.price = adData.price;
                    context.imageUrl = adData.imageUrl;
                    context.description = adData.description;
                    context.datePublished = adData.datePublished;

                    context.loadPartials({
                        header: './templates/header.hbs',
                        footer: './templates/footer.hbs',
                    }).then(function () {
                        this.partial('./templates/edit.hbs');
                    })
                }).catch(authentication.showError);
        });

        this.post('#/edit/:id', function (context) {
            let adId = context.params.id.substr(1);

            let updateAdObj = {
                title: context.params.title,
                description: context.params.description,
                datePublished: context.params.datePublished,
                price: context.params.price,
                imageUrl: context.params.imageUrl
            };

            adsProcessor.saveEditAd(adId, updateAdObj)
                .then(function () {
                    context.redirect('#/ads');
                    setTimeout(() => authentication.showInfo(`Ad ${updateAdObj.title} updated successful.`), 800);
                }).catch(authentication.showError);
        });

        this.get('#/delete/:id', function (context) {
            let adId = context.params.id.substr(1);

            adsProcessor.deleteAd(adId)
                .then(function () {
                    adsProcessor.deleteAdRelationVisits(adId).
                        then(function () {
                            context.redirect('#/ads');
                            setTimeout(() => authentication.showInfo(`Ad deleted successful.`), 800);
                        }).catch(authentication.showError);
                }).catch(authentication.showError);
        });

        this.get('#/create', function (context) {
            context.loggedUser = sessionStorage.getItem('username');
            let isLogged = authentication.isLoggedIn();
            context.isLoggedIn = isLogged;
            context.datePublished = getTodayDateAsString();

            if (isLogged) {
                context.loadPartials({
                    header: './templates/header.hbs',
                    footer: './templates/footer.hbs'
                }).then(function () {
                    this.partial('./templates/create.hbs')
                });
            } else {
                displayHome(context);
            }
        });

        this.post('#/create', function (context) {

            let adObj = {
                title: context.params.title,
                description: context.params.description,
                publisher: sessionStorage.getItem('username'),
                datePublished: getTodayDateAsString(),
                price: Number(context.params.price),
                imageUrl: context.params.imageUrl
            };

            adsProcessor.createAd(adObj)
                .then(function (adData) {
                    let updVisits = {
                        advertId: adData._id,
                        visits: 0
                    };
                    adsProcessor.createAdVisitsRelation(updVisits)
                        .then(function () {
                            context.redirect('#/ads');
                            setTimeout(() => authentication.showInfo('Ad created successful.'), 800);
                        }).catch(authentication.showError);
                }).catch(authentication.showError);
        });

        function getTodayDateAsString() {
            let dateNow = new Date();
            return `${dateNow.getDate()}/${dateNow.getMonth() + 1}/${dateNow.getFullYear()}`;
        }

        function displayHome(context) {
            context.loggedUser = sessionStorage.getItem('username');
            context.isLoggedIn = authentication.isLoggedIn();

            context.loadPartials({
                header: './templates/header.hbs',
                footer: './templates/footer.hbs'
            }).then(function () {
                this.partial('./templates/home.hbs')
            });
        }

    }).run();
});
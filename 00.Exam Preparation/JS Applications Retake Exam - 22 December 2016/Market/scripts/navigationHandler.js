const navigationHandler = {};

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
                sessionStorage.clear();
                displayHome(context);
                setTimeout(() => authentication.showInfo('Logged out...'), 500);
            })
        },

        shop: function (context) {
            let username = sessionStorage.getItem('username');
            context.loggedUser = username;
            let isLogged = authentication.isLoggedIn();
            context.isLoggedIn = isLogged;

            if (isLogged) {

                shopProcessor.getAllProducts()
                    .then(function (productsData) {

                        for (let product of productsData) {
                            product.price = product.price.toFixed(2);
                        }

                        context.products = productsData;

                        context.loadPartials({
                            header: './templates/common/header.hbs',
                            product: './templates/products/productShow.hbs',
                            footer: './templates/common/footer.hbs'
                        }).then(function () {
                            this.partial('./templates/products/productsList.hbs')
                                .then(function () {
                                    $('button').on('click', (e) => {
                                        let productId = $(e.target).parent().parent().attr('data-id');

                                        userProcessor.getUserById(sessionStorage.getItem('userId'))
                                            .then(function (userData) {

                                                shopProcessor.getProductById(productId)
                                                    .then(function (productData) {

                                                        if (!userData.hasOwnProperty('cart')) {

                                                            userData.cart = {
                                                                [productId]: {
                                                                    quantity: 0,
                                                                    product: {
                                                                        name: productData.name,
                                                                        description: productData.description,
                                                                        price: productData.price
                                                                    }
                                                                }
                                                            };
                                                        } else {

                                                            if (!userData.cart.hasOwnProperty(productId)) {

                                                                userData.cart[productId] = {
                                                                    quantity: 0,
                                                                    product: {
                                                                        name: productData.name,
                                                                        description: productData.description,
                                                                        price: productData.price
                                                                    }
                                                                };
                                                            }
                                                        }

                                                        let quantity = userData.cart[productId].quantity;
                                                        quantity++;
                                                        userData.cart[productId].quantity = quantity;

                                                        userProcessor.updateUserCart(userData)
                                                            .then(function (userData) {
                                                                // console.log(userData);
                                                            }).catch(authentication.showError);
                                                    }).catch(authentication.showError);
                                            }).catch(authentication.showError);
                                    })
                                })
                        })
                    }).catch(authentication.showError);
            } else {
                displayHome(context);
            }
        },

        cart: function (context) {
            let username = sessionStorage.getItem('username');
            context.loggedUser = username;
            let isLogged = authentication.isLoggedIn();
            context.isLoggedIn = isLogged;

            if (isLogged) {
                let userId = sessionStorage.getItem('userId');

                userProcessor.getUserById(userId)
                    .then(function (userData) {

                        let products = [];
                        for (let productObj in userData.cart) {

                            let product = {
                                _id: productObj,
                                quantity: userData.cart[productObj].quantity,
                                name: userData.cart[productObj].product.name,
                                description: userData.cart[productObj].product.description,
                                price: userData.cart[productObj].product.price,
                            };

                            products.push(product);
                        }

                        context.products = products;

                        context.loadPartials({
                            header: './templates/common/header.hbs',
                            product: './templates/cart/cartProduct.hbs',
                            footer: './templates/common/footer.hbs'
                        }).then(function () {
                            this.partial('./templates/cart/cartList.hbs')
                                .then(function () {
                                    $('button').on('click', (e) => {
                                        let tr = $(e.target).parent().parent();
                                        let productId = tr.attr('data-id');

                                        delete userData.cart[productId];

                                        userProcessor.updateUserCart(userData)
                                            .then(function () {
                                                tr.remove();
                                                context.redirect('#/cart');
                                                setTimeout(() => authentication.showInfo(`Product discarded.`), 500);
                                            });
                                    });
                                })
                        });
                    })

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
        }
    };

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
            this.partial('./templates/home/homeNotLogged.hbs')
        });
    }

    function fillLoggedUserData(context) {
        context.loggedUser = sessionStorage.getItem('username');
        let isLogged = authentication.isLoggedIn();
        context.isLoggedIn = isLogged;
        return isLogged;
    }
});
$(() => {
    const app = Sammy('#app', function () {
        this.use('Handlebars', 'hbs');

        this.get('market.html', navigationHandler.get.index);

        this.get('#/home', navigationHandler.get.home);

        this.get('#/login', navigationHandler.get.login);

        this.post('#/login', navigationHandler.post.login);

        this.get('#/register', navigationHandler.get.register);

        this.post('#/register', navigationHandler.post.register);

        this.get('#/logout', navigationHandler.get.logout);

        this.get('#/shop', navigationHandler.get.shop);

        this.get('#/cart', navigationHandler.get.cart);

    }).run();

});
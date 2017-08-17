$(() => {
    const app = Sammy('#main', function () {
        this.use('Handlebars', 'hbs');

        this.get('index.html', navigationHandler.get.index);

        this.get('#/home', navigationHandler.get.home);

        this.get('#/about', navigationHandler.get.about);

        this.get('#/login', navigationHandler.get.login);

        this.post('#/login', navigationHandler.post.login);

        this.get('#/logout', navigationHandler.get.logout);

        this.get('#/register', navigationHandler.get.register);

        this.post('#/register', navigationHandler.post.register);

        this.get('#/catalog', navigationHandler.get.catalog);

        this.get('#/create', navigationHandler.get.createCatalog);

        this.post('#/create', navigationHandler.post.createCatalog);

        this.get('#/catalog/:id', navigationHandler.get.fromCatalogById);

        this.get('#/join/:id', navigationHandler.get.joinTeam);

        this.get('#/leave', navigationHandler.get.leaveTeam);

        this.get('/#edit/:id', navigationHandler.get.editById);

        this.post('#/edit/:id', navigationHandler.post.editById);

    });

    app.run();
});
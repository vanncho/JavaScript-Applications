$(() => {
    const app = Sammy('#container', function () {

        this.use('Handlebars', 'hbs');

        this.get('index.html', navigationHandler.get.index);

        this.get('#/home', navigationHandler.get.home);

        this.post('#/login', navigationHandler.post.login);

        this.post('#/register', navigationHandler.post.register);

        this.get('#/logout', navigationHandler.get.logout);

        this.get('#/catalog', navigationHandler.get.catalog);

        this.get('#/create', navigationHandler.get.create);

        this.post('#/create', navigationHandler.post.create);

        this.get('#/edit/:id', navigationHandler.get.edit);

        this.post('#/edit/:id', navigationHandler.post.edit);

        this.get('#/delete/:id', navigationHandler.get.delete);

        this.get('#/myPosts', navigationHandler.get.myPosts);

        this.get('#/comment/:id', navigationHandler.get.comment);

        this.post('#/addComment/:id', navigationHandler.post.addComment);

        this.get('#/deleteComment/:id', navigationHandler.get.deleteComment);

    }).run();

});
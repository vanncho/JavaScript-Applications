$(() => {
    const application = Sammy('#app main', function () {
        this.use('Handlebars', 'hbs');

        this.get('messages.html', navigationHandler.get.index);

        this.get('#/home', navigationHandler.get.home);

        this.get('#/login', navigationHandler.get.login);

        this.post('#/login', navigationHandler.post.login);

        this.get('#/register', navigationHandler.get.register);

        this.post('#/register', navigationHandler.post.register);

        this.get('#/logout', navigationHandler.get.logout);

        this.get('#/myMessages', navigationHandler.get.myMessages);

        this.get('#/send', navigationHandler.get.send);

        this.post('#/send', navigationHandler.post.send);

        this.get('#/archiveSent', navigationHandler.get.archiveSent);

    }).run();
});
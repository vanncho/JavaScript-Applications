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

        catalog: function (context) {
            context.loggedUser = sessionStorage.getItem('username');
            let isLogged = authentication.isLoggedIn();
            context.isLoggedIn = isLogged;

            if (isLogged) {

                catalogProcessor.getAllPosts()
                    .then(function (postsData) {

                        let number = 1;
                        for (let post of postsData) {
                            post.number = number;
                            post.info = calcTime(post._kmd.lmt);
                            post.isAuthor = false;

                            if (post.author === sessionStorage.getItem('username')) {
                                post.isAuthor = true;
                            }

                            number++;
                        }

                        context.posts = postsData;

                        context.loadPartials({
                            header: './templates/common/header.hbs',
                            menu: './templates/common/menu.hbs',
                            post: './templates/catalog/post.hbs',
                            footer: './templates/common/footer.hbs'
                        }).then(function () {
                            this.partial('./templates/catalog/catalog.hbs');
                        })

                    }).catch(authentication.showError);
            }
        },

        create: function (context) {
            context.loggedUser = sessionStorage.getItem('username');
            let isLogged = authentication.isLoggedIn();
            context.isLoggedIn = isLogged;

            if (isLogged) {

                context.loadPartials({
                    header: './templates/common/header.hbs',
                    menu: './templates/common/menu.hbs',
                    footer: './templates/common/footer.hbs'
                }).then(function () {
                    this.partial('./templates/catalog/createPost.hbs');
                })
            }
        },

        edit: function (context) {
            context.loggedUser = sessionStorage.getItem('username');
            let isLogged = authentication.isLoggedIn();
            context.isLoggedIn = isLogged;

            if (isLogged) {
                let postId = context.params.id.substring(1);

                catalogProcessor.getPostById(postId)
                    .then(function (postData) {

                        context.idd = postId;
                        context.url = postData.url;
                        context.title = postData.title;
                        context.imageUrl = postData.imageUrl;
                        context.description = postData.description;

                        context.loadPartials({
                            header: './templates/common/header.hbs',
                            menu: './templates/common/menu.hbs',
                            footer: './templates/common/footer.hbs'
                        }).then(function () {
                            this.partial('./templates/catalog/editPost.hbs');
                        })
                    }).catch(authentication.showError);

            }
        },

        delete: function (context) {
            let postId = context.params.id.substr(1);

            catalogProcessor.deletePost(postId)
                .then(function () {
                context.redirect('#/catalog');
                setTimeout(() => authentication.showInfo(`Post deleted.`), 500);
            }).catch(authentication.showError);
        },

        myPosts: function (context) {
            context.loggedUser = sessionStorage.getItem('username');
            let isLogged = authentication.isLoggedIn();
            context.isLoggedIn = isLogged;

            if (isLogged) {

                catalogProcessor.getUserPosts(sessionStorage.getItem('username'))
                    .then(function (postsData) {
                        console.log(postsData);

                        let number = 1;
                        for (let post of postsData) {
                            post.number = number;
                            post.info = calcTime(post._kmd.lmt);
                            post.isAuthor = false;

                            if (post.author === sessionStorage.getItem('username')) {
                                post.isAuthor = true;
                            }

                            number++;
                        }

                        context.posts = postsData;

                        context.loadPartials({
                            header: './templates/common/header.hbs',
                            menu: './templates/common/menu.hbs',
                            post: './templates/catalog/post.hbs',
                            footer: './templates/common/footer.hbs'
                        }).then(function () {
                            this.partial('./templates/catalog/myPosts.hbs');
                        })

                    }).catch(authentication.showError);
            }
        },

        comment: function (context) {
            context.loggedUser = sessionStorage.getItem('username');
            let isLogged = authentication.isLoggedIn();
            context.isLoggedIn = isLogged;

            if (isLogged) {
                let postId = context.params.id.substring(1);

                catalogProcessor.getPostById(postId)
                    .then(function (postData) {

                        commentProcessor.getAllComments(postId)
                            .then(function (commentsData) {

                                sessionStorage.setItem("postId", postId);
                                context._id = postId;
                                context.author = postData.author;
                                context.url = postData.url;
                                context.title = postData.title;
                                context.imageUrl = postData.imageUrl;
                                context.description = postData.description;

                                for (let comment of commentsData) {

                                    comment.info = calcTime(postData._kmd.lmt);
                                    comment.isAuthor = false;

                                    if (comment.author === sessionStorage.getItem('username')) {
                                        comment.isAuthor = true;
                                    }
                                }

                                context.comments = commentsData;

                                context.loadPartials({
                                    header: './templates/common/header.hbs',
                                    menu: './templates/common/menu.hbs',
                                    footer: './templates/common/footer.hbs'
                                }).then(function () {
                                    this.partial('./templates/catalog/comment.hbs');
                                })
                            }).catch(authentication.showError);
                    }).catch(authentication.showError);
            }
        },

        deleteComment: function (context) {
            let commentId = context.params.id.substr(1);
            let postId = sessionStorage.getItem("postId");

            commentProcessor.deleteComment(commentId)
                .then(function () {
                    context.redirect(`#/comment/:${postId}`);
                    setTimeout(() => authentication.showInfo(`Comment delete.`), 500);
                }).catch(authentication.showError);
        },

        logout: function (context) {

            context.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                authentication.logout();
                sessionStorage.clear();
                displayHome(context);
                setTimeout(() => authentication.showInfo('Logout successful.'), 500);
            })
        }
    };

    navigationHandler.post = {

        login: function (context) {
            let username = context.params.username;
            let password = context.params.password;

            authentication.login(username, password)
                .then(function (userData) {
                    authentication.saveAuthInSession(userData);
                    context.trigger('loginForm');
                    context.redirect('#/catalog');
                    setTimeout(() => authentication.showInfo('Login successful.'), 500);
                }).catch(authentication.showError);
        },

        register: function (context) {
            let username = context.params.username;
            let password = context.params.password;
            let repeatPassword = context.params.repeatPass;

            if (authentication.checkValidUserData(username, password, repeatPassword)) {

                authentication.register(username, password)
                    .then(function (userData) {
                        authentication.saveAuthInSession(userData);
                        context.trigger('registerForm');
                        context.redirect('#/catalog');
                        setTimeout(() => authentication.showInfo('Registration complete successful.'), 500);
                    }).catch(authentication.showError);
            }
        },

        create: function (context) {

            let title = context.params.title;
            let linkUrl = context.params.url;

            if (title.length === 0 && linkUrl.length === 0) {
                authentication.showError('Title and URL must not be empty!');
            } else {

                let post = {
                    author: sessionStorage.getItem('username'),
                    title: title,
                    url: linkUrl,
                    imageUrl: context.params.image,
                    description: context.params.comment,
                };

                catalogProcessor.createPost(post)
                    .then(function () {
                        context.trigger('submitForm');
                        context.redirect('#/catalog');
                        setTimeout(() => authentication.showInfo('Post created.'), 500);
                    }).catch(authentication.showError);
            }
        },

        edit: function (context) {
            let postId = context.params.id.substr(1);

            let updatePostObj = {
                author: sessionStorage.getItem('username'),
                title: context.params.title,
                description: context.params.description,
                url: context.params.url,
                imageUrl: context.params.image,
            };

            catalogProcessor.saveEditPost(postId, updatePostObj)
                .then(function () {
                    context.redirect('#/catalog');
                    setTimeout(() => authentication.showInfo(`Post ${updatePostObj.title} updated.`), 500);
                }).catch(authentication.showError);
        },

        addComment: function (context) {
            let postId = context.params.id.substr(1);

            let commentObj = {
                author: sessionStorage.getItem('username'),
                content: context.params.content,
                postId: postId
            };

            commentProcessor.createComment(commentObj)
                .then(function () {
                    context.trigger('commentForm');
                    context.redirect(`#/comment/:${postId}`);
                    setTimeout(() => authentication.showInfo('Comment created.'), 500);
                }).catch(authentication.showError);
        }
    };

    function calcTime(dateIsoFormat) {
        let diff = new Date - (new Date(dateIsoFormat));
        diff = Math.floor(diff / 60000);
        if (diff < 1) return 'less than a minute';
        if (diff < 60) return diff + ' minute' + pluralize(diff);
        diff = Math.floor(diff / 60);
        if (diff < 24) return diff + ' hour' + pluralize(diff);
        diff = Math.floor(diff / 24);
        if (diff < 30) return diff + ' day' + pluralize(diff);
        diff = Math.floor(diff / 30);
        if (diff < 12) return diff + ' month' + pluralize(diff);
        diff = Math.floor(diff / 12);
        return diff + ' year' + pluralize(diff);

        function pluralize(value) {
            if (value !== 1) return 's';
            else return '';
        }
    }

    function displayHome(context) {
        fillLoggedUserData(context);

        context.loadPartials({
            header: './templates/common/header.hbs',
            footer: './templates/common/footer.hbs'
        }).then(function () {
            this.partial('./templates/home/homeBasic.hbs')
        });
    }

    function fillLoggedUserData(context) {
        context.loggedUser = sessionStorage.getItem('username');
        let isLogged = authentication.isLoggedIn();
        context.isLoggedIn = isLogged;
        return isLogged;
    }
});
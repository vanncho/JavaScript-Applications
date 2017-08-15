$(() => {
    sessionStorage.clear();
    showHideNavLinks();

    const kinveyBaseUrl = "https://baas.kinvey.com/";
    const kinveyAppKey = "kid_S1Gwxl6UZ";
    const kinveyAppSecret = "0311a647d21245ac9fecbbb6369e32e3";
    const kinveyAppAuthHeaders = {
        'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret),
    };

    $('#linkHome').click((e) => navSectionShow(e));
    $('#linkLogin').click((e) => navSectionShow(e));
    $('#linkRegister').click((e) => navSectionShow(e));
    $('#linkListBooks').click((e) => navSectionShow(e));
    $('#linkCreateBook').click((e) => navSectionShow(e));
    $('#linkLogout').click((e) => logoutUser());

    $("form").submit(function (event) {
        event.preventDefault()
    });
    $('#formLogin input[type=submit]').click(loginUser);
    $('#formCreateBook input[type=submit]').click(createBook);

    function navSectionShow(clickedBtn) {
        $('section').hide();

        switch (clickedBtn.currentTarget.innerText) {
            case 'Home': $('#viewHome').show(); break;
            case 'Login': $('#viewLogin').show(); break;
            case 'Register': $('#viewRegister').show(); break;
            case 'List Books': listAllBooks(); break;
            case 'Create Book': showCreateBookView(); break;
            case 'Logout': $('#linkLogout').show(); break;
        }
    }

    function showHideNavLinks() {

        let loggedUser = sessionStorage.getItem('authtoken');
        showView('Home');

        if (loggedUser) {
            hideLink('Login');
            hideLink('Register');
            showLink('ListBooks');
            showLink('CreateBook');
            showLink('Logout');
        } else {
            showLink('Login');
            showLink('Register');
            hideLink('ListBooks');
            hideLink('CreateBook');
            hideLink('Logout');
        }
    }

    function listAllBooks() {
        showView('Books');

        $.ajax({
            method: 'GET',
            url: 'https://baas.kinvey.com/appdata/kid_S1Gwxl6UZ/books',
            headers: getKinveyUserAuthHeaders(),
            success: showBooks,
            error: showError
        });

        function showBooks(data) {

            let table = $('#books table');
            table.empty();
            table.append($('<tr><th>Title</th><th>Author</th><th>Description</th><th>Actions</th></tr>'));

            for (let book of data) {
                table
                    .append($('<tr></tr>')
                        .append($(`<td>${book.title}</td>`))
                        .append($(`<td>${book.author}</td>`))
                        .append($(`<td>${book.description}</td>`))
                        .append($('<button>UPDATE</button>'))
                        .append($('<button>DELETE</button>')
                            .click(deleteBook.bind(this, book._id)))
                    );
            }
        }
    }

    function loginUser() {
        showLoading();

        let userData = {
            username: $('#formLogin input[name=username]').val(),
            password: $('#formLogin input[name=passwd]').val()
        };

        $.ajax({
            method: 'POST',
            url: kinveyBaseUrl + 'user/' + kinveyAppKey + '/login',
            headers: kinveyAppAuthHeaders,
            data: userData,
            success: loginSuccess,
            error: showError,
            complete: () => hideLoading()
        });

        function loginSuccess(userResponse) {
            saveAuthInSeasons(userResponse);
            showHideNavLinks();
            showView('Books');
            listAllBooks();
        }
    }

    function createBook() {
        showLoading();

        let newBook = {
            title: $('#formCreateBook input[name=title]').val(),
            author: $('#formCreateBook input[name=author]').val(),
            description: $('#formCreateBook textarea[name=description]').val()
        };

        $.ajax({
            method: 'POST',
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + '/books',
            headers: getKinveyUserAuthHeaders(),
            data: newBook,
            success: successCreateDeleteBook,
            error: showError,
            complete: () => hideLoading()
        });
    }

    function deleteBook(id) {
        showLoading();
        console.log(id);

        $.ajax({
            method: 'DELETE',
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + '/books/' + id,
            headers: getKinveyUserAuthHeaders(),
            success: successCreateDeleteBook,
            error: showError,
            complete: () => hideLoading()
        });
    }

    function successCreateDeleteBook() {
        showView('Books');
        listAllBooks();
    }

    function showCreateBookView() {
        $('#formCreateBook').trigger('reset');
        showView('CreateBook');
    }

    function saveAuthInSeasons(userData) {
        let usrAuth = userData._kmd.authtoken;
        sessionStorage.setItem('authtoken', usrAuth);
    }

    function getKinveyUserAuthHeaders() {
        return {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authtoken')
        };
    }

    function showView(name) {
        $('main > section').hide();
        $(`#view${name}`).show();
    }

    function showLink(name) {
        $(`#link${name}`).show();
    }

    function hideLink(name) {
        $(`#link${name}`).hide();
    }

    function logoutUser() {
        sessionStorage.clear();
        showHideNavLinks();
    }

    function showLoading() {
        $('#loading').show();
    }

    function hideLoading() {
        $('#loading').hide();
    }

    function showError(error) {
        let errorBox = $('#errorBox');
        let errorObj = JSON.parse(error.responseText);
        errorBox.text(errorObj.description);
        errorBox.show();
        errorBox.click(() => errorBox.hide());
    }

    function setLoadingImg() {
        // let link = 'images/loading.gif';
        // $('#loading').append($(`<img src=${link} alt="loading" height="200" width="200">`));
        // let dir = "../images/";
        // let fileExtension = ".gif";
        // $.ajax({
        //     //This will retrieve the contents of the folder if the folder is configured as 'browsable'
        //     url: dir,
        //     success: function (data) {
        //         //Lsit all png file names in the page
        //         $(data).find("a:contains(" + fileExtension + ")").each(function () {
        //             let filename = this.href.replace(window.location.host, "").replace("http:///", "");
        //             $("#loading").append($("<img src=" + dir + filename + "></img>"));
        //         });
        //     }
        // });
    }
});
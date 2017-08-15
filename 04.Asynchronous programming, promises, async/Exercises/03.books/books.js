function attachEvents() {

    let ajaxReq = function (method, endpoint, book, successFun, errorFun) {
        return $.ajax({
            method: method,
            url: BASE_URL + endpoint,
            headers: HEADERS,
            contentType: 'application/json',
            data: JSON.stringify(book),
            success: successFun,
            error: errorFun
        });
    };

    const BASE_URL = 'https://baas.kinvey.com/appdata/kid_S1Gwxl6UZ/books';
    const USER_ENCRYPT = btoa('guest:guest');
    const HEADERS = {'Authorization': 'Basic ' + USER_ENCRYPT};

    function listAllBooks(books) {
        let allBooks = $('#all-books');
        allBooks.empty();
        let count = 1;

        for (let book of books) {

            allBooks.append($('<div class="curr-book"></div>')
                .append($(`<span>#${count}</span>`).css('font-weight', 'bold'))
                .append($(`<input class="show" id="author-show" value="${book.author}"/>`).attr('data-id', `${book._id}`))
                .append($(`<input class="show" id="title-show" value="${book.title}"/>`).attr('data-id', `${book._id}`))
                .append($(`<input class="show" id="isbn-show" type="number" value="${book.isbn}"/>`).attr('data-id', `${book._id}`))
                .append($('<button class="edit">Edit</button>')
                    .on('click', function (event) {
                        $(event.target).css('display', 'none');
                        $(event.target).next().css('display', 'inline-block');

                        let currDiv = $("[data-id='" + book._id + "']");
                        for (let div of currDiv) {
                            $(div).removeAttr('class');
                        }
                    }))
                .append($('<button class="update">Update</button>').attr('data-id', `${book._id}`)
                    .on('click', function () {
                        let btnUpdate = $(event.target);
                        let bookId = btnUpdate.attr('data-id');

                        let currDiv = $("[data-id='" + bookId + "']");

                        let book = {
                            author: $(currDiv[0]).val(),
                            title: $(currDiv[1]).val(),
                            isbn: $(currDiv[2]).val()
                        };

                        function disableCurrentInputs() {
                            $(currDiv[0]).addClass('show');
                            $(currDiv[1]).addClass('show');
                            $(currDiv[2]).addClass('show');
                            btnUpdate.css('display', 'none');
                            btnUpdate.prev().css('display', 'inline-block');
                        }

                        ajaxReq('PUT', `/${bookId}`, book, disableCurrentInputs, showError);
                    }))
                .append($('<button class="delete">Delete</button>').attr('data-id', `${book._id}`)
                    .on('click', function () {
                        let btnDelete = $(event.target);
                        let bookId = btnDelete.attr('data-id');

                        function deleteCurrBookDomElements() {
                            btnDelete.parent().remove();
                        }

                        ajaxReq('DELETE', `/${bookId}`, {}, deleteCurrBookDomElements, showError);
                    }))
            );
            count++;
        }

        allBooks.append($('hr'));
    }

    ajaxReq('GET', '', {}, listAllBooks, showError);

    $('#addBook').on('click', addNewBook);

    function addNewBook() {

        let isbnCreateInput = $('#isbn-create');
        let titleCreateInput = $('#title-create');
        let authorCreateInput = $('#author-create');

        let book = {
            author: authorCreateInput.val(),
            title: titleCreateInput.val(),
            isbn: Number(isbnCreateInput.val())
        };

        function clearCreateInputFields() {
            authorCreateInput.val('');
            titleCreateInput.val('');
            isbnCreateInput.val('');
        }

        let refreshBooks = ajaxReq('GET', '', {}, listAllBooks, );
        ajaxReq('post', '', book, refreshBooks, showError);
        clearCreateInputFields();
    }

    function showError(error) {

        let main = $('#all-books');
        let form = $('#addBookForm');
        main.empty();
        form.empty();
        main.append($('<h2>Upsss something went wrong!</h2>').css('color', 'red'));
        main.append($('<button>Reload</button>')
            .on('click', () => location.reload()));
    }
}
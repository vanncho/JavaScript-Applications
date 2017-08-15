function attachEvents() {

    const BASE_URL = 'https://baas.kinvey.com/appdata/kid_SyaVZ_jIW/';
    const ENCRYPT64 = btoa('guest' + ':' + 'guest');
    const HEADER = {'Authorization': 'Basic ' + ENCRYPT64};

    let btnLoad = $('#btnLoadPosts');
    btnLoad.on('click', showPosts);

    let btnView = $('#btnViewPost');
    btnView.on('click', showComments);

    let select = $('#posts');
    let list = $('#post-comments');

    function showPosts() {

        $.ajax({
            method: 'GET',
            url: BASE_URL + 'posts',
            headers: HEADER,
            success: loadPostsTitles,
            error: displayError
        });

        function loadPostsTitles(posts) {

            select.empty();
            for (let post of posts) {
                select.append($(`<option>${post.title}</option>`).val(`${post._id}`).attr('pbody', `${post.body}`));
            }
        }
    }

    function showComments() {

        let selectedOption = select.find(':selected');
        let postId = selectedOption.val();
        let postTitle = selectedOption.text();

        $.ajax({
            method: 'GET',
            url: BASE_URL + `comments/?query={"post_id":"${postId}"}`,
            headers: HEADER,
            success: loadComments
        });

        function loadComments(comments) {

            list.empty();
            $('#post-title').text(postTitle);
            $('#post-body').text(selectedOption.attr('pbody'));
            for (let comment of comments) {
                list.append($(`<li>${comment.text}</li>`));
            }
        }
    }

    function displayError(error) {
        $('body').append($(`<div>Error: ${error.status} (${error.statusText})</div>`));
    }
}
let commentProcessor = (() => {

    function createComment(commentObj) {

        return requester.post('appdata', 'comments', 'kinvey', commentObj);
    }

    function getAllComments(postId) {

        return requester.get('appdata', `comments/?query={"postId":"${postId}"}&sort={"_kmd.ect": -1}`, 'kinvey');
    }

    function deleteComment(commentId) {

        return requester.remove('appdata', `comments/${commentId}`, 'kinvey');
    }

    return {
        createComment,
        getAllComments,
        deleteComment
    }
})();
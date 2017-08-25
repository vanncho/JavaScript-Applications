let catalogProcessor = (() => {
    
    function getAllPosts() {

        return requester.get('appdata', 'posts', 'kinvey');
    }

    function createPost(postObj) {

        return requester.post('appdata', `posts/?query={}&sort={"_kmd.ect": -1}`, 'kinvey', postObj);
    }

    function getPostById(id) {

        return requester.get('appdata', `posts/${id}`, 'kinvey');
    }

    function saveEditPost(postId, updatePostObj) {

        return requester.update('appdata', `posts/${postId}`, 'kinvey', updatePostObj);
    }

    function deletePost(postId) {

        return requester.remove('appdata', `posts/${postId}`, 'kinvey');
    }

    function getUserPosts(username) {

        return requester.get('appdata', `posts/?query={"author":"${username}"}&sort={"_kmd.ect": -1}`, 'kinvey');
    }

    return {
        getAllPosts,
        createPost,
        getPostById,
        saveEditPost,
        deletePost,
        getUserPosts,
    }
})();
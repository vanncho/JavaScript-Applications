let userProcessor = (() => {

    function getUserById(userId) {

        return requester.get('user', userId);
    }

    function updateUserCart(userDataObj) {

        return requester.update('user', `${userDataObj._id}`, 'kinvey', userDataObj);
    }

    return {
        getUserById,
        updateUserCart
    }
})();
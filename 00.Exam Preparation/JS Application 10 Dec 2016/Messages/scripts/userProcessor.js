let userProcessor = (() => {

    function getAllUsers() {

        return requester.get('user', '');
    }

    return {
        getAllUsers
    }
})();
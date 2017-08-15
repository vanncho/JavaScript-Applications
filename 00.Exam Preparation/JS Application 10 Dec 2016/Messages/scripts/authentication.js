let authentication = (() => {

    function saveAuthInSession(userData) {
        sessionStorage.setItem('authtoken', userData._kmd.authtoken);
        sessionStorage.setItem('username', userData.username);
        sessionStorage.setItem('name', userData.name);
        sessionStorage.setItem('userId', userData._id);
    }

    function isLoggedIn() {
        return sessionStorage.getItem('authtoken') !== null;
    }

    function login(username, password) {

        let userData = {
            username: username,
            password: password
        };

        return requester.post('user', 'login', 'basic', userData);
    }

    function register(username, password, name) {

        let userData = {
            username: username,
            password: password,
            name: name
        };

        return requester.post('user', '', 'basic', userData);

    }

    function logout() {
        sessionStorage.clear();
    }

    function showError(error) {
        let errorBox = $('#errorBox');

        if (typeof error === 'string') {
            errorBox.text(error);
        } else {
            let errorObj = JSON.parse(error.responseText);
            errorBox.text(errorObj.description);
        }

        errorBox.show();
        errorBox.click(() => errorBox.hide());
    }

    function showInfo(message) {
        let infoDiv = $('#infoBox');
        infoDiv.text(message).show();
        infoDiv.fadeOut(5000);
    }

    function checkValidUserData(username, password, name) {

        if (username.length === 0 || password.length === 0) {
            showError('Username and password must not be empty!');
            return false;
        }

        if (name.length === 0) {
            showError('Please, enter your name!');
            return false;
        }

        return true;
    }

    return {
        saveAuthInSession,
        isLoggedIn,
        login,
        logout,
        register,
        showError,
        showInfo,
        checkValidUserData
    }
})();
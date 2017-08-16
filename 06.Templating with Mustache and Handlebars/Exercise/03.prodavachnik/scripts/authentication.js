let authentication = (() => {

    function saveAuthInSession(userData) {
        sessionStorage.setItem('authtoken', userData._kmd.authtoken);
        sessionStorage.setItem('username', userData.username);
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

    function register(username, password) {

        let userData = {
                username: username,
                password: password
            };

            return requester.post('user', '', 'basic', userData);

    }

    function logout() {
        
        let logoutData = {
            authtoken: sessionStorage.getItem('authtoken')
        };

        return requester.post('user', '_logout', 'kinvey', logoutData);
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

    function checkValidUserData(username, password, passwordRepeat) {

        if (username.length === 0 || password.length === 0 || passwordRepeat === 0) {
            showError('Username, password or repeat password must not be empty.');
            return false;
        }

        if (password !== passwordRepeat) {
            showError('Password and repeat password not match.');
            return false;
        }

        return true;
    }

    return{
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

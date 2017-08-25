let authentication = (() => {

    function saveAuthInSession(userData) {
        sessionStorage.setItem('authtoken', userData._kmd.authtoken);
        sessionStorage.setItem('username', userData.username);
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
            password: password,
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
            errorBox.children().text(error);
        } else {
            let errorObj = JSON.parse(error.responseText);
            errorBox.children().text(errorObj.description);
        }

        errorBox.show();
        errorBox.click(() => errorBox.hide());
    }

    function showInfo(message) {
        let infoDiv = $('#infoBox');
        infoDiv.text(message).show();
        infoDiv.fadeOut(5000);
    }

    function checkValidUserData(username, password, repeatPassword) {

        let usernameRgx = new RegExp('^([a-zA-Z]+){3,}$');
        let passwordRgx = new RegExp('^([a-zA-Z0-9]+){6,}$');

        let usernameMatch = usernameRgx.exec(username);

        if (!usernameMatch) {
            showError('A username should be at least 3 characters long and should contain only english alphabet letters!');
            return false;
        }

        let passwordMatch = passwordRgx.exec(password);

        if (!passwordMatch) {
            showError('Password should be at least 6 characters long and should contain only english alphabet letters and digits!');
            return false;
        }

        if(password !== repeatPassword) {
            showError('Both passwords should match!');
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

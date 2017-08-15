let requester = (() => {

    $(document).on("ajaxStart", function () {
        showLoading();
    });
    $(document).on("ajaxComplete", function () {
        hideLoading();
    });

    const kinveyBaseUrl = "https://baas.kinvey.com/";
    const kinveyAppKey = "kid_r1uEDj-Db";
    const kinveyAppSecret = "c6947d4f87144de3a88a1b8e8e0ad8fb";
    // const kinveyAppAuthHeaders = {'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret)};

    // Creates the authentication header
    function makeAuth(type) {
        return type === 'basic'
            ?  'Basic ' + btoa(kinveyAppKey + ':' + kinveyAppSecret)
            :  'Kinvey ' + sessionStorage.getItem('authtoken');
    }

    // Creates request object to kinvey
    function makeRequest(method, module, endpoint, auth) {
        return req = {
            method,
            url: kinveyBaseUrl + module + '/' + kinveyAppKey + '/' + endpoint,
            headers: {
                'Authorization': makeAuth(auth)
            }
        };
    }

    // Function to return GET promise
    function get (module, endpoint, auth) {
        return $.ajax(makeRequest('GET', module, endpoint, auth));
    }

    // Function to return POST promise
    function post (module, endpoint, auth, data) {
        let req = makeRequest('POST', module, endpoint, auth);
        req.contentType = 'application/json';
        req.data = JSON.stringify(data);
        return $.ajax(req);
    }

    // Function to return PUT promise
    function update (module, endpoint, auth, data) {
        let req = makeRequest('PUT', module, endpoint, auth);
        req.contentType = 'application/json';
        req.data = JSON.stringify(data);
        return $.ajax(req);
    }

    // Function to return DELETE promise
    function remove (module, endpoint, auth) {
        return $.ajax(makeRequest('DELETE', module, endpoint, auth));
    }

    function showLoading() {
        $('#loading').show();
    }

    function hideLoading() {
        $('#loading').hide();
    }

    return {
        get,
        post,
        update,
        remove
    }
})();
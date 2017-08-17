let requester = (() => {

    $(document).on("ajaxStart", function () {
        showLoading();
    });
    $(document).on("ajaxComplete", function () {
        hideLoading();
    });

    const kinveyBaseUrl = "https://baas.kinvey.com/";
    const kinveyAppKey = "kid_HkEG9kzOb";
    const kinveyAppSecret = "5fbf3696c5a7414aaa543adb9d628171";

    function makeAuth(type) {
        return type === 'basic'
            ?  'Basic ' + btoa(kinveyAppKey + ':' + kinveyAppSecret)
            :  'Kinvey ' + sessionStorage.getItem('authtoken');
    }

    function makeRequest(method, module, endpoint, auth) {
        return req = {
            method,
            url: kinveyBaseUrl + module + '/' + kinveyAppKey + '/' + endpoint,
            headers: {
                'Authorization': makeAuth(auth)
            }
        };
    }

    function get (module, endpoint, auth) {
        return $.ajax(makeRequest('GET', module, endpoint, auth));
    }

    function post (module, endpoint, auth, data) {
        let req = makeRequest('POST', module, endpoint, auth);
        req.contentType = 'application/json';
        req.data = JSON.stringify(data);
        return $.ajax(req);
    }

    function update (module, endpoint, auth, data) {
        let req = makeRequest('PUT', module, endpoint, auth);
        req.contentType = 'application/json';
        req.data = JSON.stringify(data);
        return $.ajax(req);
    }

    function remove (module, endpoint, auth) {
        return $.ajax(makeRequest('DELETE', module, endpoint, auth));
    }

    function showLoading() {
        $('#loadingBox').show();
    }

    function hideLoading() {
        $('#loadingBox').hide();
    }

    return {
        get,
        post,
        update,
        remove
    }
})();
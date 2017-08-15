function startApp() {
    sessionStorage.clear();
    showHideNavLinks();
    const templates = {};
    let adsContent = $('#ads').find('table');

    $(document).on("ajaxStart", function () {
        showLoading();
    });
    $(document).on("ajaxComplete", function () {
        hideLoading();
    });

    const kinveyBaseUrl = "https://baas.kinvey.com/";
    const kinveyAppKey = "kid_r1uEDj-Db";
    const kinveyAppSecret = "c6947d4f87144de3a88a1b8e8e0ad8fb";
    const kinveyAppAuthHeaders = {'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret)};
    let endpoint;

    let ajaxRequest = function (method, endpoint, headers, data, successFunc, errorFunc) {
        return $.ajax({
            method: method,
            url: kinveyBaseUrl + endpoint,
            headers: headers,
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: successFunc,
            error: errorFunc
        });
    };

    $('#linkHome').click((e) => navSectionShow(e));
    $('#linkLogin').click((e) => navSectionShow(e));
    $('#linkRegister').click((e) => navSectionShow(e));
    $('#linkListAds').click((e) => navSectionShow(e));
    $('#linkCreateAd').click((e) => navSectionShow(e));
    $('#linkLogout').click((e) => logoutUser());

    $("form").submit(function (event) {
        event.preventDefault()
    });

    $('#buttonLoginUser').click(loginUser);
    $('#buttonRegisterUser').click(registerUser);
    $('#buttonCreateAd').click(createAd);

    function navSectionShow(clickedBtn) {
        $('section').hide();

        switch (clickedBtn.currentTarget.innerText) {
            case 'HOME':
                $('#viewHome').show();
                break;
            case 'LOGIN':
                $('#formLogin').trigger('reset');
                $('#viewLogin').show();
                break;
            case 'REGISTER':
                $('#viewRegister').show();
                break;
            case 'LIST ADVERTISEMENTS':
                listAllAdsVisitsSortedDesc();
                break;
            case 'CREATE ADVERTISEMENT':
                $('#formCreateAd').trigger('reset');
                showCreateAdView();
                break;
            case 'Logout':
                $('#linkLogout').show();
                break;
        }
    }

    function showHideNavLinks() {

        let loggedUser = sessionStorage.getItem('authtoken');
        showView('Home');
        showLink('Home');

        if (loggedUser) {
            hideLink('Login');
            hideLink('Register');
            showLink('ListAds');
            showLink('CreateAd');
            showLink('Logout');
            $('#loggedInUser').show().text(`Hello, ${sessionStorage.getItem('username')}`);
        } else {
            showLink('Login');
            showLink('Register');
            hideLink('ListAds');
            hideLink('CreateAd');
            hideLink('Logout');
            $('#loggedInUser').hide().text('');
        }
    }

    function deleteAd(id) {

        endpoint = "appdata/" + kinveyAppKey + '/posts/' + id;
        ajaxRequest('DELETE', endpoint, getKinveyUserAuthHeaders(), {}, () => '', showError);

        endpoint = 'appdata/' + kinveyAppKey + `/adsVisits/?query={"advertId":"${id}"}`;
        ajaxRequest('DELETE', endpoint, getKinveyUserAuthHeaders(), {}, () => '', showError);

        listAllAdsVisitsSortedDesc();
        showInfo('Ad deleted successful.');
    }

    function preEditAd(adId) {

        endpoint = 'appdata/' + kinveyAppKey + '/posts/' + adId;
        ajaxRequest('GET', endpoint, getKinveyUserAuthHeaders(), {}, showEditAd, showError);

        function showEditAd(data) {
            $('#formEditAd input[name=title]').val(data.title);
            $('#formEditAd textarea[name=description]').val(data.description);
            $('#formEditAd input[name=price]').val(data.price);
            $('#formEditAd input[name=datePublished]').val(data.datePublished).attr('disabled', 'disabled');
            $('#formEditAd input[name=image]').val(data.imageUrl);
            showView('EditAd');
            $('#buttonEditAd').click(editAd.bind(this, data));
        }
    }

    function editAd(advert) {

        let editAdObj = {
            title: $('#formEditAd input[name=title]').val(),
            publisher: sessionStorage.getItem('username'),
            description: $('#formEditAd textarea[name=description]').val(),
            datePublished: advert.datePublished,
            price: Number($('#formEditAd input[name=price]').val()),
            imageUrl: $('#formEditAd input[name=image]').val()
        };

        endpoint = "appdata/" + kinveyAppKey + '/posts/' + advert._id;
        ajaxRequest('PUT', endpoint, getKinveyUserAuthHeaders(), editAdObj, listAllAdsVisitsSortedDesc, showError);

        showInfo(`Ad ${editAdObj.title} edited successful`);
    }

    function createAd() {

        let dateToday = getTodayDateAsString();

        if ($('#formCreateAd input[name=title]').val() &&
            $('#formCreateAd textarea[name=description]').val() &&
            $('#formCreateAd input[name=price]').val()) {

            let newAdv = {
                title: $('#formCreateAd input[name=title]').val(),
                publisher: sessionStorage.getItem('username'),
                description: $('#formCreateAd textarea[name=description]').val(),
                datePublished: dateToday,
                price: Number($('#formCreateAd input[name=price]').val()),
                imageUrl: $('#formCreateAd input[name=image]').val()
            };

            endpoint = "appdata/" + kinveyAppKey + '/posts';
            ajaxRequest('POST', endpoint, getKinveyUserAuthHeaders(), newAdv, successCreateAd, showError);

        } else {
            showError('Please fill all fields.');
        }
    }

    let adAndVisits = new Map();

    function listAllAdsVisitsSortedDesc() {
        adAndVisits.clear();

        endpoint = 'appdata/' + kinveyAppKey + '/adsVisits/?query={}&sort={"visits": -1}';
        ajaxRequest('GET', endpoint, getKinveyUserAuthHeaders(), {}, extractSortedAds, showError);

        function extractSortedAds(data) {
            getAdsVisitsSorted(data);
        }
    }

    function getAdsVisitsSorted(data) {

        for (let ad of data) {

            if (!adAndVisits.has(ad.visits)) {
                adAndVisits.set(ad.visits, []);
                adAndVisits.get(ad.visits).push(ad.advertId);
            } else {
                adAndVisits.get(ad.visits).push(ad.advertId);
            }
        }

        getAllAds();
    }

    function getAllAds() {

        endpoint = 'appdata/' + kinveyAppKey + '/posts';
        ajaxRequest('GET', endpoint, getKinveyUserAuthHeaders(), {}, extractAllAds, showError);

        function extractAllAds(data) {
            getAll(data);
        }
    }

    function getAll(data) {

        let adsSorted = [];

        for (let [k,v] of adAndVisits) {
            for (let ad of data) {
                for (let obj of v) {
                    if (obj === ad._id) {
                        ad.visits = k;
                        adsSorted.push(ad);
                    }
                }
            }
        }

        adsContent.empty();
        showView('Ads');
        adsContent.append($('<tr><th>Visits</th><th>Title</th><th>Publisher</th><th>Description</th><th>Price</th><th>Date Published</th><th>Actions</th></tr>'));

        for (let obj of adsSorted) {
            listSingleAd(obj);
        }
    }

    function listSingleAd(dataAd) {

            let tr = $('<tr></tr>')
                .append($(`<td>${dataAd.visits}</td>`))
                .append($(`<td>${dataAd.title}</td>`))
                .append($(`<td>${dataAd.publisher}</td>`))
                .append($(`<td>${(dataAd.description).length > 30 ? (dataAd.description).substring(0, 30) + ' ...' : (dataAd.description)}</td>`))
                .append($(`<td>${dataAd.price}</td>`))
                .append($(`<td>${dataAd.datePublished}</td>`));
            let td = $('<td></td>');
            td.append($('<a href="#" class="adAction">READ MORE</a>')
                .click(showFullAd.bind(this, dataAd)));

            if (sessionStorage.getItem('userId') === dataAd._acl.creator) {
                td.append($('<a href="#" class="adAction">DELETE</a>')
                    .click(deleteAd.bind(this, dataAd._id)))
                    .append($('<a href="#" class="adAction">EDIT</a>')
                        .click(preEditAd.bind(this, dataAd._id)));
            }
            tr.append(td);
        adsContent.append(tr);
    }

    async function showFullAd(advert) {

        $('#detailedAdTitle').text(advert.title);
        $('#detailedAdDescription').text(advert.description);
        $('#detailedAdPublisher').text(advert.publisher);
        $('#detailedAdDate').text(advert.datePublished);

        await getAdVisitsCount(advert);
        let adVisitsObj = sessionStorage.getItem('adToUpdate');

        let advImgDom = $('#imgUrl');
        advImgDom.removeAttr('src');
        advImgDom.attr('src', `${advert.imageUrl}`);
        showView('DetailedAd');
        updateAdVisits(adVisitsObj);
    }

    function createAdVisitsRelation(advert) {

        let updVisits = {
            advertId: advert._id,
            visits: 0
        };

        endpoint = "appdata/" + kinveyAppKey + '/adsVisits';
        ajaxRequest('POST', endpoint, getKinveyUserAuthHeaders(), updVisits, updVisits, showError);
    }

    function updateAdVisits(adVisitsAsString) {

        let adVisitsJSON = JSON.parse(adVisitsAsString);
        let editAdObj = {
            advertId: adVisitsJSON.advertId,
            visits: Number(adVisitsJSON.visits) + 1
        };

        endpoint = "appdata/" + kinveyAppKey + '/adsVisits/' + adVisitsJSON.id;
        ajaxRequest('PUT', endpoint, getKinveyUserAuthHeaders(), editAdObj, () => '', showError);
    }

    function getAdVisitsCount(advert) {

        endpoint = 'appdata/' + kinveyAppKey + `/adsVisits/?query={"advertId":"${advert._id}"}`;
        return ajaxRequest('GET', endpoint, getKinveyUserAuthHeaders(), {}, setVisitsToDom, showError);

        function setVisitsToDom(data) {
            $('#showAd').text(data[0].visits);

            let adVisits = {
                id: data[0]._id,
                advertId: data[0].advertId,
                visits: data[0].visits
            };
            sessionStorage.setItem('adToUpdate', JSON.stringify(adVisits));
        }
    }

    function registerUser() {

        let username = $('#formRegister input[name=username]').val();
        let password = $('#formRegister input[name=passwd]').val();
        let passwordRepeat = $('#formRegister input[name=passwd-rpt]').val();
        let userData;

        let isValidUser = checkValidUserData(username, password, passwordRepeat);

        if (isValidUser) {
            userData = {
                username: username,
                password: password
            };

            endpoint = "user/" + kinveyAppKey + "/";
            return ajaxRequest('POST', endpoint, kinveyAppAuthHeaders, userData, registerSuccess, showError);

            function registerSuccess(userInfo) {
                saveAuthInSeasons(userInfo);
                showHideNavLinks();
                showInfo('Registration complete successful.');
            }
        }
    }

    function loginUser() {

        let userData = {
            username: $('#formLogin input[name=username]').val(),
            password: $('#formLogin input[name=passwd]').val()
        };

        endpoint = 'user/' + kinveyAppKey + '/login';
        ajaxRequest('POST', endpoint, kinveyAppAuthHeaders, userData, loginSuccess, showError);

        function loginSuccess(userResponse) {
            saveAuthInSeasons(userResponse);
            showHideNavLinks();
            showInfo(`${userData.username} logged in successful.`);
        }
    }

    function successCreateAd(advert) {
        listAllAdsVisitsSortedDesc();
        createAdVisitsRelation(advert);
        showInfo('Ad added successful.');
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

    function showCreateAdView() {
        $('#formCreateAd input[name=datePublished]').val(getTodayDateAsString()).attr('disabled', 'disabled');
        showView('CreateAd');
    }

    function getTodayDateAsString() {
        let dateNow = new Date();
        return `${dateNow.getDate()}/${dateNow.getMonth() + 1}/${dateNow.getFullYear()}`;
    }

    function saveAuthInSeasons(userData) {
        sessionStorage.setItem('authtoken', userData._kmd.authtoken);
        sessionStorage.setItem('username', userData.username);
        sessionStorage.setItem('userId', userData._id);
    }

    function getKinveyUserAuthHeaders() {
        return {'Authorization': 'Kinvey ' + sessionStorage.getItem('authtoken')};
    }

    function showView(name) {
        $('main > section').hide();
        $(`#view${name}`).show();
    }

    function showLink(name) {
        $(`#link${name}`).show();
    }

    function hideLink(name) {
        $(`#link${name}`).hide();
    }

    function logoutUser() {
        sessionStorage.clear();
        showHideNavLinks();
        showInfo('Logged out.');
    }

    function showLoading() {
        $('#loading').show();
    }

    function hideLoading() {
        $('#loading').hide();
    }

    function showInfo(message) {
        let infoDiv = $('#infoBox');
        infoDiv.text(message).show();
        infoDiv.fadeOut(4000);
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
}
let adsProcessor = (() => {

    function getAdsVisitsSortedDesc() {

        return requester.get('appdata', 'adsVisits/?query={}&sort={"visits": -1}', 'kinvey');
    }

    const adAndVisits = new Map();

    function filterAdsVisitsData(data) {
        adAndVisits.clear();

        for (let ad of data) {
            if (!adAndVisits.has(ad.visits)) {
                adAndVisits.set(ad.visits, []);
                adAndVisits.get(ad.visits).push(ad.advertId);
            } else {
                adAndVisits.get(ad.visits).push(ad.advertId);
            }
        }
    }

    function getAllAds() {

        return requester.get('appdata', 'posts', 'kinvey')
    }

    function prepareOrderOfAdsBeforeListing(data) {

        let adsSorted = [];

        for (let [k, v] of adAndVisits) {
            for (let ad of data) {
                for (let obj of v) {
                    if (obj === ad._id) {
                        ad.visits = +k;
                        if (ad.description.length > 30) {
                            ad.description = ad.description.substring(0, 30) + ' ...';
                        }

                        if (ad._acl.creator === sessionStorage.getItem('userId')) {
                            ad.creator = true;
                        }
                        adsSorted.push(ad);
                    }
                }
            }
        }

        return adsSorted;
    }

    function getReadAd(id) {

        return requester.get('appdata', `posts/${id}`, 'kinvey');
    }

    function getAdVisitsCount(adId) {

        return requester.get('appdata', `adsVisits/?query={"advertId":"${adId}"}`, 'kinvey');
    }

    function updateAdVisits(adId, editAdObj) {

        return requester.update('appdata', `adsVisits/${adId}`, 'kinvey', editAdObj);
    }

    function getEditAd(id) {

        return requester.get('appdata', `posts/${id}`, 'kinvey');
    }

    function saveEditAd(adId, updateAdObj) {

        return requester.update('appdata', `posts/${adId}`, 'kinvey', updateAdObj);
    }

    function deleteAd(adId) {

        return requester.remove('appdata', `posts/${adId}`, 'kinvey');
    }

    function deleteAdRelationVisits(adId) {

        return requester.remove('appdata', `adsVisits/?query={"advertId":"${adId}"}`, 'kinvey');
    }

    function createAd(adObj) {

        return requester.post('appdata', 'posts', 'kinvey', adObj);
    }

    function createAdVisitsRelation(adObj) {

        return requester.post('appdata', 'adsVisits', 'kinvey', adObj);
    }

    return {
        getAdsVisitsSortedDesc,
        filterAdsVisitsData,
        getAllAds,
        prepareOrderOfAdsBeforeListing,
        getReadAd,
        getAdVisitsCount,
        updateAdVisits,
        getEditAd,
        saveEditAd,
        deleteAd,
        deleteAdRelationVisits,
        createAd,
        createAdVisitsRelation
    }
})();
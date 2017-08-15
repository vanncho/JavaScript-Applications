function attachEvents() {

    let btnSubmit = $('#submit');
    btnSubmit.on('click', getCitiesData);

    let inputLocation = $('#location');
    let currentDom = $('#current');
    let upcomingDiv = $('#upcoming');
    let cityData = {};

    function getCitiesData() {
        let foundCity = false;

        $.ajax({
            method: 'GET',
            url: 'https://judgetests.firebaseio.com/locations.json',
            success: fillCitiesData,
            error: showError
        });

        function fillCitiesData(citiesData) {

            $('#forecast').css('display', 'block');

            for (let cityObj of citiesData) {

                if (inputLocation.val() === cityObj.name) {
                    cityData = cityObj;
                    foundCity = true;
                    showTodayForecast();
                }
            }
        }

        if (foundCity) {
            showTodayForecast();
        } else {
            showError();
        }
    }

    function showTodayForecast() {

        $.ajax({
            method: 'GET',
            url: `https://judgetests.firebaseio.com/forecast/today/${cityData.code}.json`,
            success: showForToday,
            // error: showError
        });

        function showForToday(cityToday) {

            currentDom.empty();
            currentDom.append($('<div class="label">Current conditions</div>'));

            let symbol = getConditionSymbol(cityToday.forecast.condition);
            currentDom.append($(`<span class="condition symbol">${symbol}</span>`));
            currentDom.append($('<span class="condition"></span>')
                .append($(`<span class="forecast-data">${cityToday.name}</span>`))
                .append($(`<span class="forecast-data">${cityToday.forecast.low}&#176;/${cityToday.forecast.high}&#176;</span>`))
                .append($(`<span class="forecast-data">${cityToday.forecast.condition}</span>`)));
        }

        $.ajax({
            method: 'GET',
            url: `https://judgetests.firebaseio.com/forecast/upcoming/${cityData.code}.json`,
            success: showForThreeDaysAhead,
            error: showError
        });

        function showForThreeDaysAhead(threeDaysData) {

            upcomingDiv.empty();
            for (let day of threeDaysData.forecast) {

                let symbol = getConditionSymbol(day.condition);
                upcomingDiv.append($('<span class="upcoming"></span>')
                    .append($(`<span class="symbol">${symbol}</span>`))
                    .append($(`<span class="forecast-data">${day.low}&#176;/${day.high}&#176;</span>`))
                    .append($(`<span class="forecast-data">${day.condition}</span>`)));
            }
        }
    }

    function showError() {
        currentDom.empty();
        currentDom.append($('<div class="label">City Not Found !</div>'));
        upcomingDiv.empty();
    }

    function getConditionSymbol(name) {
        let symbols = {
            ['Sunny']: '&#x2600;',
            ['Partly sunny']: '&#x26C5;',
            ['Overcast']: '&#x2601;',
            ['Rain']: '&#x2614;',
        };

        return symbols[name];
    }
}
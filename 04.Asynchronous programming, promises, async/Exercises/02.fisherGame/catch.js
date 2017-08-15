function attachEvents() {

    const BASE_URL = 'https://baas.kinvey.com/appdata/kid_HyOAs3nLZ/biggestCatches';
    const USER_ENCRYPT = btoa('test:test');
    const HEADER = {'Authorization': 'Basic ' + USER_ENCRYPT};

    let btnAdd = $('.add');
    btnAdd.on('click', addNewCatch);
    let btnLoad = $('.load');
    btnLoad.on('click', listAllCatches);

    let anglerInput = $('.angler');
    let weightInput = $('.weight');
    let speciesInput = $('.species');
    let locationInput = $('.location');
    let baitInput = $('.bait');
    let captureTimeInput = $('#addForm .captureTime');

    // POST REQUEST
    function addNewCatch() {

        $.ajax({
            method: 'POST',
            url: BASE_URL,
            headers: HEADER,
            contentType: 'application/json',
            data: JSON.stringify({
                angler: anglerInput.val(),
                weight: Number(weightInput.val()),
                species: speciesInput.val(),
                location: locationInput.val(),
                bait: baitInput.val(),
                captureTime: Number(captureTimeInput.val())
            }),
            success: listAllCatches,
            error: showError
        });

        anglerInput.val('');
        weightInput.val('');
        speciesInput.val('');
        locationInput.val('');
        baitInput.val('');
        captureTimeInput.val('');
    }

    // GET REQUEST
    function listAllCatches() {

        $.ajax({
            method: 'GET',
            url: BASE_URL,
            headers: HEADER,
            success: showCatches,
            error: showError
        });

        function showCatches(catchesData) {

            let catchesDiv = $('#catches');
            catchesDiv.empty();

            for (let currCatch of catchesData) {
                catchesDiv.append($('<div class="catch">').attr('data-id', `${currCatch._id}`)
                    .append($('<label>Angler</label>'))
                    .append($('<input type="text" class="angler"/>').val(`${currCatch.angler}`))
                    .append($('<label>Weight</label>'))
                    .append($('<input type="number" class="weight"/>').val(`${currCatch.weight}`))
                    .append($('<label>Species</label>'))
                    .append($('<input type="text" class="species"/>').val(`${currCatch.species}`))
                    .append($('<label>Location</label>'))
                    .append($('<input type="text" class="location"/>').val(`${currCatch.location}`))
                    .append($('<label>Bait</label>'))
                    .append($('<input type="text" class="bait"/>').val(`${currCatch.bait}`))
                    .append($('<label>Capture Time</label>'))
                    .append($('<input type="number" class="captureTime"/>').val(`${currCatch.captureTime}`))
                    .append($('<button class="update">Update</button>')
                        .on('click', function () {
                            let currDiv = $("div").find("[data-id='" + currCatch._id + "']");

                            // PUT REQUEST
                                $.ajax({
                                    method: 'PUT',
                                    url: BASE_URL + `/${currCatch._id}`,
                                    headers: HEADER,
                                    contentType: 'application/json',
                                    data: JSON.stringify({
                                        angler: currDiv.find('.angler').val(),
                                        weight: Number(currDiv.find('.weight').val()),
                                        species: currDiv.find('.species').val(),
                                        location: currDiv.find('.location').val(),
                                        bait: currDiv.find('.bait').val(),
                                        captureTime: Number(currDiv.find('.captureTime').val())
                                    }),
                                    success: listAllCatches,
                                    error: showError
                                });
                        }))
                    .append($('<button class="delete">Delete</button>')
                        .on('click', function () {
                            $.ajax({
                                method: 'DELETE',
                                url: BASE_URL + `/${currCatch._id}`,
                                headers: HEADER,
                                contentType: 'application/json',
                                // success: listAllCatches,
                                success: () => $("div").find("[data-id='" + currCatch._id + "']").remove(),
                                error: showError
                            });
                        }))
                );
            }
        }
    }

    function showError(error) {

        let main = $('#main');
        main.empty();
        main.append($('<h2>Upsss something went wrong!</h2>').css('color', 'red'));
        main.append($('<button>Reload</button>')
            .on('click', () => location.reload()));
    }
}
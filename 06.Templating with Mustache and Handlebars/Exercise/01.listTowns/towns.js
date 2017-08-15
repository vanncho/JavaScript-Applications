$(() => {
    $('#btnLoadTowns').click(attachEvents);

    function attachEvents() {

        const templates = {};

        let ulDom = $('#root');
        let inputTownsDom = $('#towns');

        loadTemplates();

        let towns = inputTownsDom.val().split(', ');
        console.log(towns);

        async function loadTemplates() {
            const [townsSource] =
                await Promise.all(
                    [
                        $.get('./templates/townsList.html')
                    ]);

            templates.listTemplates = Handlebars.compile(townsSource);
            renderList();
        }
        
        function renderList() {
            ulDom.html(templates.listTemplates(towns));
        }
    }
});
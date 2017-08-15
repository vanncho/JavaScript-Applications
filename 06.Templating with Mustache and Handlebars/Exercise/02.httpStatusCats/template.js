$(() => {
    renderCatTemplate();

    function renderCatTemplate() {

        const templates = {};
        const cats = window.cats;

        loadTemplates();

        let listContent = $('#allCats');

        async function loadTemplates() {
            let [catSource] =
                await Promise.all([
                    $.get('./templates/catsList.html')
                ]);

            templates.listTemplates = Handlebars.compile(catSource);
            renderList();
        }

        function renderList() {
            listContent.html(templates.listTemplates(cats));
            showCatMessage();
        }

        function showCatMessage() {

            $('button').click((e) => {
                let btn = $(e.target);
                let div = $(btn).next();

                if (div.css('display') === 'none') {
                    div.show();
                    btn.text('Hide status code');
                } else {
                    div.hide();
                    btn.text('Show status code');
                }
            });
        }
    }
});
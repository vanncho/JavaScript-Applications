$(() => {

    const templates = {};

    const context = {
        contacts: []
    };

    const listContent = $('#list').find('.content');
    const detailedContent = $('#details').find('.content');

    loadData();
    loadTemplates();

    async function loadData() {
        context.contacts = await $.get('data.json');
    }

    async function loadTemplates() {
        const [contactSource, listSource] =
            await Promise.all([
                $.get('./templates/contact.html'),
                $.get('./templates/contactList.html'),
            ]);

        Handlebars.registerPartial('contact', contactSource);
        templates.listTemplates = Handlebars.compile(listSource);

        renderList();
    }

    function renderList() {
        listContent.html(templates.listTemplates(context));
    }
});
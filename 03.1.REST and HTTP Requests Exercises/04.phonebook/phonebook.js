function attachEvents() {

    const BASE_URL = 'https://phonebook-nakov.firebaseio.com/phonebook';

    let btnLoad = $('#btnLoad');
    btnLoad.on('click', loadContacts);

    let btnCreate = $('#btnCreate');
    btnCreate.on('click', addContact);

    function addContact() {
        let personInput = $('#person');
        let phoneInput = $('#phone');
        let person = personInput.val();
        let phone = phoneInput.val();

        if (person.length > 0 && phone.length > 0) {

            let personToAdd = {
                person,
                phone
            };

            $.ajax({
                url: BASE_URL + '.json',
                method: "POST",
                data: JSON.stringify(personToAdd),
                dataType: 'application/json'
            })
        }

        personInput.val('');
        phoneInput.val('');
    }

    function loadContacts() {

        let phonebook = $('#phonebook');
        phonebook.empty();

        $.ajax({
            url: BASE_URL + '.json',
            method: 'GET',
            success: load
        });

        function load(data) {

            for (let contact in data) {
                phonebook.append($(`<li id='${contact}'>${data[contact].person}: ${data[contact].phone} </li>`)
                    .append($('<button>[Delete]</button>')
                        .on('click', () => {
                            // console.log('deletec' + contact);
                            $.ajax({
                                url: BASE_URL + `/${contact}.json`,
                                method: "DELETE",
                                success: loadContacts
                            })
                        })));
            }
        }
    }
}
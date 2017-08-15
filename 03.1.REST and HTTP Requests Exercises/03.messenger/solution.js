function attachEvents() {

    displayMessages();

    let refreshBtn = $('#refresh');
    refreshBtn.on('click', displayMessages);
    
    let submitBtn = $('#submit');
    submitBtn.on('click', saveMessage);

    let textarea = $('#messages');

    function displayMessages() {
        $.ajax({
            url: 'https://messenger-41901.firebaseio.com/messenger.json',
            method: 'GET',
            success: populateData
        });

        function populateData(data) {
            let text = '';
            for (let message in data) {
                text += `${data[message].author}: `;
                text += `${data[message].content}\n`;
            }
            textarea.text(text);
        }
    }

    function saveMessage() {

        let authorInput = $('#author');
        let contentInput = $('#content');
        let author = authorInput.val();
        let content = contentInput.val();
        let timestamp = Date.now();

        if (author.length > 0 && content.length > 0) {

            let newMessage = {
                author,
                content,
                timestamp
            };

            $.ajax({
                url: `https://messenger-41901.firebaseio.com/messenger/.json`,
                method: 'POST',
                data: JSON.stringify(newMessage),
                dataType: 'application/json'
            });
        }

        authorInput.val('');
        contentInput.val('');
    }
}
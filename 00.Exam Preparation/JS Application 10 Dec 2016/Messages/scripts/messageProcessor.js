let messageProcessor = (() => {

    function getMyMessages(username) {

        return requester.get('appdata', `messages/?query={"recipient_username":"${username}"}`, 'kinvey');
    }

    function sendMessage(newMsgObj) {

        return requester.post('appdata', 'messages', 'kinvey', newMsgObj);
    }

    function getMySentMessages(username) {

        return requester.get('appdata', `messages/?query={"sender_username":"${username}"}`, 'kinvey');
    }

    function deleteMessage(id) {

        return requester.remove('appdata', `messages/${id}`, 'kinvey');
    }

    return {
        getMyMessages,
        sendMessage,
        getMySentMessages,
        deleteMessage
    }
})();
let shopProcessor = (() => {
    
    function getAllProducts() {

        return requester.get('appdata', 'products', 'kinvey');
    }

    function getProductById(productId) {

        return requester.get('appdata', `products/${productId}`, 'kinvey');
    }

    return {
        getAllProducts,
        getProductById
    }
})();
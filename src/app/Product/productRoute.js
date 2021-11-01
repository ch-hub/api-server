module.exports = function(app) {
    const product = require('./productController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    //상품 정보조회
    app.get('/app/products',product.getProducts);

    app.get('/app/products/:productIdx',product.getProductsIdx);

}
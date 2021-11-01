const nft = require("./nft");
const jwtMiddleware = require("../../../config/jwtMiddleware");
const productProvider = require("../../app/Product/productProvider");
const productService = require("../../app/Product/productService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const {emit} = require("nodemon");
const CaverExtKAS = require('caver-js-ext-kas')
const Caver = require('caver-js')


exports.getProducts = async function(req,res){

        const productList = await productProvider.retrieveProductList();
        return res.send(response(baseResponse.SUCCESS, productList));
};

exports.getProductsIdx = async function(req,res){
    const productIdx = req.params.productIdx;

        const productListByIdx = await productProvider.retrieveProductIdx(productIdx);
        return res.send(response(baseResponse.SUCCESS, productListByIdx));
};
require('dotenv').config()
const nft = require("./nft");
const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const {emit} = require("nodemon");
const CaverExtKAS = require('caver-js-ext-kas')
const caver = new CaverExtKAS();
const chainId = 1001;
const accessKeyId = "KASKEKWRG3OV1873Y743FB5M";
const secretAccessKey = "6P3gXM3bnjUjRr7beeHhG0KEZxhNAQzmC_7vOfNf";
const request = require('request');
const cron = require('node-cron');

const multer = require('multer');
const path = require('path');
const fs = require('fs')

caver.initKASAPI(chainId, accessKeyId, secretAccessKey);
caver.initKIP7API(chainId, accessKeyId, secretAccessKey);
caver.initWalletAPI(chainId, accessKeyId, secretAccessKey);
caver.initKIP17API(chainId, accessKeyId, secretAccessKey);

const SELLER_ADDR = '0x2daf96ac3075c7e74a03844de0a31f17477e92e0'

/**
 * API No. 0
 * API Name : 테스트 API
 * [GET] /app/test
 */
// exports.getTest = async function (req, res) {
//     return res.send(response(baseResponse.SUCCESS))
// }

/**
 * API No. 1
 * API Name : 유저 생성 (회원가입) API
 * [POST] /app/users
 */
exports.postUsers = async function (req, res) {

    /**
     * Body: email, password, nickname
     */
    const {id,pw,name,phone,address} = req.body;

    if (!id) return res.send(errResponse(baseResponse.SIGNUP_ID_EMPTY));
    if (!pw) return res.send(errResponse(baseResponse.SIGNUP_PW_EMPTY));
    if (!phone) return res.send(errResponse(baseResponse.SIGNUP_PHONE_EMPTY));
    if (!name) return res.send(errResponse(baseResponse.SIGNUP_NAME_EMPTY));
    if (!address) return res.send(errResponse(baseResponse.SIGNUP_ADDRESS_EMPTY));
    console.log(id, pw)
    const signUpResponse = await userService.createUser(
        id,
        pw,
        name,
        phone,
        address
    );
    return res.send(signUpResponse);
};

exports.postImage = async function(req,res){
    console.log(req.file);
    return res.send(response(baseResponse.SUCCESS,req.file.filename));
}
exports.getBnplInfo = async function(req,res){
    const id = req.params.id;

    const dealId = await userProvider.getDeal(id);
    return res.send(response(baseResponse.SUCCESS, dealId));
}
exports.getWallet = async function(req,res){
    const userIdFromJWT = req.verifiedToken.userId

    const id = req.params.id;

    if (userIdFromJWT != id) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }

    if (!id) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    const result = await userProvider.getAccount(id);
    const balance = await nft.getBalance(result.walletAddress)
    const res2 = parseInt(balance,16)

    // console.log(res2.toString())
    // console.log(result.walletAddress)

    const walletBalance = res2.toString()
    const walletAd = result.walletAddress
    // klay 잔고
    const walletBalance2 = caver.utils.convertFromPeb(walletBalance,"mKLAY");
    // stable 잔고
    const ret = await caver.kas.kip7.balance(process.env.HONGIK_ALIAS, walletAd);

    const ret2 = parseInt(ret.balance,16);

    const stableBalance = caver.utils.convertToPeb(ret2, "peb");

    const nftaddress = await userProvider.findNftAddress();

    var i;
    let productIdxList = []
    for(i = 0; i<nftaddress.length; i++)
    {
        const nftret = await caver.kas.kip17.getTokenListByOwner(nftaddress[i].nft_address,walletAd);
        if(nftret.items.length >=1)
        {
            let idxRes = await userProvider.findIdx(nftaddress[i].nft_address);
            productIdxList.push(idxRes['productIdx'])
        }
    }


    const walletResult = {walletAd,walletBalance2,stableBalance,productIdxList};
    return res.send(response(baseResponse.SUCCESS, walletResult));
}

exports.makeipfs = async function(req,res)
{
    const result = await nft.makeTokenURI();
    return res.send(response(baseResponse.SUCCESS, result));
}
exports.klays = async function(req,res)
{
    const options = {
        uri: "https://api.coingecko.com/api/v3/simple/price?ids=klay-token&vs_currencies=krw"
    };
    request(options,function(err,r,body){
        const output = JSON.parse(body)
        const value = output["klay-token"]["krw"]
        return res.send(response(baseResponse.SUCCESS, value));
    })
}
async function payback(firstpayWon,buyerId, remainsWon, installment){
    const findAddress = await userProvider.findOne(buyerId);

    const walletAddress = findAddress.walletAddress;

    remainsWon = remainsWon - firstpayWon;

    const hexAmount1 = caver.utils.convertToPeb(firstpayWon, "peb");

    const result1 = await caver.kas.kip7.transfer(process.env.HONGIK_ALIAS, walletAddress, process.env.COMPANY_ADDRESS, hexAmount1);


    installment = installment - 1;
    const insertDeal = await userService.insertProductInfo(buyerId, remainsWon, installment);

    const findIdx = await userProvider.findDealIdx(buyerId);

    const deal_idx = findIdx.deal_idx;

    const insertCal = await userService.insertCalInfo(deal_idx);
}

exports.test = async function(req,res){
    const buyerId = req.body.buyerId;           // 구매자 ID
    // const timer = await userProvider.timer();
    cron.schedule('* * * * *', function () {
        userProvider.timer()
            .then((timer)=>{
            console.log(timer);
            payback(50000,buyerId,timer[0].remains,timer[0].installment)
        })
            .catch((e)=>{
                console.log(e)
            })
    });
    return res.send(response(baseResponse.SUCCESS));
}
/**
 * API No. 2
 * API Name : 유저 조회 API (+ 이메일로 검색 조회)
 * [GET] /app/users
 */
exports.getUsers = async function (req, res) {

    /**
     * Query String: email
     */
    const email = req.query.email;

    if (!email) {
        // 유저 전체 조회
        const userListResult = await userProvider.retrieveUserList();
        return res.send(response(baseResponse.SUCCESS, userListResult));
    } else {
        // 유저 검색 조회
        const userListByEmail = await userProvider.retrieveUserList(email);
        return res.send(response(baseResponse.SUCCESS, userListByEmail));
    }
};

/**
 * API No. 3
 * API Name : 특정 유저 조회 API
 * [GET] /app/users/{userId}
 */
exports.getUserById = async function (req, res) {

    /**
     * Path Variable: userId
     */
    const userId = req.params.userId;

    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));

    const userByUserId = await userProvider.retrieveUser(userId);
    return res.send(response(baseResponse.SUCCESS, userByUserId));
};


// TODO: After 로그인 인증 방법 (JWT)
/**
 * API No. 4
 * API Name : 로그인 API
 * [POST] /app/login
 * body : email, passsword
 */
exports.login = async function (req, res) {

    const {id, pw} = req.body;

    // TODO: email, password 형식적 Validation

    const signInResponse = await userService.postSignIn(id, pw);

    return res.send(signInResponse);
};


/**
 * API No. 5
 * API Name : 회원 정보 수정 API + JWT + Validation
 * [PATCH] /app/users/:userId
 * path variable : userId
 * body : nickname
 */
exports.patchUsers = async function (req, res) {

    // jwt - userId, path variable :userId

    const userIdFromJWT = req.verifiedToken.userId

    const userId = req.params.userId;
    const nickname = req.body.nickname;

    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        if (!nickname) return res.send(errResponse(baseResponse.USER_NICKNAME_EMPTY));

        const editUserInfo = await userService.editUser(userId, nickname)
        return res.send(editUserInfo);
    }
};

async function transferValue(fromId, toId, value) {
    // 결제
    const fromUser = await userProvider.findOne(fromId);
    const toUser = await userProvider.findOne(toId);
    const tx = {
        from: fromUser.walletAddress,
        to: toUser.walletAddress,
        value: value,
        submit: true,
    };
    const result = await caver.kas.wallet.requestValueTransfer(tx);
    return result;
}

exports.giveStable = async function (req, res) {
    const buyerId = req.body.buyerId;
    const amount = req.body.amount;
    const findAddress = await userProvider.findOne(buyerId);
    const walletAddress = findAddress.walletAddress;
    const hexAmount = caver.utils.convertToPeb(amount, "peb");
    const result = await caver.kas.kip7.transfer(process.env.HONGIK_ALIAS, process.env["COMPANY_ADDRESS "], walletAddress, hexAmount);
    console.log(result);
    return res.send(response(baseResponse.SUCCESS));
};

exports.giveKlay = async function (req, res) {
    const buyerId = req.body.buyerId;
    const amount = req.body.amount;
    const findAddress = await userProvider.findOne(buyerId);
    const walletAddress = findAddress.walletAddress;
    const hexAmount = caver.utils.convertToPeb(amount, "mKLAY");
    const tx = {
        from: process.env.COMPANY_ADDRESS,
        to: walletAddress,
        value: hexAmount,
        gas: 25000,
        memo: 'memo',
        submit: true
    }
    const result = await caver.kas.wallet.requestValueTransfer(tx)
    console.log(result);
    return res.send(response(baseResponse.SUCCESS));
};


exports.postDeal = async function(req,res){

    const buyerId = req.body.buyerId;           // 구매자 ID
    const productIdx = req.body.productIdx;     // 상품 ID
    const installment = req.body.installment;   // 할부 카운트

    const productInfo = await userProvider.findProduct(productIdx);

    const klay_price = productInfo.price / 2000;

    //첫 결제 대금(원화)
    const firstpayWon = klay_price/installment + klay_price%installment
    // 남은 결제 대금(원화)
    const remainsWon = klay_price - firstpayWon

    // 원화 -> klay(peb단위) 로 변환
    // 지금은 그대로 바꿨지만 나중에 환율 변화 필요
    const totalpayKlay = caver.utils.convertToPeb(klay_price, "mKLAY")
    const firstpayKlay = caver.utils.convertToPeb(firstpayWon, "mKLAY")
    const remainpayKlay = caver.utils.convertToPeb(remainsWon, "mKLAY")

    const buyerToCompany = await transferValue(buyerId, "company",firstpayKlay);
    const companyToSeller = await transferValue("company", productInfo.ownerId, firstpayKlay);
    console.log(buyerToCompany)
    console.log(companyToSeller)


    // 남은 할부 개월 수, 결제 비용은 저장
    const insertDeal = await userService.insertProductInfo(buyerId, remainsWon, installment-1);

    const findIdx = await userProvider.findDealIdx(buyerId);

    const deal_idx = findIdx.deal_idx;

    const insertCal = await userService.insertCalInfo(deal_idx);


    res.json(companyToSeller);


    // console.log(productInfo.price)
    // console.log(firstpayWon)
    // console.log(remainsWon)
    // console.log(' ')
    // console.log(totalpayKlay)
    // console.log(firstpayKlay)
    // console.log(remainpayKlay)
    // console.log(' ')
    // console.log(caver.utils.convertFromPeb(totalpayKlay))
    // console.log(caver.utils.convertFromPeb(firstpayKlay))
    // console.log(caver.utils.convertFromPeb(remainpayKlay))
};


exports.postDealStable = async function(req,res){

    const buyerId = req.body.buyerId;           // 구매자 ID
    const productIdx = req.body.productIdx;     // 상품 ID
    const installment = req.body.installment;   // 할부 카운트

    const productInfo = await userProvider.findProduct(productIdx);


    // 첫 결제 대금(원화)
    const firstpayWon = productInfo.price/installment + productInfo.price%installment
    // 남은 결제 대금(원화)
    const remainsWon = productInfo.price - firstpayWon


    const findAddress = await userProvider.findOne(buyerId);

    const walletAddress = findAddress.walletAddress;
    // 고객 -> company
    const hexAmount1 = caver.utils.convertToPeb(firstpayWon, "peb");
    // company -> seller
    const hexAmount2 = caver.utils.convertToPeb(firstpayWon, "peb");

    const result1 = await caver.kas.kip7.transfer(process.env.HONGIK_ALIAS, walletAddress, process.env.COMPANY_ADDRESS, hexAmount1);

    const result2 = await caver.kas.kip7.transfer(process.env.HONGIK_ALIAS, process.env.COMPANY_ADDRESS, walletAddress, hexAmount2);
    console.log(result1);
    console.log(result2);


    const insertDeal = await userService.insertProductInfo(buyerId, remainsWon, installment-1);

    const findIdx = await userProvider.findDealIdx(buyerId);

    const deal_idx = findIdx.deal_idx;

    const insertCal = await userService.insertCalInfo(deal_idx);
    return res.send(response(baseResponse.SUCCESS));

};


exports.postUpload = async function(req,res){
    const name = req.body.name;
    const price = req.body.price;
    const info = req.body.info;
    if(!name)
        return res.send(response(baseResponse.NAME_EMPTY));
    if(!price)
        return res.send(response(baseResponse.PRICE_EMPTY));
    if(!info)
        return res.send(response(baseResponse.INFO_EMPTY));
    const postBoardResponse = await userService.upload(name,price,info);
    return res.send(postBoardResponse);
}


/** JWT 토큰 검증 API
 * [GET] /app/auto-login
 */
exports.check = async function (req, res) {
    const userIdResult = req.verifiedToken.userId;
    console.log(userIdResult);
    return res.send(response(baseResponse.TOKEN_VERIFICATION_SUCCESS));
};

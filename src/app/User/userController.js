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


exports.getWallet = async function(req,res){
    const id = req.params.id;
    if (!id) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
    const result = await userProvider.getAccount(id);
    const balance = await nft.getBalance(result.walletAddress)
    const res2 = parseInt(balance,16)
    // console.log(res2.toString())
    // console.log(result.walletAddress)
    const walletBalance = res2.toString()
    const walletAd = result.walletAddress
    const walletResult = {walletAd,walletBalance}
    return res.send(response(baseResponse.SUCCESS, walletResult));
}
exports.test = async function(req,res){
    const timer = await userProvider.timer();
    return res.send(response(baseResponse.SUCCESS,timer));
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

    const {email, password} = req.body;

    // TODO: email, password 형식적 Validation

    const signInResponse = await userService.postSignIn(email, password);

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

caver.initKASAPI(chainId, accessKeyId, secretAccessKey);

exports.postDeal = async function(req,res){

    const buyerId = req.body.buyerId;
    const productIdx = req.body.productIdx;
    const installment = req.body.installment;

    const productInfo = await userProvider.findProduct(productIdx);
    let value = productInfo.price;
    let sellerId = productInfo.ownerId;
    let remains = value - value/installment;
    const insertDeal = await userService.insertProductInfo(buyerId, remains, installment);


    let fromUser = await userProvider.findOne(buyerId);
    let toUser = await userProvider.findOne("company");
    value = value * 100000000000000000 / installment;

    const tx = {
        from: fromUser.walletAddress,
        to: toUser.walletAddress,
        value: value,
        submit: true,
    };
    const result = await caver.kas.wallet.requestValueTransfer(tx);
    fromUser = await userProvider.findOne("company");
    toUser = await userProvider.findOne(sellerId);

    value = value * 100000000000000000;
    const tx2 = {
        from: fromUser.walletAddress,
        to: toUser.walletAddress,
        value: value,
        submit: true,
    }
    const result2 = await caver.kas.wallet.requestValueTransfer(tx2);
    res.json(result);
};










/** JWT 토큰 검증 API
 * [GET] /app/auto-login
 */
exports.check = async function (req, res) {
    const userIdResult = req.verifiedToken.userId;
    console.log(userIdResult);
    return res.send(response(baseResponse.TOKEN_VERIFICATION_SUCCESS));
};

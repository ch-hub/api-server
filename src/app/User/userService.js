const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const userProvider = require("./userProvider");
const userDao = require("./userDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const CaverExtKAS = require('caver-js-ext-kas')
const Caver = require('caver-js')

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");
const nft = require("./nft");

// Service: Create, Update, Delete 비즈니스 로직 처리

// exports.createAccount = async function(){
//     try{
//         const result = await nft.createAccount()
//         console.log(result.address);
//         const connection = await pool.getConnection(async (conn) => conn);
//         const walletAddress = result.address;
//         const userWallet = await userDao.insertUserWallet(connection, walletAddress);
//         connection.release();
//         return response(baseResponse.SUCCESS);
//     }catch (error) {
//         console.error(error)
//     }
// }
exports.createUser = async function (id,pw,name,phone,address) {
    try {
        // 이메일 중복 확인

        const idRows = await userProvider.idCheck(id);
        if (idRows.length > 0)
            return errResponse(baseResponse.SIGNUP_REDUNDANT_ID);

        const result = await nft.createAccount()
        console.log(result.address);
        const walletAddress = result.address;

        const hashedPassword = await crypto
            .createHash("sha512")
            .update(pw)
            .digest("hex");

        const insertUserInfoParams = [id,hashedPassword,name,phone,address,walletAddress];

        const connection = await pool.getConnection(async (conn) => conn);

        const userIdResult = await userDao.insertUserInfo(connection, insertUserInfoParams);

        connection.release();
        return response(baseResponse.SUCCESS);


    } catch (err) {
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


// TODO: After 로그인 인증 방법 (JWT)
exports.postSignIn = async function (id, pw) {
    try {
        // 이메일 여부 확인
        const idRows = await userProvider.idCheck(id);
        if (idRows.length < 1) return errResponse(baseResponse.SIGNIN_ID_WRONG);

        const selectId = idRows[0].id

        // 비밀번호 확인
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(pw)
            .digest("hex");

        const selectUserPasswordParams = [selectId, hashedPassword];
        const passwordRows = await userProvider.passwordCheck(selectUserPasswordParams);

        if(passwordRows[0]==undefined)
            return errResponse(baseResponse.SIGNIN_PASSWORD_WRONG);
        if (passwordRows[0].pw !== hashedPassword) {
            return errResponse(baseResponse.SIGNIN_PASSWORD_WRONG);
        }

        // 계정 상태 확인
        // const userInfoRows = await userProvider.accountCheck(email);
        //
        // if (userInfoRows[0].status === "INACTIVE") {
        //     return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        // } else if (userInfoRows[0].status === "DELETED") {
        //     return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
        // }

        console.log(idRows[0].id) // DB의 userId

        //토큰 생성 Service
        let token = await jwt.sign(
            {
                userId: idRows[0].id,
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
                expiresIn: "365d",
                subject: "User",
            } // 유효 기간 365일
        );

        return response(baseResponse.SUCCESS, {'userId': idRows[0].id, 'jwt': token});

    } catch (err) {
        logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.editUser = async function (id, nickname) {
    try {
        console.log(id)
        const connection = await pool.getConnection(async (conn) => conn);
        const editUserResult = await userDao.updateUserInfo(connection, id, nickname)
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.insertProductInfo = async function (buyerId, remains, installment) {
    try {
        const insertDealInfoParams = [buyerId, remains, installment];
        const connection = await pool.getConnection(async (conn) => conn);
        const insertProductResult = await userDao.insertDealInfo(connection, insertDealInfoParams)
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editUser Service error23213\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.insertCalInfo = async function (deal_idx) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const editUserResult = await userDao.insertCalInfo(connection, deal_idx)
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}
exports.patchOwnerId = async function(buyerId,productIdx){
    try {
        const patchOwnerParams = [buyerId, productIdx];
        const connection = await pool.getConnection(async (conn) => conn);
        const editUserResult = await userDao.patchOwnerIds(connection, patchOwnerParams)
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}
exports.upload = async function (ownerId,name,price,info,imageName,SELLER_ADDR,imageUrl,tokenId){
    try {
        const insertProductInfoParams = [ownerId,name,price,info,imageName,SELLER_ADDR,imageUrl,tokenId];
        const connection = await pool.getConnection(async (conn) => conn);
        const editProduct = await userDao.insertProductInfo(connection, insertProductInfoParams)
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}
module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const multer = require('multer');
    const path = require('path');
    const fs = require('fs');
    try{
        fs.readdirSync('uploads');
    }
    catch (error){
        fs.mkdirSync('uploads');
    }

    const upload = multer({
        storage: multer.diskStorage({
            // set a localstorage destination
            destination: (req, file, cb) => {
                cb(null, 'uploads/');
            },
            // convert a file name
            filename: (req, file, cb) => {
                cb(null, new Date().valueOf() + path.extname(file.originalname));
            },
        }),
    });
    // 0. 테스트 API
    // app.get('/app/test', user.getTest)

    // 1. 유저 생성 (회원가입) API
    app.post('/app/users', user.postUsers);

    // 2. 유저 조회 API (+ 검색)
    app.get('/app/users',user.getUsers);

    app.get('/app/wallet/:id',jwtMiddleware, user.getWallet);

    app.get('/app/test',user.test);

    app.get('/app/klay',user.klays);

    app.post('/app/ipfs',user.makeipfs);

    //hongiktoken 전송
    app.post('/app/stable',user.giveStable);

    //KLAY 전송
    app.post('/app/klay',user.giveKlay);

    // 전송
    app.post('/app/deal',user.postDeal);

    // STABLE 딜
    app.post('/app/deal/stable',user.postDealStable);

    app.get('/app/bnpl/:id',user.getBnplInfo);


    app.post('/app/image',upload.single('img'),user.postImage);

    app.post('/app/upload',jwtMiddleware,user.postUpload);

    // TODO: After 로그인 인증 방법 (JWT)
    // 로그인 하기 API (JWT 생성)
    app.post('/app/login', user.login);

    // 회원 정보 수정 API (JWT 검증 및 Validation - 메소드 체이닝 방식으로 jwtMiddleware 사용)
    app.patch('/app/users/:userId', jwtMiddleware, user.patchUsers)

};


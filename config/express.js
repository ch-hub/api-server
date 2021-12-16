const express = require('express');
const compression = require('compression');
const methodOverride = require('method-override');
var cors = require('cors');
var serveStatic = require('serve-static');
const path = require('path');

module.exports = function () {
    const app = express();

    app.use(compression());

    app.use(express.json());

    app.use(express.urlencoded({extended: true}));

    app.use(methodOverride());

    app.use(cors());
    // app.use(express.static(process.cwd() + '/public'));

    // app.use(express.static(process.cwd() + '/uploads'))

    app.use(serveStatic(process.cwd() + '/uploads'));

    /* App (Android, iOS) */
    // TODO: 도메인을 추가할 경우 이곳에 Route를 추가하세요.
    require('../src/app/User/userRoute')(app);
    require('../src/app/Product/productRoute')(app);

    return app;
};
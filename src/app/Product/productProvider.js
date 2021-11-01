const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const schedule = require('node-schedule');
const rule = new schedule.RecurrenceRule();
const productDao = require("./productDao");
const cron = require('node-cron');

exports.retrieveProductList = async function (productIdx){
    if(!productIdx)
    {
        const connection = await pool.getConnection(async (conn) => conn);
        const productListResult = await productDao.selectProduct(connection);
        connection.release();
        return productListResult;
    }
    else {
        const connection = await pool.getConnection(async (conn) => conn);
        const productListResult = await productDao.selectProductIdx(connection, productIdx);
        connection.release();
        return productListResult;
    }
};
const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const schedule = require('node-schedule');
const rule = new schedule.RecurrenceRule();
const userDao = require("./userDao");
const cron = require('node-cron');
// Provider: Read 비즈니스 로직 처리

exports.retrieveUserList = async function (email) {
  if (!email) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userListResult = await userDao.selectUser(connection);
    connection.release();

    return userListResult;

  } else {
    const connection = await pool.getConnection(async (conn) => conn);
    const userListResult = await userDao.selectUserEmail(connection, email);
    connection.release();

    return userListResult;
  }
};
exports.timer = async function (){
  rule.minute = 1;
  const connection = await pool.getConnection(async (conn) => conn);
  const userAccount = await userDao.selectTimer(connection);
  cron.schedule('* * * * *', function () {
    console.log(userAccount[0]);
  });
  connection.release();
  return userAccount[0];
}

exports.getAccount = async function (id){
  const connection = await pool.getConnection(async (conn) => conn);
  const userAccount = await userDao.selectUserWallet(connection, id);

  connection.release();

  return userAccount[0];
}
exports.retrieveUser = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userResult = await userDao.selectUserId(connection, userId);

  connection.release();

  return userResult[0];
};

exports.idCheck = async function (id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const idCheckResult = await userDao.selectUserId(connection, id);
  connection.release();

  return idCheckResult;
};

exports.passwordCheck = async function (selectUserPasswordParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const passwordCheckResult = await userDao.selectUserPassword(
      connection,
      selectUserPasswordParams
  );
  connection.release();
  return passwordCheckResult[0];
};

exports.accountCheck = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userAccountResult = await userDao.selectUserAccount(connection, email);
  connection.release();

  return userAccountResult;
};

exports.findOne = async function (id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userAddressResult = await userDao.selectUserAddress(connection, id);
  connection.release();

  return userAddressResult[0];
};


exports.findProduct = async function (productIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const productInfoResult = await userDao.selectProductInfo(connection, productIdx);
  connection.release();

  return productInfoResult[0];
};

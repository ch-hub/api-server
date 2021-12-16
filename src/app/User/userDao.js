// 모든 유저 조회
async function selectUser(connection) {
  const selectUserListQuery = `
                SELECT email, nickname 
                FROM UserInfo;
                `;
  const [userRows] = await connection.query(selectUserListQuery);
  return userRows;
}

// 이메일로 회원 조회
async function selectUserId(connection, id) {
  const selectUserEmailQuery = `
                SELECT id 
                FROM User
                WHERE id = ?;
                `;
  const [idRows] = await connection.query(selectUserEmailQuery, id);
  return idRows;
}

// userId 회원 조회
async function selectUserIds(connection, userId) {
  const selectUserIdQuery = `
                 SELECT id, email, nickname 
                 FROM UserInfo 
                 WHERE id = ?;
                 `;
  const [userRow] = await connection.query(selectUserIdQuery, userId);
  return userRow;
}

// 유저 생성
async function insertUserInfo(connection, insertUserInfoParams) {
  const insertUserInfoQuery = `
        INSERT INTO User(id,pw,name,phone,address,walletAddress)
        VALUES (?, ?, ?, ?, ?,?);
    `;
  const insertUserInfoRow = await connection.query(
    insertUserInfoQuery,
    insertUserInfoParams
  );

  return insertUserInfoRow;
}
// async function insertUserWallet(connection,walletAddress){
//   const insertUserWalletQuery = `
//         INSERT INTO User(walletAddress)
//         VALUES (?);
//     `;
//   const insertUserWalletRow = await connection.query(
//       insertUserWalletQuery,
//       walletAddress
//   );
//
//   return insertUserWalletRow;
// }
// 패스워드 체크
async function selectUserPassword(connection, selectUserPasswordParams) {
  const selectUserPasswordQuery = `
        SELECT id, pw
        FROM User
        WHERE id = ? AND pw = ?;`;
  const selectUserPasswordRow = await connection.query(
      selectUserPasswordQuery,
      selectUserPasswordParams
  );

  return selectUserPasswordRow;
}
async function selectUserWallet(connection, id) {
  const selectUserAccountQuery = `
        SELECT walletAddress
        FROM User 
        WHERE id = ?;`;
  const selectUserWalletRow = await connection.query(
      selectUserAccountQuery,
      id
  );
  return selectUserWalletRow[0];
}
async function selectTimer(connection){
  const selectTimerQuery = `
    SELECT buyerId, remains, installment
    from Deal
           left join Calculate C on Deal.deal_idx = C.deal_idx
    ORDER BY deal_at DESC LIMIT 1;`;
  const selectTimerRow = await connection.query(
      selectTimerQuery
  );
  return selectTimerRow;
}
// 유저 계정 상태 체크 (jwt 생성 위해 id 값도 가져온다.)
async function selectUserAccount(connection, email) {
  const selectUserAccountQuery = `
        SELECT status, id
        FROM UserInfo 
        WHERE email = ?;`;
  const selectUserAccountRow = await connection.query(
      selectUserAccountQuery,
      email
  );
  return selectUserAccountRow[0];
}

async function updateUserInfo(connection, id, nickname) {
  const updateUserQuery = `
  UPDATE UserInfo 
  SET nickname = ?
  WHERE id = ?;`;
  const updateUserRow = await connection.query(updateUserQuery, [nickname, id]);
  return updateUserRow[0];
}

async function selectUserAddress(connection, id) {
  const selectUserAddressQuery = `
        SELECT walletAddress
        FROM User 
        WHERE id = ?;`;
  const selectUserAddressRow = await connection.query(
      selectUserAddressQuery,
      id
  );
  return selectUserAddressRow[0];
}
async function selectDealId(connection, id) {
  const selectUserAddressQuery = `
        SELECT remains,installment,deal_at
        FROM Deal
        WHERE buyerId = ?
        ORDER BY deal_at DESC LIMIT 1;`;
  const selectUserAddressRow = await connection.query(
      selectUserAddressQuery,
      id
  );
  return selectUserAddressRow[0];
}
async function selectNftAddress(connection){
  const selectNftListQuery = `
                SELECT nft_address
                FROM Product;
                `;
  const [userRows] = await connection.query(selectNftListQuery);
  return userRows;
}

async function selectProductIdx(connection, nft_address){
  const selectProductQuery = `
        SELECT productIdx
        FROM Product 
        WHERE nft_address = ?;`;
  const selectProductRow = await connection.query(
      selectProductQuery,
      nft_address
  );
  return selectProductRow[0];
}
async function selectProductInfo(connection, productIdx) {
  const selectProductQuery = `
        SELECT price, ownerId
        FROM Product 
        WHERE productIdx = ?;`;
  const selectProductRow = await connection.query(
      selectProductQuery,
      productIdx
  );
  return selectProductRow[0];
}

async function selectCalInfo(connection, buyerId) {
  const selectCalQuery = `
        SELECT deal_idx
        FROM Deal
        WHERE buyerId = ?
        ORDER BY deal_at DESC LIMIT 1;`;
  const selectCalRow = await connection.query(
      selectCalQuery,
      buyerId
  );
  return selectCalRow[0];
}
async function insertDealInfo(connection, insertDealInfoParams) {
  const insertDealInfoQuery = `
        INSERT INTO Deal(buyerId, remains, installment,deal_at)
        VALUES (?, ?, ?,current_timestamp);
    `;
  const insertDealInfoRow = await connection.query(
      insertDealInfoQuery,
      insertDealInfoParams
  );
  return insertDealInfoRow;
}

async function insertProductInfo(connection,insertProductInfoParams){
  const insertProductInfoQuery = `
        INSERT INTO Product(ownerId,name,price,info,imageName)
        VALUES (?, ?, ?, ?,?);
    `;
  const insertProductInfoRow = await connection.query(
      insertProductInfoQuery,
      insertProductInfoParams
  );
  return insertProductInfoRow;
}
async function insertCalInfo(connection, deal_idx) {
  const insertCalInfoQuery = `
        INSERT INTO Calculate(deal_idx,calculate_at)
        VALUES (?,current_timestamp );
    `;
  const insertCalInfoRow = await connection.query(
      insertCalInfoQuery,
      deal_idx
  );

  return insertCalInfoRow;
}



module.exports = {
  selectUser,
  selectUserId,
  selectUserIds,
  insertUserInfo,
  selectUserPassword,
  selectUserAccount,
  updateUserInfo,
  selectUserWallet,
  selectTimer,
  selectUserAddress,
  selectProductInfo,
  insertDealInfo,
  selectCalInfo,
  insertCalInfo,
  selectNftAddress,
  selectProductIdx,
  selectDealId,
  insertProductInfo
};

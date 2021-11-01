
async function selectProduct(connection) {
    const selectProductQuery = `
        SELECT *
        FROM Product;`;
    const [productRows] = await connection.query(
        selectProductQuery
    );
    return productRows;
}


async function selectProductIdx(connection,productIdx) {
    const selectProductQuery = `
        SELECT *
        FROM Product
        WHERE productIdx = ?;`;
    const [productIdxRows] = await connection.query(
        selectProductQuery,
        productIdx
    );
    return productIdxRows;
}

module.exports = {
    selectProduct,
    selectProductIdx
};
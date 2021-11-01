
async function selectProduct(connection) {
    const selectProductQuery = `
        SELECT *
        FROM Product;`;
    const [productRows] = await connection.query(
        selectProductQuery
    );
    return productRows;
}


module.exports = {
    selectProduct
};
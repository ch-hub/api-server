const CaverExtKAS = require('caver-js-ext-kas')
const Caver = require('caver-js')

// const config = require('../config/klaytnConfig')

// // Configuration Part
// const chainId = config.chainId
// const accessKeyId = config.accessKeyId
// const secretAccessKey = config.secretAccessKey

// Configuration Part
const chainId = 1001
const accessKeyId = "KASKEKWRG3OV1873Y743FB5M";
const secretAccessKey = "6P3gXM3bnjUjRr7beeHhG0KEZxhNAQzmC_7vOfNf";

//
caver = new CaverExtKAS()
caver.initKASAPI(chainId,accessKeyId,secretAccessKey)
//
// // 하기전 인증필요
// const initKAS = (chainId, accessKeyId, secretAccessKey) => {
//     try{
//         caver = new CaverExtKAS()
//         caver.initKASAPI(chainId, accessKeyId, secretAccessKey)
//     }catch (error) {
//         console.log(error)
//     }
// }
//
// /**
//  * 지갑 생성
//  * @returns {string} 생성된 주소값
//  */
const createAccount = async () => {
    try{
        const result = await caver.kas.wallet.createAccount()

        return result
    }catch (error) {
        console.error(error)
    }
}

const getBalance = async (account) => {
    try {
        const option = {
            headers: [
                {
                    name: 'Authorization',
                    value: `Basic ${Buffer.from(`${accessKeyId}:${secretAccessKey}`).toString('base64')}`,
                },
                { name: 'x-chain-id', value: chainId },
            ],
        }
        const caver = new Caver(new Caver.providers.HttpProvider("https://node-api.klaytnapi.com/v1/klaytn", option))

        const balance = await caver.rpc.klay.getBalance(account)
        return balance

    }catch (error){
        console.error(error)
    }
}


//
// /**
//  * 계약 배포
//  * @param {string} name
//  * @param {string} symbol
//  * @param {string} alias
//  * @returns {string,string} 전송상태, 트랜잭션 해시값
//  */
// const deployNft = async (name, symbol, alias) => {
//     const result = await caver.kas.kip17.deploy(name, symbol, alias)
//
//     return {
//         status : result['status'],
//         txHash : result['transactionHash']
//     }
// }
//
// const getReceipt = async (txHash) => {
//     receipt = await caver.kas.wallet.getTransaction(txHash)
//     return receipt
// }
//
// const checkTxCommitted = async (txHash) => {
//     receipt = await caver.kas.wallet.getTransaction(txHash)
//     return receipt['status'] == 'Committed'
// }
//
// const getContractAddress = async (alias) => {
//     let address = '0x0'
//
//     const lists = await caver.kas.kip17.getContractList()
//
//     for (item of lists['items']) {
//         console.log(item)
//         if(item['alias'] == alias){
//             address = item['address']
//
//         }
//     }
//     return address
// }
//
// /**
//  * 토큰 발행
//  * @param {string} nft contract 주소
//  * @param {string} 발행할 사람 주소
//  * @param {string} tokenUri
//  * @param {string} 발행량
//  * @returns {array} 생성된 토큰 txhash 값
//  */
// const mintToken = async (address, to, tokenUri, mintQty) => {
//     curSupply = await getNftTotalSupply(address)
//
//     txList = []
//     for (let i=1; i<=mintQty; i++){
//         tokenId = curSupply+i
//
//         const result = await caver.kas.kip17.mint(address, to, tokenId, tokenUri)
//         txList.push(result['transactionHash'])
//     }
//     return txList
// }
//
// /**
//  * owner가 갖고있는 특정 NFT 수량을 반환
//  * @param {string} address
//  * @param {string} owner
//  * @returns NftQty
//  */
// const getNftQtyByOwner = async (address, owner) => {
//     // without query parameter
//     const res = await caver.kas.kip17.getTokenListByOwner(address, owner)
//     return res['items'].length
// }
//
// /**
//  * owner 가 갖고있는 특정 nft 토큰id array를 반환
//  * @param {string} address
//  * @param {string} owner
//  * @returns
//  */
// const getTokenIdsByOwner = async (address, owner) => {
//     // without query parameter
//     const res = await caver.kas.kip17.getTokenListByOwner(address, owner)
//
//     tokenList = []
//     for (item of res['items']){
//         tokenList.push(item['tokenId'])
//     }
//     return tokenList
// }
//
//
// /**
//  *
//  * @param {string} nft contract 주소값
//  * @returns {number} nft 지금까지의 발행량
//  */
// const getNftTotalSupply = async (address) => {
//     const result = await caver.kas.tokenHistory.getNFTContract(address)
//     return Number(result['totalSupply'])
// }
//
//
const makeTokenURI = async () => {
    const option = {
        headers: [
            {
                name: 'Authorization',
                value: `Basic ${Buffer.from(`${accessKeyId}:${secretAccessKey}`).toString('base64')}`,
            },
            { name: 'x-chain-id', value: chainId },
        ],
    }
    const caver = new Caver(new Caver.providers.HttpProvider("https://node-api.klaytnapi.com/v1/klaytn", option))

    // Set connection with IPFS Node
    caver.ipfs.setIPFSNode('ipfs.infura.io', 5001, true)
    // `ipfs.txt` is located at `caver-js-examples/ipfs/using_ipfs_with_caver/resources`.
    const inputJSONfile = `C:\\Users\\장창훈\\api-server\\uploads`; // 민권 여기에 너가 올리고싶은 파일 경로 올리면댐

    // Add a file to IPFS with file path
    const cid = await caver.ipfs.add(inputJSONfile)
    console.log(`cid: ${cid}`)

    // console.log('tokenURI : https://ipfs.io/ipfs/' + cid)
    return "https://ipfs.io/ipfs/" + cid
}
//
//
// const main = async () => {
//     res =  await makeTokenURI()
//     console.log(res)
//
// }
// //
// main()
//
//
//
module.exports.createAccount = createAccount
module.exports.getBalance = getBalance
// module.exports.deployNft = deployNft
// module.exports.checkTxCommitted = checkTxCommitted
// module.exports.getContractAddress = getContractAddress
// module.exports.mintToken = mintToken
// module.exports.getNftQtyByOwner = getNftQtyByOwner
// module.exports.getTokenIdsByOwner = getTokenIdsByOwner
// module.exports.getNftTotalSupply = getNftTotalSupply
// module.exports.initKAS = initKAS
module.exports.makeTokenURI = makeTokenURI

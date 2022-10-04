const hre = require("hardhat")
const ethers = hre.ethers
const {ether} = require('@openzeppelin/test-helpers')
const {create, all} = require('mathjs')
const mathjs = create(all, {})

const tokens = (x) => {
    return ether(x).toString()
}

const fromWei = (x) => {
    return ethers.utils.formatEther(x)
}

const toTokens = (value, decimals = 18) => {
    return mathjs.multiply(value, mathjs.pow(10, decimals))
}

const fromTokens = (value, decimals = 18, round = false) => {
    let result = mathjs.divide(value.toString(), mathjs.pow(10, decimals.toString()))
    if (round) {
        result = mathjs.round(result, 2)
    }
    return result.toString()
}

const increaseTime = async (x) => {
    await ethers.provider.send('evm_increaseTime', [x])
    await ethers.provider.send("evm_mine")
}

const advanceBlock = async (x) => {
    for (let i = 0; i < x; i++) {
        await ethers.provider.send("evm_mine")
    }
}

const advanceDay = async (x) => {
    await increaseTime(86400 * x)
}

const getTime = async () => {
    const latestBlock = await ethers.provider.getBlock('latest')
    return latestBlock.timestamp
}

const keccak256 = (x) => {
    return ethers.utils.keccak256(x)
}

const toUtf8Bytes = (x) => {
    return ethers.utils.toUtf8Bytes(x)
}

const getEventsFromTransaction = async (transaction) => {
    let result = []
    const receipt = await transaction.wait()
    for (let x in receipt.events) {
        result.push({
            eventName: receipt.events[x].event,
            args: []
        })
        for (let y in receipt.events[x].args) {
            result[x].args[y] = receipt.events[x].args[y].toString()
        }
    }
    return result
}

const getGasUsed = async (transaction) => {
    const receipt = await transaction.wait()
    return receipt.gasUsed.toString()
}

const printAccountState = async function (app, accountName, account) {
    const depositBorrowValues = await app.unitroller.getDepositBorrowValues(account.address)
    const collateralBorrowValues = await app.unitroller.getCollateralBorrowValues(account.address)
    const liquidity = await app.unitroller.getAccountLiquidity(account.address)
    const _assetsIn = await app.unitroller.getAssetsIn(account.address)
    let underlyingDeposits = []
    let deposits = []
    let underlyingBorrows = []

    for (let i = 0; i < _assetsIn.length; i++) {
        const Asset = await ethers.getContractAt("PErc20Interface", _assetsIn[i])
        const UnderlyingAsset = await ethers.getContractAt("EIP20Interface", await Asset.underlying())
        deposits.push(fromTokens(await Asset.balanceOf(account.address), await Asset.decimals()) + " " + (await Asset.symbol()).toString())
        underlyingDeposits.push(fromTokens(await Asset.balanceOfUnderlyingStored(account.address), await UnderlyingAsset.decimals()) + " " + (await UnderlyingAsset.symbol()).toString())
        underlyingBorrows.push(fromTokens(await Asset.borrowBalanceStored(account.address), await UnderlyingAsset.decimals()) + " " + (await UnderlyingAsset.symbol()).toString())
    }

    console.log("%s account state: ", accountName)
    console.log("standard assets depo sum: %s USD (%s USD) (%s)", fromTokens(depositBorrowValues[0]), fromTokens(collateralBorrowValues[0]), underlyingDeposits, deposits)
    console.log("borrow value: %s USD (%s)", fromTokens(depositBorrowValues[2]), underlyingBorrows)
    console.log("liquidity: +%s USD", fromTokens(liquidity[1]))
    console.log("liquidity shortfall: -%s USD", fromTokens(liquidity[2]))
    console.log("")
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
const REPAY_MAX = '115792089237316195423570985008687907853269984665640564039457584007913129639935'

module.exports = {
    tokens,
    fromWei,
    toTokens,
    fromTokens,
    increaseTime,
    advanceBlock,
    getTime,
    keccak256,
    toUtf8Bytes,
    getEventsFromTransaction,
    getGasUsed,
    advanceDay,
    printAccountState,
    ZERO_ADDRESS,
    REPAY_MAX
}

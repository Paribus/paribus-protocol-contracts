const hre = require("hardhat")
const ethers = hre.ethers
const {setupPToken, setupMaximillion, setupToken} = require("../../test/utils/setupContracts")
const {tokens, advanceBlock, fromWei, advanceDay} = require('../../test/utils/testHelpers')
const {attachPlatformContracts, attachBasicTokens, attachPTokens,
    loadSettings, getTestAddresses, attachPEther, deployPEther, deployPriceOracle, loadPEtherSettings, attachLiquidator,
    loadSynthSettings, deployBasicTokens, deployPlatformContracts, PlatformHelper, deployPTokens, deploySynthetics, deployPSynthetics
}  = require("../utils")

async function testWbtcSDot(platform, basicTokens, pTokens) {
    let [owner, user1, user2, user3] = await ethers.getSigners()
    const helper = new PlatformHelper(platform, basicTokens, pTokens, user1, 'user1')
    const helper2 = new PlatformHelper(platform, basicTokens, pTokens, user2, 'user2')

    // ONE-TIME PRE CONFIG
    await basicTokens.wbtc.mint(user1.address, tokens('100'))
    await basicTokens.sdot.mint(user2.address, tokens('100'))

    await helper.printBalances([basicTokens.wbtc, pTokens.pwbtc, basicTokens.sdot, pTokens.psdot])

    console.log('--------------- USER1 SUPPLY WBTC -----------------')
    await helper.tokens().wbtc.enableAsCollateral()
    await helper.tokens().wbtc.enableSupply()
    await helper.tokens().wbtc.supply(tokens('100'))

    await helper.printBalances([basicTokens.wbtc, pTokens.pwbtc, basicTokens.sdot, pTokens.psdot])

    console.log('--------------- USER2 SUPPLY sDOT -----------------')
    await helper2.tokens().sDot.enableAsCollateral()
    await helper2.tokens().sDot.enableSupply()
    await helper2.tokens().sDot.supply(tokens('50'))

    await helper.printInfo()

    console.log('--------------- USER1 BORROW sDOT -----------------')
    await helper.tokens().sDot.borrow(tokens('50'))

    await helper.printBalances([basicTokens.wbtc, pTokens.pwbtc, basicTokens.sdot, pTokens.psdot])
    await helper.printInfo()

    console.log('--------------- USER1 REPAY sDOT -----------------')
    await helper.tokens().sDot.enableRepay()
    await helper.tokens().sDot.repay(tokens('50'))

    await helper.printBalances([basicTokens.wbtc, pTokens.pwbtc, basicTokens.sdot, pTokens.psdot])
    await helper.printInfo()
}

async function testWbtcSEth(platform, basicTokens, pTokens) {
    let [owner, user1, user2, user3] = await ethers.getSigners()
    const helper = new PlatformHelper(platform, basicTokens, pTokens, user1, 'user1')
    const helper2 = new PlatformHelper(platform, basicTokens, pTokens, user2, 'user2')

    // ONE-TIME PRE CONFIG
    await basicTokens.wbtc.mint(user1.address, tokens('100'))
    await basicTokens.seth.mint(user2.address, tokens('100'))

    await helper.printBalances([basicTokens.wbtc, pTokens.pwbtc])
    await helper2.printBalances([basicTokens.seth, pTokens.pseth])

    console.log('--------------- USER1 SUPPLY WBTC -----------------')
    await helper.tokens().wbtc.enableAsCollateral()
    await helper.tokens().wbtc.enableSupply()
    await helper.tokens().wbtc.supply(tokens('100'))

    await helper.printBalances([basicTokens.wbtc, pTokens.pwbtc])
    await helper.printInfo()

    console.log('--------------- USER2 SUPPLY sEth -----------------')
    await helper2.tokens().sEth.enableAsCollateral()
    await helper2.tokens().sEth.enableSupply()
    await helper2.tokens().sEth.supply(tokens('50'))

    await helper2.printBalances([basicTokens.seth, pTokens.pseth])

    console.log('--------------- USER1 BORROW sEth -----------------')
    await helper.tokens().sEth.borrow(tokens('50'))

    await helper.printBalances([basicTokens.seth, pTokens.pseth])
    await helper.printInfo()

    console.log('--------------- USER1 REPAY sEth -----------------')
    await helper.tokens().sEth.enableRepay()
    await helper.tokens().sEth.repay(tokens('50'))

    await helper.printBalances([basicTokens.seth, pTokens.pseth])
    await helper.printInfo()

    console.log('--------------- USER2 WITHDRAW sEth -----------------')
    await helper2.tokens().sEth.withdrawMax()

    await helper2.printBalances([basicTokens.seth, pTokens.pseth])
    await helper2.printInfo()
}

async function testWbtcUsdc(platform, basicTokens, pTokens) {
    let [owner, user1, user2, user3] = await ethers.getSigners()
    const helper = new PlatformHelper(platform, basicTokens, pTokens, user1, 'user1')
    const helper2 = new PlatformHelper(platform, basicTokens, pTokens, user2, 'user2')

    // ONE-TIME PRE CONFIG
    await basicTokens.usdc.mint(user2.address, tokens('1000'))
    await basicTokens.wbtc.mint(user1.address, tokens('100'))

    await helper.printBalances([basicTokens.wbtc, pTokens.pwbtc])
    await helper2.printBalances([basicTokens.usdc, pTokens.pusdc])

    console.log('--------------- USER1 SUPPLY WBTC-----------------')
    await helper.tokens().wbtc.enableAsCollateral()
    await helper.tokens().wbtc.enableSupply()
    await helper.tokens().wbtc.supply(tokens('100'))

    await helper.printBalances([basicTokens.wbtc, pTokens.pwbtc])
    await helper.printInfo()

    console.log('--------------- USER2 SUPPLY USDC -----------------')
    await helper2.tokens().usdc.enableAsCollateral()
    await helper2.tokens().usdc.enableSupply()
    await helper2.tokens().usdc.supply(tokens('1000'))

    await helper2.printBalances([basicTokens.usdc, pTokens.pusdc])

    console.log('--------------- USER1 BORROW USDC -----------------')
    await helper.tokens().usdc.borrow(tokens('500'))

    await helper.printBalances([basicTokens.usdc, pTokens.pusdc])
    await helper.printInfo()

    // console.log('--------------- USER1 REPAY USDC -----------------')
    // await helper.tokens().usdc.enableRepay()
    // await helper.tokens().usdc.repay(tokens('500'))
    //
    // await helper.printBalances([basicTokens.usdc, pTokens.pusdc])
    // await helper.printInfo()
    //
    // console.log('--------------- USER2 WITHDRAW USDC -----------------')
    // await helper2.tokens().usdc.withdrawMax()
    //
    // await helper2.printBalances([basicTokens.usdc, pTokens.pusdc])
    // await helper2.printInfo()
}

async function supplyEverythingAsOwner() {
    let [owner, user1, user2, user3] = await ethers.getSigners()
    const addresses = getTestAddresses()
    const basicTokens = await attachBasicTokens(addresses)
    const platform = await attachPlatformContracts(addresses)
    const pTokens = await attachPTokens(addresses)


    const helper = new PlatformHelper(platform, basicTokens, pTokens, owner, 'owner')
    const amount = tokens('100')

    await basicTokens.wbtc.mint(owner.address, amount)
    await basicTokens.usdc.mint(owner.address, amount)
    await basicTokens.dai.mint(owner.address, amount)

    await helper.allEnableSupply()

    await helper.tokens().wbtc.supply(amount)
    await helper.tokens().usdc.supply(amount)
    console.log(await helper.tokens().dai.supply(amount))

    await helper.allEnableAsCollateral()

    console.log(await basicTokens.pbx.mint(platform.unitroller.address, tokens('10')))
}

async function testIndexer(platform, basicTokens, pTokens) {
    let [owner, user1, user2, user3] = await ethers.getSigners()

    const helper = new PlatformHelper(platform, basicTokens, pTokens, user1)
    const helper2 = new PlatformHelper(platform, basicTokens, pTokens, user2)
    const helper3 = new PlatformHelper(platform, basicTokens, pTokens, user3)

    // ONE-TIME SETUP
    // await basicTokens.wbtc.mint(user1.address, '1000000000')
    // await basicTokens.pbx.mint(user2.address, tokens('10'))
    // await basicTokens.usdc.mint(user3.address, '10000000')
    //
    // await helper.printInfo()
    // await helper.printBalances([basicTokens.wbtc, pTokens.pwbtc])
    //
    // console.log('------------- USER 1 SUPPLY 10 WBTC ----------------')
    // await helper.tokens().wbtc.enableSupply()
    // await helper.tokens().wbtc.supplyTokens(10)
    // await helper.tokens().wbtc.enableAsCollateral()
    //
    // await helper.printInfo()
    // await helper.printBalances([basicTokens.wbtc, pTokens.pwbtc])
    //
    // console.log('-----------------------------------------------------')
    //
    // await helper2.printInfo()
    // await helper2.printBalances([basicTokens.pbx, pTokens.ppbx])
    //
    // console.log('-------------- USER 2 SUPPLY 10 PBX -------------')
    // await helper2.tokens().pbx.enableSupply()
    // await helper2.tokens().pbx.supplyTokens(10)
    // await helper2.tokens().pbx.enableAsCollateral()
    //
    // await helper2.printInfo()
    // await helper2.printBalances([basicTokens.pbx, pTokens.ppbx, basicTokens.wbtc])
    //
    // console.log('-------------- USER 2 BORROW 5 WBTC -------------')
    // await helper2.tokens().wbtc.borrowTokens(5)
    //
    // await helper2.printInfo()
    // await helper2.printBalances([basicTokens.pbx, pTokens.ppbx, basicTokens.wbtc])

    // console.log('-----------------------------------------------------')
    //
    // await helper3.printInfo()
    // await helper3.printBalances([basicTokens.usdc, pTokens.pusdc])
    //
    // console.log('-------------- USER 3 SUPPLY 10 USDC -------------')
    // await helper3.tokens().usdc.enableSupply()
    // await helper3.tokens().usdc.supplyTokens(10)
    // await helper3.tokens().usdc.enableAsCollateral()
    //
    // await helper3.printInfo()
    // await helper3.printBalances([basicTokens.usdc, pTokens.pusdc, basicTokens.pbx])
    //
    // console.log('-------------- USER 3 BORROW 5 PBX -------------')
    // await helper3.tokens().pbx.borrowTokens(5)
    //
    // await helper3.printInfo()
    // await helper3.printBalances([basicTokens.usdc, pTokens.pusdc, basicTokens.pbx])
    //
    // console.log('-------------- USER 3 REPAY 5 PBX -------------')
    // await helper3.tokens().pbx.enableRepay()
    // await helper3.tokens().pbx.repayTokens(5)
    //
    // await helper3.printInfo()
    // await helper3.printBalances([basicTokens.pbx])
    //
    // console.log('-----------------------------------------------------')
    //
    // await helper2.printInfo()
    // await helper2.printBalances([basicTokens.wbtc])
    //
    // console.log('-------------- USER 2 REPAY 5 WBTC -------------')
    // await helper2.tokens().wbtc.enableRepay()
    // await helper2.tokens().wbtc.repayTokens(5)
    //
    // await helper2.printInfo()
    // await helper2.printBalances([basicTokens.wbtc])

    // console.log('-------------- USER 1 LIQUIDATE USER 2 LOAN -------------')
    // await basicTokens.wbtc.mint(user1.address, '4000000000')
    // await helper.tokens().wbtc.enableSupply()
    // await helper.tokens().wbtc.supplyTokens(20)
    // await helper.tokens().wbtc.enableAsCollateral()
    // await platform.oracle.setUnderlyingPrice(pTokens.pwbtc.address, '15000000000000000000000000000')
    // await helper2.printInfo()
    // await helper.printBalances([basicTokens.wbtc])
    // await helper.tokens().wbtc.liquidateBorrowTokens(user2, 2, pTokens.ppbx)
    // await helper.printBalances([basicTokens.wbtc])
    await platform.oracle.setUnderlyingPrice(pTokens.pwbtc.address, '15000000000000000000000000000')
    await helper2.printInfo()
    await helper.printInfo()
    await helper3.printInfo()
}

async function testNfts(platform, nftTokens, pNfts) {
    let [owner, user1, user2, user3] = await ethers.getSigners()

    // mint nft
    await nftTokens.erc721.mint(user1.address)

    // print before
    let pBalance = await pNfts.perc721.balanceOf(user1.address)
    console.log('before')
    console.log(await nftTokens.erc721.ownerOf(0))
    console.log(pBalance.toString())

    // user 1 supply NFT
    await nftTokens.erc721.connect(user1).approve(pNfts.perc721.address, 0)
    await pNfts.perc721.connect(user1).mint(0)
    await platform.unitroller.connect(user1).enterMarkets([pNfts.perc721.address])

    // print after
    pBalance = await pNfts.perc721.balanceOf(user1.address)
    console.log('after')
    console.log(pBalance.toString())
    console.log(await nftTokens.erc721.ownerOf(0))
    let liq = await platform.unitroller.getAccountLiquidity(user1.address)
    console.log(liq.toString())
    console.log(await pNfts.perc721.totalSupply())
}

async function testSingleLoan() {
    const addresses = getTestAddresses()
    const basicTokens = await attachBasicTokens(addresses)
    const platform = await attachPlatformContracts(addresses)
    const pTokens = await attachPTokens(addresses)
    let [owner, user1, user2, user3] = await ethers.getSigners()

    const helper = new PlatformHelper(platform, basicTokens, pTokens, user1, 'user1')
    const ohelper = new PlatformHelper(platform, basicTokens, pTokens, owner, 'owner')
    const helper2 = new PlatformHelper(platform, basicTokens, pTokens, user2, 'user2')

    await basicTokens.usdc.mint(user1.address, 10000000000000)
    await advanceDay(10)
    await advanceBlock(10)
    await helper.printBalances([basicTokens.wbtc, basicTokens.usdc])

    // supply
    await helper.tokens().usdc.enableSupply()
    await helper.tokens().usdc.enableAsCollateral()
    await helper.tokens().usdc.supply(10000000000000)

    // borrow
    await helper.tokens().wbtc.borrow(100000000)
    // await helper.tokens().wbtc.borrowTokens(0.1) // ?
    // await ohelper.tokens().usdc.enableAsCollateral() // ? second borrow
    // await ohelper.tokens().wbtc.enableAsCollateral() // ? second borrow
    // await ohelper.tokens().wbtc.borrowTokens(0.1) // ? second borrow
    await advanceDay(10)
    await advanceBlock(10)
    await helper.printBalances([basicTokens.wbtc, basicTokens.usdc])

    // repay
    await basicTokens.wbtc.mint(user1.address, 10000000000000)
    await helper.tokens().wbtc.enableRepay()
    await helper.tokens().wbtc.repayMax()
    await advanceDay(10)
    await advanceBlock(10)
    await helper.printBalances([basicTokens.wbtc, basicTokens.usdc])
}

async function main() {
    // ATTACH ALL
    // const addresses = getTestAddresses()
    // const basicTokens = await attachBasicTokens(addresses)
    // const platform = await attachPlatformContracts(addresses)
    // const pTokens = await attachPTokens(addresses)

    // DEPLOY ALL
    let basicTokens = await deployBasicTokens()
    let platform = await deployPlatformContracts()
    let pTokens = await deployPTokens(basicTokens, platform)
    let pEther = await deployPEther(platform)
    // let synths = await deploySynthetics()
    // let pSynths = await deployPSynthetics(synths, platform)
    // basicTokens = {...basicTokens, ...synths}
    // pTokens = {...pTokens, ...pSynths}

    // ONE-TIME SETUP
    await loadSettings(platform, basicTokens, pTokens)
    await loadPEtherSettings(pEther, platform)
    // await loadSynthSettings(pSynths, platform)

    console.log('------------------------------------------------')

    await supplyEverythingAsOwner(platform, basicTokens, pTokens)
    await testSingleLoan(platform, basicTokens, pTokens)
    await testWbtcUsdc(platform, basicTokens, pTokens)

    // await testIndexer(platform, basicTokens, pTokens)
    // await testWbtcSDot(platform, basicTokens, pTokens)
    // await testWbtcSEth(platform, basicTokens, pTokens)
    // await testWbtcUsdc(platform, basicTokens, pTokens)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })

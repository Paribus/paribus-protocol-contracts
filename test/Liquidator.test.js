const {tokens, printAccountState} = require('./utils/testHelpers')
const setupAll = require('./utils/setupAllMocked')
const {expect} = require("chai")
const {ethers} = require("hardhat")

let app, liquidator

describe("Flashloan Liquidator tests", () => {
    beforeEach(async () => {
        app = await setupAll()
        const AavePoolAddressesProviderMock = await ethers.getContractFactory('AavePoolAddressesProviderMock')
        let provider = await AavePoolAddressesProviderMock.deploy()
        let poolAddress = await provider.getPool()
        const UniswapV3SwapRouterMock = await ethers.getContractFactory('UniswapV3SwapRouterMock')
        let swapRouter = await UniswapV3SwapRouterMock.deploy()
        const Liquidator = await ethers.getContractFactory('LiquidatorMock')
        liquidator = await Liquidator.deploy(provider.address, swapRouter.address)

        // add pool liquidity
        await app.pbx.mint(poolAddress, tokens('10000000'))
        await app.dai.mint(poolAddress, tokens('10000000'))

        // add exchange liquidity
        await app.pbx.mint(swapRouter.address, tokens('100000000'))
        await app.dai.mint(swapRouter.address, tokens('100000000'))

        // owner supply PBX
        await app.pbx.mint(app.owner.address, tokens('4000'))
        await app.pbx.connect(app.owner).approve(app.ppbx.address, tokens('4000'))
        await app.ppbx.connect(app.owner).mint(tokens('4000'))

        // test data
        await app.oracle.setUnderlyingPrice(app.pdai.address, tokens('1'))
        await app.oracle.setUnderlyingPrice(app.ppbx.address, tokens('1'))
        await app.dai.mint(app.user2.address, tokens('8000'))
    })

    it("Test liquidateFor", async () => {
        // user 2 supply DAI
        await app.dai.connect(app.user2).approve(app.pdai.address, tokens('80'))
        await app.pdai.connect(app.user2).mint(tokens('80'))
        await app.unitroller.connect(app.user2).enterMarkets([app.pdai.address, app.ppbx.address])

        // user 2 borrow PBX
        let borrowAmount = tokens('62')
        await app.ppbx.connect(app.user2).borrow(borrowAmount)

        // set new PBX price
        await app.oracle.setUnderlyingPrice(app.ppbx.address, tokens('1.1'))
        let account2LiquidityShortfall = (await app.unitroller.getAccountLiquidity(app.user2.address))[2]
        expect(account2LiquidityShortfall.toString()).to.equal(tokens('0.2'))

        await printAccountState(app, "user2", app.user2)

        // user 1 liquidate user 2 borrow using dai collateral
        await liquidator.liquidateFor(app.ppbx.address, app.user2.address, app.pdai.address, app.user1.address)

        await printAccountState(app, "user2", app.user2)

        // check if user 2 liquidity is positive now
        let account2Liquidity = (await app.unitroller.getAccountLiquidity(app.user2.address))[1]
        expect(account2Liquidity.toString()).to.equal('2016499770761615971')

        // check user 1 dai balance
        expect(await app.dai.balanceOf(app.user1.address)).to.equal('101')
    })

    it("Test liquidateForBest", async () => {
        // user 2 supply DAI
        await app.dai.connect(app.user2).approve(app.pdai.address, tokens('80'))
        await app.pdai.connect(app.user2).mint(tokens('80'))
        await app.unitroller.connect(app.user2).enterMarkets([app.pdai.address, app.ppbx.address])

        // user 2 borrow PBX
        let borrowAmount = tokens('62')
        await app.ppbx.connect(app.user2).borrow(borrowAmount)

        // set new PBX price
        await app.oracle.setUnderlyingPrice(app.ppbx.address, tokens('1.1'))
        let account2LiquidityShortfall = (await app.unitroller.getAccountLiquidity(app.user2.address))[2]
        expect(account2LiquidityShortfall.toString()).to.equal(tokens('0.2'))

        // user 1 liquidate user 2 borrow using dai collateral
        await liquidator.liquidateForBest(app.ppbx.address, app.user2.address, app.user1.address)

        // check if user 2 liquidity is positive now
        let account2Liquidity = (await app.unitroller.getAccountLiquidity(app.user2.address))[1]
        expect(account2Liquidity.toString()).to.equal('2016499778280807986')

        // check user 1 dai balance
        expect(await app.dai.balanceOf(app.user1.address)).to.equal('101')
    })

    it("test liquidate", async () => {
        // user 2 supply DAI
        await app.dai.connect(app.user2).approve(app.pdai.address, tokens('80'))
        await app.pdai.connect(app.user2).mint(tokens('80'))
        await app.unitroller.connect(app.user2).enterMarkets([app.pdai.address, app.ppbx.address])

        // user 2 borrow PBX
        let borrowAmount = tokens('62')
        await app.ppbx.connect(app.user2).borrow(borrowAmount)

        // set new PBX price
        await app.oracle.setUnderlyingPrice(app.ppbx.address, tokens('1.1'))
        let account2LiquidityShortfall = (await app.unitroller.getAccountLiquidity(app.user2.address))[2]
        expect(account2LiquidityShortfall.toString()).to.equal(tokens('0.2'))

        // user 1 liquidate user 2 borrow
        await liquidator.liquidate(app.ppbx.address, app.user2.address, app.user1.address)

        // check if user 2 liquidity is positive now
        let account2Liquidity = (await app.unitroller.getAccountLiquidity(app.user2.address))[1]
        expect(account2Liquidity.toString()).to.equal('2016499778280807986')

        // check user 1 pbx balance
        expect(await app.pbx.balanceOf(app.user1.address)).to.equal('10000000000000000001') // tokens(10) + 1 wei
    })
})

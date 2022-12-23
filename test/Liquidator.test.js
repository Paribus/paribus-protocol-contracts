const {tokens, mintAndDepositToken} = require('./utils/testHelpers')
const setupAll = require('./utils/setupAllMocked')
const {expect} = require("chai")
const {ethers} = require("hardhat")
const {expectFractionalAmount} = require("./utils/expectAddons")

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
        await mintAndDepositToken(app, [app.ppbx], tokens('4000'))

        // test data
        await app.oracle.setUnderlyingPrice(app.pdai.address, tokens('1'))
        await app.oracle.setUnderlyingPrice(app.ppbx.address, tokens('1'))
    })

    context("with non zero token balance", async () => {
        beforeEach(async () => {
            await app.pbx.mint(liquidator.address, '42')
            await app.ppbx.transfer(liquidator.address, '43')
        })

        afterEach(async () => {
            expect(await app.pbx.balanceOf(liquidator.address)).to.equal('42')
            expect(await app.ppbx.balanceOf(liquidator.address)).to.equal('43')
        })

        it("Test liquidateFor", async () => {
            // user 2 supply DAI
            await mintAndDepositToken(app, [app.pdai], tokens('80'), app.user2)
            await app.unitroller.connect(app.user2).enterMarkets([app.pdai.address, app.ppbx.address])

            // user 2 borrow PBX
            let borrowAmount = tokens('62')
            await app.ppbx.connect(app.user2).borrow(borrowAmount)

            // set new PBX price
            await app.oracle.setUnderlyingPrice(app.ppbx.address, tokens('1.1'))
            let account2LiquidityShortfall = (await app.unitroller.getAccountLiquidity(app.user2.address))[2]
            expectFractionalAmount(account2LiquidityShortfall.toString(), tokens('0.2'), 13)

            // user 1 liquidate user 2 borrow using dai collateral
            await liquidator.liquidateFor(app.ppbx.address, app.user2.address, app.pdai.address, app.user1.address)

            // check if user 2 liquidity is positive now
            let account2Liquidity = (await app.unitroller.getAccountLiquidity(app.user2.address))[1]
            expectFractionalAmount(account2Liquidity.toString(), '2016490000000000000', 13)

            // check user 1 dai balance
            expect(await app.dai.balanceOf(app.user1.address)).to.equal('101')
        })

        it("Test liquidateForBest", async () => {
            // user 2 supply DAI
            await mintAndDepositToken(app, [app.pdai], tokens('80'), app.user2)
            await app.unitroller.connect(app.user2).enterMarkets([app.pdai.address, app.ppbx.address])

            // user 2 borrow PBX
            let borrowAmount = tokens('62')
            await app.ppbx.connect(app.user2).borrow(borrowAmount)

            // set new PBX price
            await app.oracle.setUnderlyingPrice(app.ppbx.address, tokens('1.1'))
            let account2LiquidityShortfall = (await app.unitroller.getAccountLiquidity(app.user2.address))[2]
            expectFractionalAmount(account2LiquidityShortfall.toString(), tokens('0.2'), 13)

            // user 1 liquidate user 2 borrow using dai collateral
            await liquidator.liquidateForBest(app.ppbx.address, app.user2.address, app.user1.address)

            // check if user 2 liquidity is positive now
            let account2Liquidity = (await app.unitroller.getAccountLiquidity(app.user2.address))[1]
            expectFractionalAmount(account2Liquidity.toString(), '2016490000000000000', 13)

            // check user 1 dai balance
            expect(await app.dai.balanceOf(app.user1.address)).to.equal('101')
        })

        it("test liquidate", async () => {
            // user 2 supply DAI
            await mintAndDepositToken(app, [app.pdai], tokens('80'), app.user2)
            await app.unitroller.connect(app.user2).enterMarkets([app.pdai.address, app.ppbx.address])

            // user 2 borrow PBX
            let borrowAmount = tokens('62')
            await app.ppbx.connect(app.user2).borrow(borrowAmount)

            // set new PBX price
            await app.oracle.setUnderlyingPrice(app.ppbx.address, tokens('1.1'))
            let account2LiquidityShortfall = (await app.unitroller.getAccountLiquidity(app.user2.address))[2]
            expectFractionalAmount(account2LiquidityShortfall.toString(), tokens('0.2'), 13)

            // user 1 liquidate user 2 borrow
            await liquidator.liquidate(app.ppbx.address, app.user2.address, app.user1.address)

            // check if user 2 liquidity is positive now
            let account2Liquidity = (await app.unitroller.getAccountLiquidity(app.user2.address))[1]
            expectFractionalAmount(account2Liquidity.toString(), '2016490000000000000', 13)

            // check user 1 pbx balance
            expect(await app.pbx.balanceOf(app.user1.address)).to.equal('10000000000000000001') // tokens(10) + 1 wei
        })
    })
})

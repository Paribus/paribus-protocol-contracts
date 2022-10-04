const {tokens} = require('./utils/testHelpers')
const setupAll = require('./utils/setupAllMocked')
const {expectEventInReceipt} = require('./utils/expectAddons')
const {expect} = require("chai")

let app

describe("Borrow liquidation logic", () => {
    beforeEach(async () => {
        app = await setupAll()
        await app.unitroller._setCollateralFactor(app.pdai.address, tokens('0.5'))
        await app.unitroller._setCollateralFactor(app.peth.address, tokens('0.5'))
        await app.unitroller._setCollateralFactor(app.ppbx.address, tokens('0.5'))
        await app.unitroller._setCollateralFactor(app.psada.address, tokens('0.5'))

        await app.oracle.setUnderlyingPrice(app.peth.address, tokens('1000'))
        await app.oracle.setUnderlyingPrice(app.pdai.address, tokens('1'))
        await app.oracle.setUnderlyingPrice(app.ppbx.address, tokens('1'))
        await app.oracle.setUnderlyingPrice(app.psada.address, tokens('1'))

        await app.dai.mint(app.user2.address, tokens('8000'))
        await app.pbx.transfer(app.user1.address, tokens('6000'))
        await app.sada.mint(app.user1.address, tokens('6000'))
        await app.sada.mint(app.user2.address, tokens('8000'))
    })

    it("Basic liquidation of negative liquidity account", async () => {
        // user 2 supply 8000 USD of DAI
        await app.dai.connect(app.user2).approve(app.pdai.address, tokens('8000'))
        await app.pdai.connect(app.user2).mint(tokens('8000'))
        await app.unitroller.connect(app.user2).enterMarkets([app.pdai.address, app.ppbx.address])

        let account2Liquidity = (await app.unitroller.getAccountLiquidity(app.user2.address))[1]
        expect(account2Liquidity.toString()).to.equal(tokens('4000'))

        // user 1 supply PBX
        await app.pbx.connect(app.user1).approve(app.ppbx.address, tokens('4000'))
        await app.ppbx.connect(app.user1).mint(tokens('4000'))

        // user 2 borrow 3800 USD of PBX
        let borrowAmount = tokens('3800')
        await expectEventInReceipt(await app.ppbx.connect(app.user2).borrow(borrowAmount), 'Borrow', {borrower: app.user2.address, borrowAmount: borrowAmount})
        account2Liquidity = (await app.unitroller.getAccountLiquidity(app.user2.address))[1]
        expect(account2Liquidity.toString()).to.equal(tokens('200'))

        // set new PBX price
        await app.oracle.setUnderlyingPrice(app.ppbx.address, tokens('1.1'))
        let account2LiquidityShortfall = (await app.unitroller.getAccountLiquidity(app.user2.address))[2]
        expect(account2LiquidityShortfall.toString()).to.equal(tokens('180'))

        // user 1 liquidate user 2 borrow of 1500 USD of DAI
        const repayAmount = tokens('1500')
        await app.pbx.connect(app.user1).approve(app.ppbx.address, repayAmount)
        await app.ppbx.connect(app.user1).liquidateBorrow(app.user2.address, repayAmount, app.pdai.address)

        // check if user 2 liquidity is positive now
        account2Liquidity = (await app.unitroller.getAccountLiquidity(app.user2.address))[1]
        expect(account2Liquidity.toString()).to.equal('562496624350808461860')
    })

    it("Basic liquidation of synthetix coins borrow", async () => {
        // user 2 supply DAI
        await app.dai.connect(app.user2).approve(app.pdai.address, tokens('8000'))
        await app.pdai.connect(app.user2).mint(tokens('8000'))
        await app.unitroller.connect(app.user2).enterMarkets([app.pdai.address, app.ppbx.address])

        let account2Liquidity = (await app.unitroller.getAccountLiquidity(app.user2.address))[1]
        expect(account2Liquidity.toString()).to.equal(tokens('4000'))

        // user 1 supply sADA
        await app.sada.connect(app.user1).approve(app.psada.address, tokens('4000'))
        await app.psada.connect(app.user1).mint(tokens('4000'))

        // user 2 borrow sADA
        let borrowAmount = tokens('3800')
        await expectEventInReceipt(await app.psada.connect(app.user2).borrow(borrowAmount), 'Borrow', {borrower: app.user2.address, borrowAmount: borrowAmount})
        account2Liquidity = (await app.unitroller.getAccountLiquidity(app.user2.address))[1]
        expect(account2Liquidity.toString()).to.equal(tokens('200'))

        // set new sADA price
        await app.oracle.setUnderlyingPrice(app.psada.address, tokens('1.1'))
        let account2LiquidityShortfall = (await app.unitroller.getAccountLiquidity(app.user2.address))[2]
        expect(account2LiquidityShortfall.toString()).to.equal(tokens('180'))

        // user 1 liquidate user 2 borrow
        const repayAmount = tokens('1500')
        await app.sada.connect(app.user1).approve(app.psada.address, repayAmount)
        await app.psada.connect(app.user1).liquidateBorrow(app.user2.address, repayAmount, app.pdai.address)

        // check if user 2 liquidity is positive now
        account2Liquidity = (await app.unitroller.getAccountLiquidity(app.user2.address))[1]
        expect(account2Liquidity.toString()).to.equal('562496624350808461860')
    })

    it("Basic liquidation of synthetix collateral", async () => {
        // user 2 supply sADA
        await app.sada.connect(app.user2).approve(app.psada.address, tokens('8000'))
        await app.psada.connect(app.user2).mint(tokens('8000'))
        await app.unitroller.connect(app.user2).enterMarkets([app.psada.address, app.ppbx.address])

        let account2Liquidity = (await app.unitroller.getAccountLiquidity(app.user2.address))[1]
        expect(account2Liquidity.toString()).to.equal(tokens('4000'))

        // user 1 supply PBX
        await app.pbx.connect(app.user1).approve(app.ppbx.address, tokens('4000'))
        await app.ppbx.connect(app.user1).mint(tokens('4000'))

        // user 2 borrow PBX
        let borrowAmount = tokens('3800')
        await expectEventInReceipt(await app.ppbx.connect(app.user2).borrow(borrowAmount), 'Borrow', {borrower: app.user2.address, borrowAmount: borrowAmount})
        account2Liquidity = (await app.unitroller.getAccountLiquidity(app.user2.address))[1]
        expect(account2Liquidity.toString()).to.equal(tokens('200'))

        // set new PBX price
        await app.oracle.setUnderlyingPrice(app.ppbx.address, tokens('1.1'))
        let account2LiquidityShortfall = (await app.unitroller.getAccountLiquidity(app.user2.address))[2]
        expect(account2LiquidityShortfall.toString()).to.equal(tokens('180'))

        // user 1 liquidate user 2 borrow
        const repayAmount = tokens('1500')
        await app.pbx.connect(app.user1).approve(app.ppbx.address, repayAmount)
        await app.ppbx.connect(app.user1).liquidateBorrow(app.user2.address, repayAmount, app.psada.address)

        // check if user 2 liquidity is positive now
        account2Liquidity = (await app.unitroller.getAccountLiquidity(app.user2.address))[1]
        expect(account2Liquidity.toString()).to.equal('562496624350808461860')
    })
})

// TODO test native token liquidation?

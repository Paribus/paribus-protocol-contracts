const {tokens, mintAndDepositToken} = require('./utils/testHelpers')
const setupAll = require('./utils/setupAllMocked')
const {expectEventInReceipt, expectFractionalAmount, expectEvent} = require('./utils/expectAddons')
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
    })

    it("Basic liquidation of negative liquidity account", async () => {
        await mintAndDepositToken(app, [app.ppbx], tokens('4000'))

        // user 2 supply 8000 USD of DAI
        await mintAndDepositToken(app, [app.pdai], tokens('8000'), app.user2)
        await app.unitroller.connect(app.user2).enterMarkets([app.pdai.address, app.ppbx.address])

        expectFractionalAmount((await app.unitroller.getAccountLiquidity(app.user2.address))[1], tokens('4000'), 13)

        // user 2 borrow 3800 USD of PBX
        let borrowAmount = tokens('3800')
        await expectEventInReceipt(await app.ppbx.connect(app.user2).borrow(borrowAmount), 'Borrow', {borrower: app.user2.address, borrowAmount: borrowAmount})
        expectFractionalAmount((await app.unitroller.getAccountLiquidity(app.user2.address))[1], tokens('200'), 13)

        // set new PBX price so user 2 has negative liquidity
        await app.oracle.setUnderlyingPrice(app.ppbx.address, tokens('1.1'))
        expectFractionalAmount((await app.unitroller.getAccountLiquidity(app.user2.address))[2], tokens('180'), 13)

        // liquidate user 2 borrow
        const repayAmount = tokens('1500')
        await app.pbx.mint(app.owner.address, repayAmount)
        await app.pbx.approve(app.ppbx.address, repayAmount)
        await expectEvent(app.ppbx.liquidateBorrow(app.user2.address, repayAmount, app.pdai.address), 'LiquidateBorrow', { liquidator: app.owner.address, borrower: app.user2.address, repayAmount: repayAmount })

        // expect user 2 liquidity to be positive now
        expectFractionalAmount((await app.unitroller.getAccountLiquidity(app.user2.address))[1], '562490000000000000000', 16)
    })

    it("Liquidation of negative liquidity account when borrowing max possible amount and accruing interest", async () => {
        await mintAndDepositToken(app, [app.ppbx], tokens('4000'))

        // user 2 supply 8000 USD of DAI
        await mintAndDepositToken(app, [app.pdai], tokens('8000'), app.user2)
        await app.unitroller.connect(app.user2).enterMarkets([app.pdai.address, app.ppbx.address])

        let account2Liquidity = (await app.unitroller.getAccountLiquidity(app.user2.address))[1]
        expect(account2Liquidity.toString()).to.equal('3999999999000000000000')

        // user 2 borrow max amount PBX
        await expectEventInReceipt(await app.ppbx.connect(app.user2).borrow(account2Liquidity), 'Borrow', {borrower: app.user2.address, borrowAmount: account2Liquidity})

        // expect user 2 liquidity to equal 0
        account2Liquidity = (await app.unitroller.getAccountLiquidity(app.user2.address))[1]
        let account2LiquidityShortfall = (await app.unitroller.getAccountLiquidity(app.user2.address))[2]
        expect(account2Liquidity.toString()).to.equal('0')
        expect(account2LiquidityShortfall.toString()).to.equal('0')

        // accrue interest, expect user 2 liquidity to be less than 0 now
        await app.ppbx.accrueInterest()
        account2LiquidityShortfall = (await app.unitroller.getAccountLiquidity(app.user2.address))[2]
        expectFractionalAmount(account2LiquidityShortfall.toString(), '1320026315000000', 6)

        // liquidate user 2 borrow
        const repayAmount = tokens('1500')
        await app.pbx.mint(app.owner.address, repayAmount)
        await app.pbx.approve(app.ppbx.address, repayAmount)
        await expectEvent(app.ppbx.liquidateBorrow(app.user2.address, repayAmount, app.pdai.address), 'LiquidateBorrow', { liquidator: app.owner.address, borrower: app.user2.address, repayAmount: repayAmount })

        // expect user 2 liquidity to be positive now
        account2Liquidity = (await app.unitroller.getAccountLiquidity(app.user2.address))[1]
        expectFractionalAmount(account2Liquidity.toString(), '674990000000000000000', 16)
    })

    it("Liquidation of negative liquidity account when borrowing max possible amount", async () => {
        await mintAndDepositToken(app, [app.ppbx], tokens('4000'))

        // user 2 supply 8000 USD of DAI
        await mintAndDepositToken(app, [app.pdai], tokens('8000'), app.user2)
        await app.unitroller.connect(app.user2).enterMarkets([app.pdai.address, app.ppbx.address])

        let account2Liquidity = (await app.unitroller.getAccountLiquidity(app.user2.address))[1]
        expect(account2Liquidity.toString()).to.equal('3999999999000000000000')

        // user 2 borrow max amount PBX
        await expectEventInReceipt(await app.ppbx.connect(app.user2).borrow(account2Liquidity), 'Borrow', {borrower: app.user2.address, borrowAmount: account2Liquidity})

        // liquidate user 2 borrow
        const repayAmount = tokens('1500')
        await app.pbx.mint(app.owner.address, repayAmount)
        await app.pbx.approve(app.ppbx.address, repayAmount)
        await expectEvent(app.ppbx.liquidateBorrow(app.user2.address, repayAmount, app.pdai.address), 'LiquidateBorrow', { liquidator: app.owner.address, borrower: app.user2.address, repayAmount: repayAmount })

        // expect user 2 liquidity to be positive now
        account2Liquidity = (await app.unitroller.getAccountLiquidity(app.user2.address))[1]
        expectFractionalAmount(account2Liquidity.toString(), '674990000000000000000', 16)
    })

    it("Basic liquidation of synthetix coins borrow", async () => {
        await mintAndDepositToken(app, [app.psada], tokens('4000'))

        // user 2 supply DAI
        await mintAndDepositToken(app, [app.pdai], tokens('8000'), app.user2)
        await app.unitroller.connect(app.user2).enterMarkets([app.pdai.address, app.ppbx.address])

        expectFractionalAmount((await app.unitroller.getAccountLiquidity(app.user2.address))[1], tokens('4000'), 13)

        // user 2 borrow sADA
        let borrowAmount = tokens('3800')
        await expectEventInReceipt(await app.psada.connect(app.user2).borrow(borrowAmount), 'Borrow', {borrower: app.user2.address, borrowAmount: borrowAmount})
        expectFractionalAmount((await app.unitroller.getAccountLiquidity(app.user2.address))[1], tokens('200'), 13)

        // set new sADA price so user 2 has negative liquidity
        await app.oracle.setUnderlyingPrice(app.psada.address, tokens('1.1'))
        expectFractionalAmount((await app.unitroller.getAccountLiquidity(app.user2.address))[2], tokens('180'), 13)

        // liquidate user 2 borrow
        const repayAmount = tokens('1500')
        await app.sada.mint(app.owner.address, repayAmount)
        await app.sada.approve(app.psada.address, repayAmount)
        await expectEvent(app.psada.liquidateBorrow(app.user2.address, repayAmount, app.pdai.address), 'LiquidateBorrow', { liquidator: app.owner.address, borrower: app.user2.address, repayAmount: repayAmount })

        // expect user 2 liquidity to be positive now
        expectFractionalAmount((await app.unitroller.getAccountLiquidity(app.user2.address))[1], '562490000000000000000', 16)
    })

    it("Basic liquidation of synthetix collateral", async () => {
        await mintAndDepositToken(app, [app.ppbx], tokens('4000'))

        // user 2 supply sADA
        await mintAndDepositToken(app, [app.psada], tokens('8000'), app.user2)
        await app.unitroller.connect(app.user2).enterMarkets([app.psada.address, app.ppbx.address])

        expectFractionalAmount((await app.unitroller.getAccountLiquidity(app.user2.address))[1], tokens('4000'), 13)

        // user 2 borrow PBX
        let borrowAmount = tokens('3800')
        await expectEventInReceipt(await app.ppbx.connect(app.user2).borrow(borrowAmount), 'Borrow', {borrower: app.user2.address, borrowAmount: borrowAmount})
        expectFractionalAmount((await app.unitroller.getAccountLiquidity(app.user2.address))[1], tokens('200'), 13)

        // set new PBX price so user 2 has negative liquidity
        await app.oracle.setUnderlyingPrice(app.ppbx.address, tokens('1.1'))
        expectFractionalAmount((await app.unitroller.getAccountLiquidity(app.user2.address))[2], tokens('180'), 13)

        // liquidate user 2 borrow
        const repayAmount = tokens('1500')
        await app.pbx.mint(app.owner.address, repayAmount)
        await app.pbx.approve(app.ppbx.address, repayAmount)
        await expectEvent(app.ppbx.liquidateBorrow(app.user2.address, repayAmount, app.psada.address), 'LiquidateBorrow', { liquidator: app.owner.address, borrower: app.user2.address, repayAmount: repayAmount })

        // expect user 2 liquidity to be positive now
        expectFractionalAmount((await app.unitroller.getAccountLiquidity(app.user2.address))[1], '562490000000000000000', 16)
    })
})

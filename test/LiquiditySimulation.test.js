const {tokens, mintAndDepositToken, advanceBlock} = require('./utils/testHelpers')
const setupAll = require('./utils/setupAllMocked')
const {expectEventInReceipt, expectEvent} = require('./utils/expectAddons')
const {expect} = require("chai")

let app

describe("Liquidity simulation", () => {
    beforeEach(async () => {
        app = await setupAll()
        await app.unitroller._setCollateralFactor(app.pdai.address, tokens('0.9'))
        await app.unitroller._setCollateralFactor(app.peth.address, tokens('0.5'))
        await app.oracle.setUnderlyingPrice(app.peth.address, tokens('1000'))

        await mintAndDepositToken(app, [app.pdai], tokens('8000'))
        await mintAndDepositToken(app, [app.peth], tokens('1')) // first deposit so the MINIMUM_LIQUIDITY is handled
    })

    it("Test case 1", async () => {
        // ------
        // DAY 1
        // -----

        // Deposit ETH
        await app.peth.connect(app.user1).mint({value: tokens('2')})
        await app.unitroller.connect(app.user1).enterMarkets([app.pdai.address, app.peth.address])

        let accountLiquidity = (await app.unitroller.getAccountLiquidity(app.user1.address))[1]
        expect(accountLiquidity.toString()).to.equal(tokens('1000'))

        // Take a borrow
        await expectEventInReceipt(await app.pdai.connect(app.user1).borrow(tokens('1000')), 'Borrow', {borrower: app.user1.address, borrowAmount: tokens('1000')})

        accountLiquidity = (await app.unitroller.getAccountLiquidity(app.user1.address))[1]
        expect(accountLiquidity.toString()).to.equal(tokens('0'))

        expect((await app.dai.balanceOf(app.user1.address)).toString()).to.equal(tokens('1000'))

        // ------
        // DAY 2
        // -----
        // Set new price
        await app.oracle.setUnderlyingPrice(app.peth.address, tokens('1500'))

        accountLiquidity = (await app.unitroller.getAccountLiquidity(app.user1.address))[1]
        expect(accountLiquidity.toString()).to.equal(tokens('500'))

        await expectEvent(app.pdai.accrueInterest(), 'AccrueInterest')

        accountLiquidity = (await app.unitroller.getAccountLiquidity(app.user1.address))[1]
        expect(accountLiquidity.toString()).to.equal('499999994169936118000') // interest fee applied
    })

    it("Test case 2", async () => {
        // ------
        // DAY 1
        // -----

        // Deposit ETH
        await app.peth.connect(app.user1).mint({value: tokens('20')})
        await app.unitroller.connect(app.user1).enterMarkets([app.pdai.address, app.peth.address])

        let accountLiquidity = (await app.unitroller.getAccountLiquidity(app.user1.address))[1]
        expect(accountLiquidity.toString()).to.equal(tokens('10000'))

        // Take a borrow
        await expectEventInReceipt(await app.pdai.connect(app.user1).borrow(tokens('1000')), 'Borrow', {borrower: app.user1.address, borrowAmount: tokens('1000')})

        accountLiquidity = (await app.unitroller.getAccountLiquidity(app.user1.address))[1]
        expect(accountLiquidity.toString()).to.equal(tokens('9000'))

        expect((await app.dai.balanceOf(app.user1.address)).toString()).to.equal(tokens('1000'))

        // ------
        // DAY 2
        // -----
        // Set new price
        await app.oracle.setUnderlyingPrice(app.peth.address, tokens('1500'))

        accountLiquidity = (await app.unitroller.getAccountLiquidity(app.user1.address))[1]
        expect(accountLiquidity.toString()).to.equal(tokens('14000'))

        // Take another borrow
        await expectEventInReceipt(await app.pdai.connect(app.user1).borrow(tokens('500')), 'Borrow', {borrower: app.user1.address, borrowAmount: tokens('500')})

        accountLiquidity = (await app.unitroller.getAccountLiquidity(app.user1.address))[1]
        expect(accountLiquidity.toString()).to.equal('13499999994169936118000') // interest fee applied

        expect((await app.dai.balanceOf(app.user1.address)).toString()).to.equal(tokens('1500'))
    })
})

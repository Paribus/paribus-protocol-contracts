const {tokens} = require('./utils/testHelpers')
const setupAll = require('./utils/setupAllMocked')
const {expectEventInReceipt, expectNoEvent} = require('./utils/expectAddons')
const {expect} = require("chai")

let app

/**
 * Test cases for liquidity calculations
 */
describe("Liquidity calculation", () => {
    beforeEach(async () => {
        app = await setupAll()
        await app.unitroller._setCollateralFactor(app.pdai.address, tokens('0.9'))
        await app.unitroller._setCollateralFactor(app.pwbtc.address, tokens('0.6'))
        await app.unitroller._setCollateralFactor(app.peth.address, tokens('0.5'))

        await app.dai.transfer(app.user1.address, tokens('10000'))
        await app.dai.transfer(app.user2.address, tokens('10000'))
    })

    it("Test case 1", async () => {
        await app.dai.connect(app.user2).approve(app.pdai.address, tokens('8000'))
        await app.pdai.connect(app.user2).mint(tokens('8000'))

        // ------
        // DAY 1
        // -----
        // Set price and MPC
        await app.oracle.setUnderlyingPrice(app.peth.address, tokens('1000'))

        // Deposit ETH
        await app.peth.connect(app.user1).mint({value: tokens('2')})
        await app.unitroller.connect(app.user1).enterMarkets([app.pdai.address, app.peth.address])

        let accountLiquidity = (await app.unitroller.getAccountLiquidity(app.user1.address))[1]
        expect(accountLiquidity.toString()).to.equal(tokens('1000'))

        let daiBalance = (await app.dai.balanceOf(app.user1.address))
        expect(daiBalance.toString()).to.equal(tokens('10000'))

        // Take a borrow
        await expectEventInReceipt(await app.pdai.connect(app.user1).borrow(tokens('1000')), 'Borrow', {borrower: app.user1.address, borrowAmount: tokens('1000')})

        accountLiquidity = (await app.unitroller.getAccountLiquidity(app.user1.address))[1]
        expect(accountLiquidity.toString()).to.equal(tokens('0'))

        daiBalance = (await app.dai.balanceOf(app.user1.address))
        expect(daiBalance.toString()).to.equal(tokens('11000'))

        // ------
        // DAY 2
        // -----
        // Set new price
        await app.oracle.setUnderlyingPrice(app.peth.address, tokens('1500'))

        accountLiquidity = (await app.unitroller.getAccountLiquidity(app.user1.address))[1]
        expect(accountLiquidity.toString()).to.equal(tokens('500'))

        daiBalance = (await app.dai.balanceOf(app.user1.address))
        expect(daiBalance.toString()).to.equal(tokens('11000'))

        // Take another borrow
        await expectNoEvent(app.pdai.connect(app.user1).borrow(tokens('500')), 'Borrow')

        accountLiquidity = (await app.unitroller.getAccountLiquidity(app.user1.address))[1]
        expect(accountLiquidity.toString()).to.equal(tokens('499.999994169936118000')) // interest fee applied

        daiBalance = (await app.dai.balanceOf(app.user1.address))
        expect(daiBalance.toString()).to.equal(tokens('11000'))
    })

    it("Test case 2", async () => {
        await app.dai.connect(app.user2).approve(app.pdai.address, tokens('8000'))
        await app.pdai.connect(app.user2).mint(tokens('8000'))

        // ------
        // DAY 1
        // -----
        // Set price and MPC
        await app.oracle.setUnderlyingPrice(app.peth.address, tokens('1000'))

        // Deposit ETH
        await app.peth.connect(app.user1).mint({value: tokens('20')})
        await app.unitroller.connect(app.user1).enterMarkets([app.pdai.address, app.peth.address])

        let accountLiquidity = (await app.unitroller.getAccountLiquidity(app.user1.address))[1]
        expect(accountLiquidity.toString()).to.equal(tokens('10000'))

        let daiBalance = (await app.dai.balanceOf(app.user1.address))
        expect(daiBalance.toString()).to.equal(tokens('10000'))

        // Take a borrow
        await expectEventInReceipt(await app.pdai.connect(app.user1).borrow(tokens('1000')), 'Borrow', {borrower: app.user1.address, borrowAmount: tokens('1000')})

        accountLiquidity = (await app.unitroller.getAccountLiquidity(app.user1.address))[1]
        expect(accountLiquidity.toString()).to.equal(tokens('9000'))

        daiBalance = (await app.dai.balanceOf(app.user1.address))
        expect(daiBalance.toString()).to.equal(tokens('11000'))

        // ------
        // DAY 2
        // -----
        // Set new price
        await app.oracle.setUnderlyingPrice(app.peth.address, tokens('1500'))

        accountLiquidity = (await app.unitroller.getAccountLiquidity(app.user1.address))[1]
        expect(accountLiquidity.toString()).to.equal(tokens('14000'))

        daiBalance = (await app.dai.balanceOf(app.user1.address))
        expect(daiBalance.toString()).to.equal(tokens('11000'))

        // Take another borrow
        await expectEventInReceipt(await app.pdai.connect(app.user1).borrow(tokens('500')), 'Borrow', {borrower: app.user1.address, borrowAmount: tokens('500')})

        accountLiquidity = (await app.unitroller.getAccountLiquidity(app.user1.address))[1]
        expect(accountLiquidity.toString()).to.equal('13499999994169936118000') // interest fee applied

        daiBalance = (await app.dai.balanceOf(app.user1.address))
        expect(daiBalance.toString()).to.equal(tokens('11500'))
    })
})

const setupAll = require('./utils/setupAllMocked')
const {tokens, REPAY_MAX, advanceDay, mintAndDepositToken, getGasUsed} = require('./utils/testHelpers')
const {expect} = require("chai")
const {expectEvent, expectFractionalAmount, expectRevert, expectEventInLogs} = require("./utils/expectAddons")
const {ethers} = require("hardhat")
const {BigNumber} = ethers

let app

describe("Borrow and repay logic", () => {
    beforeEach(async () => {
        app = await setupAll()

        // owner supply
        await mintAndDepositToken(app, [app.pdai, app.ppbx, app.peth], tokens('100'))
    })

    it("for single user", async () => {
        // user 1 supply ETH
        let contractBeforeBalance = await ethers.provider.getBalance(app.peth.address)
        await app.unitroller.connect(app.user1).enterMarkets([app.peth.address])
        let balanceBefore = await app.user1.getBalance()
        let receipt = app.peth.connect(app.user1).mint({value: tokens('10')})

        await expectEvent(receipt, 'Mint', { minter: app.user1.address })
        expectFractionalAmount(await app.user1.getBalance(), BigNumber.from(balanceBefore).sub(tokens('10')).sub(await getGasUsed(await receipt)), 16)
        expect(await ethers.provider.getBalance(app.peth.address)).to.equal(BigNumber.from(contractBeforeBalance).add(tokens('10')))

        // user 1 borrow DAI
        await expectEvent(app.pdai.connect(app.user1).borrow(tokens('10')), 'Borrow', { borrower: app.user1.address, borrowAmount: tokens('10'), accountBorrows: tokens('10'), totalBorrows: tokens('10') })

        expect(await app.dai.balanceOf(app.user1.address)).to.equal(tokens('10'))

        // user 1 repay
        await app.dai.connect(app.user1).approve(app.pdai.address, tokens('10'))
        await expectEvent(app.pdai.connect(app.user1).repayBorrow(tokens('10')), 'RepayBorrow', { payer: app.user1.address, borrower: app.user1.address })

        expect(await app.dai.balanceOf(app.user1.address)).to.equal(tokens('0'))
    })

    it("for single user borrowing ETH", async () => {
        // setup
        await app.oracle.setUnderlyingPrice(app.peth.address, '1000000000000000000')
        await app.oracle.setUnderlyingPrice(app.pdai.address, '1000000000000000000')

        // user 1 supply DAI
        await mintAndDepositToken(app, [app.pdai], tokens('100'), app.user1)
        await app.unitroller.connect(app.user1).enterMarkets([app.pdai.address])

        // user 1 borrow ETH
        let balanceBefore = await app.user1.getBalance()
        let receipt = app.peth.connect(app.user1).borrow(tokens('10'))

        await expectEvent(receipt, 'Borrow', { borrower: app.user1.address, borrowAmount: tokens('10'), accountBorrows: tokens('10'), totalBorrows: tokens('10') })
        expectFractionalAmount(await app.user1.getBalance(), BigNumber.from(tokens('10')).add(balanceBefore).sub(await getGasUsed(await receipt)), 16)

        // advance day and accrue interest
        await advanceDay()
        await expectEvent(app.peth.accrueInterest(), 'AccrueInterest')

        // user 1 repay
        balanceBefore = await app.user1.getBalance()
        receipt = app.peth.connect(app.user1).repayBorrow({ value: tokens('10') })

        await expectEvent(receipt, 'RepayBorrow', { payer: app.user1.address, borrower: app.user1.address, repayAmount: tokens('10') })
        expectFractionalAmount(await app.user1.getBalance(), BigNumber.from(balanceBefore).sub(tokens('10')).sub(await getGasUsed(await receipt)), 16)

        // user 1 try repay too much
        await expectRevert(app.peth.connect(app.user1).repayBorrow({ value: tokens('1') }), 'REPAY_TOO_MUCH')

        // owner repay user 1 remaining dust, interest using proxy maximillion contract
        balanceBefore = await app.user1.getBalance()
        receipt = app.maximillion.repayBehalf(app.user1.address, { value: tokens('10') })

        await expectEventInLogs(receipt, 'PEther', 'RepayBorrow', { payer: app.maximillion.address, borrower: app.user1.address, accountBorrows: 0 })
        expectFractionalAmount(await app.user1.getBalance(), balanceBefore, 16)

        // advance day and accrue interest
        await advanceDay()
        await expectEvent(app.peth.accrueInterest(), 'AccrueInterest')

        expect(await app.peth.borrowBalanceStored(app.user1.address)).to.equal(0)
    })

    it("repay entire loan", async () => {
        await app.dai.mint(app.user1.address, tokens('100000'))

        // user 1 supply ETH
        await app.peth.connect(app.user1).mint({value: tokens('10')})
        await app.unitroller.connect(app.user1).enterMarkets([app.peth.address])

        // user 1 borrow DAI
        await app.pdai.connect(app.user1).borrow(tokens('10'))

        expect(await app.dai.balanceOf(app.user1.address)).to.equal(tokens('100010'))

        // user 1 repay DAI
        await app.dai.connect(app.user1).approve(app.pdai.address, REPAY_MAX)
        await expectEvent(app.pdai.connect(app.user1).repayBorrow(REPAY_MAX), 'RepayBorrow', { payer: app.user1.address, borrower: app.user1.address, accountBorrows: 0 })
    })

    it("repay entire loan 2", async () => {
        await app.dai.mint(app.user1.address, tokens('100000'))

        // user 1 supply DAI
        await app.dai.connect(app.user1).approve(app.pdai.address, REPAY_MAX)
        await app.pdai.connect(app.user1).mint(tokens('1000'))
        await app.unitroller.connect(app.user1).enterMarkets([app.pdai.address])

        // user 1 borrow DAI
        await app.pdai.connect(app.user1).borrow(tokens('10'))

        // user 1 repay DAI
        await expectEvent(app.pdai.connect(app.user1).repayBorrow(REPAY_MAX), 'RepayBorrow', { payer: app.user1.address, borrower: app.user1.address, accountBorrows: 0 })
    })

    it("repay entire loan after an entire day", async () => {
        await app.dai.mint(app.user1.address, tokens('100000'))

        // user 1 supply DAI
        await app.dai.connect(app.user1).approve(app.pdai.address, REPAY_MAX)
        await app.pdai.connect(app.user1).mint(tokens('1000'))
        await app.unitroller.connect(app.user1).enterMarkets([app.pdai.address])

        // user 1 borrow DAI
        await app.pdai.connect(app.user1).borrow(tokens('10'))

        await advanceDay()
        await expectEvent(app.pdai.accrueInterest(), 'AccrueInterest')

        // user 1 repay DAI
        await expectEvent(app.pdai.connect(app.user1).repayBorrow(REPAY_MAX), 'RepayBorrow', { payer: app.user1.address, borrower: app.user1.address, accountBorrows: 0 })
    })

    it("repay entire loan after price change", async () => {
        await app.dai.mint(app.user1.address, tokens('100000'))

        // user 1 supply DAI
        await app.dai.connect(app.user1).approve(app.pdai.address, REPAY_MAX)
        await app.pdai.connect(app.user1).mint(tokens('1000'))
        await app.unitroller.connect(app.user1).enterMarkets([app.pdai.address])

        // user 1 borrow DAI
        await app.pdai.connect(app.user1).borrow(tokens('10'))

        // change DAI price
        await app.oracle.setUnderlyingPrice(app.pdai.address, '2000000000000000000')

        // user 1 repay DAI
        await app.dai.connect(app.user1).approve(app.pdai.address, REPAY_MAX)
        await expectEvent(app.pdai.connect(app.user1).repayBorrow(REPAY_MAX), 'RepayBorrow', { payer: app.user1.address, borrower: app.user1.address, accountBorrows: 0 })
    })

    it("repay entire loan with liquidity < 0", async () => {
        await app.dai.mint(app.user1.address, tokens('10'))

        // user 1 supply ETH
        await app.peth.connect(app.user1).mint({value: tokens('10')})
        await app.unitroller.connect(app.user1).enterMarkets([app.peth.address])

        // user 1 borrow DAI
        await app.pdai.connect(app.user1).borrow(tokens('10'))

        // change DAI price
        await app.oracle.setUnderlyingPrice(app.pdai.address, '5000000000000000000')

        // user 1 repay DAI
        await app.dai.connect(app.user1).approve(app.pdai.address, REPAY_MAX)
        await expectEvent(app.pdai.connect(app.user1).repayBorrow(REPAY_MAX), 'RepayBorrow', { payer: app.user1.address, borrower: app.user1.address, accountBorrows: 0 })
    })

    it("for multiple users", async () => {
        // user 1, 2 supply
        await app.peth.connect(app.user1).mint({value: tokens('10')})
        await app.peth.connect(app.user2).mint({value: tokens('10')})
        await app.unitroller.connect(app.user1).enterMarkets([app.peth.address])
        await app.unitroller.connect(app.user2).enterMarkets([app.peth.address])

        // user 1, 2 borrow
        await app.pdai.connect(app.user1).borrow(tokens('20'))
        await app.pdai.connect(app.user2).borrow(tokens('30'))

        expect(await app.dai.balanceOf(app.user1.address)).to.equal(tokens('20'))
        expect(await app.dai.balanceOf(app.user2.address)).to.equal(tokens('30'))

        // user 1, 2 repay
        await app.dai.connect(app.user1).approve(app.pdai.address, tokens('20'))
        await app.pdai.connect(app.user1).repayBorrow(tokens('20'))
        await app.dai.connect(app.user2).approve(app.pdai.address, tokens('30'))
        await app.pdai.connect(app.user2).repayBorrow(tokens('30'))

        expect(await app.dai.balanceOf(app.user1.address)).to.equal(tokens('0'))
        expect(await app.dai.balanceOf(app.user2.address)).to.equal(tokens('0'))
    })

    it("comptroller.getDepositBorrowValues sumBorrow", async () => {
        expect((await app.unitroller.getDepositBorrowValues(app.user1.address))[2]).to.equal(0)

        // user 1 supply
        await app.peth.connect(app.user1).mint({value: tokens('10')})
        await app.unitroller.connect(app.user1).enterMarkets([app.peth.address])

        // user 1 borrow
        await app.pdai.connect(app.user1).borrow(10000)
        await app.ppbx.connect(app.user1).borrow(10000)

        expect((await app.unitroller.getDepositBorrowValues(app.user1.address))[2]).to.equal(40000)

        await app.pdai.connect(app.user1).borrow(10000)

        expect((await app.unitroller.getDepositBorrowValues(app.user1.address))[2]).to.equal(50000)

        await app.pdai.connect(app.user1).borrow(10001)

        expect((await app.unitroller.getDepositBorrowValues(app.user1.address))[2]).to.equal(60001)

        // user 1 repay
        await app.dai.connect(app.user1).approve(app.pdai.address, tokens('20'))
        await app.pdai.connect(app.user1).repayBorrow(5001)

        expect((await app.unitroller.getDepositBorrowValues(app.user1.address))[2]).to.equal(55000)
    })
})

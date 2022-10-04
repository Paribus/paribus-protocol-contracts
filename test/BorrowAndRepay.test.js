const setupAll = require('./utils/setupAllMocked')
const {tokens} = require('./utils/testHelpers')
const {expect} = require("chai")

let app

describe("Borrow and repay logic", () => {
    beforeEach(async () => {
        app = await setupAll()
        await app.pbx.transfer(app.unitroller.address, tokens('10000'))
        await app.unitroller._setPBXSpeeds([app.pdai.address], [tokens('0.2')], [tokens('0.2')])

        // owner supply
        await app.dai.approve(app.pdai.address, tokens('100000'))
        await app.pdai.mint(tokens('100000'))
        await app.pbx.approve(app.ppbx.address, tokens('10000'))
        await app.ppbx.mint(tokens('10000'))
    })

    it("for single user", async () => {
        // user 1 supply
        await app.peth.connect(app.user1).mint({value: tokens('10')})
        await app.unitroller.connect(app.user1).enterMarkets([app.peth.address])

        // user 1 borrow
        await app.pdai.connect(app.user1).borrow(tokens('10'))

        expect(await app.dai.balanceOf(app.user1.address)).to.equal(tokens('10'))

        // user 1 repay
        await app.dai.connect(app.user1).approve(app.pdai.address, tokens('10'))
        await app.pdai.connect(app.user1).repayBorrow(tokens('10'))

        expect(await app.dai.balanceOf(app.user1.address)).to.equal(tokens('0'))
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

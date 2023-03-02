const setupAll = require('./utils/setupAllMocked')
const {expect} = require("chai")
const {mintAndDepositToken} = require("./utils/testHelpers")
const {expectEvent, expectRevert} = require("./utils/expectAddons")

let app

describe("PToken", () => {
    beforeEach(async () => {
        app = await setupAll()
    })

    it("name, symbol, admin, underlying", async () => {
        expect(await app.pdai.name()).to.equal("pToken DAI")
        expect(await app.pdai.symbol()).to.equal("pDAI")
        expect(await app.pdai.admin()).to.equal(app.owner.address)
        expect(await app.pdai.underlying()).to.equal(app.dai.address)

        expect(await app.peth.name()).to.equal("pEther")
        expect(await app.peth.symbol()).to.equal("pETH")
        expect(await app.peth.admin()).to.equal(app.owner.address)
    })

    it("transferTokens", async () => {
        await mintAndDepositToken(app, [app.pwbtc], '1000000000000')
        await expectEvent(app.pwbtc.transfer(app.owner.address, '10000000000'), 'Failure')
        await expectEvent(app.pwbtc.transfer(app.user1.address, '10000000000'), 'Transfer')
        await expectEvent(app.pwbtc.transferFrom(app.owner.address, app.user1.address, '10000000000'), 'Transfer')
        await expectRevert(app.pwbtc.transferFrom(app.user2.address, app.user1.address, '10000000000'), 'ALLOWANCE_NOT_ENOUGH')
        await expectEvent(app.pwbtc.approve(app.user2.address, '100000000000'), 'Approval')
        expect(await app.pwbtc.allowance(app.owner.address, app.user2.address)).to.equal('100000000000')
        await expectEvent(app.pwbtc.connect(app.user2).transferFrom(app.owner.address, app.user1.address, '10000000000'), 'Transfer')
    })

    it("add && remove reserves", async () => {
        await app.wbtc.mint(app.owner.address, '10000')
        await app.wbtc.approve(app.pwbtc.address, '10000')

        await expectEvent(app.pwbtc._addReserves('100'), 'ReservesAdded')
        await expectEvent(app.pwbtc._reduceReserves('100'), 'ReservesReduced')
    })

    it("change admin", async () => {
        await expectEvent(app.pwbtc._setPendingAdmin(app.user1.address), 'NewPendingAdmin')
        await expectEvent(app.pwbtc.connect(app.user1)._acceptAdmin(), 'NewAdmin')
    })
})

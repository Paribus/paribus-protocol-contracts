const setupAll = require('./utils/setupAllMocked')
const {tokens} = require('./utils/testHelpers')
const {expect} = require("chai")

let app

describe("Supply and withdraw logic", () => {
    beforeEach(async () => {
        app = await setupAll()
        await app.pbx.transfer(app.unitroller.address, tokens('100000'))
        await app.unitroller._setPBXSpeeds([app.pdai.address], [tokens('0.2')], [tokens('0.2')])

        await app.dai.transfer(app.user1.address, tokens('10'))
        await app.dai.transfer(app.user2.address, tokens('20'))
        // await app.wbtc.transfer(app.user1.address, tokens('20'))
        await app.wbtc.allocateTo(app.user1.address, tokens('20'))
    })

    it("for single user", async () => {
        // user 1 supply
        await app.dai.connect(app.user1).approve(app.pdai.address, tokens('10'))
        await app.pdai.connect(app.user1).mint(tokens('10'))

        expect(await app.dai.balanceOf(app.user1.address)).to.equal(tokens('0'))
        expect(await app.pdai.balanceOf(app.user1.address)).to.equal('50000000000')

        // user 1 withdraw
        await app.pdai.connect(app.user1).redeem(await app.pdai.balanceOf(app.user1.address))
        expect(await app.dai.balanceOf(app.user1.address)).to.equal(tokens('10'))
        expect(await app.pdai.balanceOf(app.user1.address)).to.equal(tokens('0'))
    })

    it("for multiple assets", async () => {
        // user 1 supply
        await app.dai.connect(app.user1).approve(app.pdai.address, tokens('10'))
        await app.pdai.connect(app.user1).mint(tokens('10'))
        await app.wbtc.connect(app.user1).approve(app.pwbtc.address, tokens('20'))
        await app.pwbtc.connect(app.user1).mint(tokens('20'))

        expect(await app.dai.balanceOf(app.user1.address)).to.equal(tokens('0'))
        expect(await app.pdai.balanceOf(app.user1.address)).to.equal('50000000000')
        expect(await app.wbtc.balanceOf(app.user1.address)).to.equal(tokens('0'))
        expect(await app.pwbtc.balanceOf(app.user1.address)).to.equal('1000000000000000000000')

        // user 1 withdraw
        await app.pdai.connect(app.user1).redeem(await app.pdai.balanceOf(app.user1.address))
        await app.pwbtc.connect(app.user1).redeem(await app.pwbtc.balanceOf(app.user1.address))
        expect(await app.dai.balanceOf(app.user1.address)).to.equal(tokens('10'))
        expect(await app.pdai.balanceOf(app.user1.address)).to.equal(tokens('0'))
        expect(await app.wbtc.balanceOf(app.user1.address)).to.equal(tokens('20'))
        expect(await app.pwbtc.balanceOf(app.user1.address)).to.equal(tokens('0'))
    })

    it("for multiple users", async () => {
        // user 1, 2 supply
        await app.dai.connect(app.user1).approve(app.pdai.address, tokens('10'))
        await app.pdai.connect(app.user1).mint(tokens('10'))
        await app.dai.connect(app.user2).approve(app.pdai.address, tokens('20'))
        await app.pdai.connect(app.user2).mint(tokens('20'))

        expect(await app.dai.balanceOf(app.user1.address)).to.equal(tokens('0'))
        expect(await app.pdai.balanceOf(app.user1.address)).to.equal('50000000000')
        expect(await app.dai.balanceOf(app.user2.address)).to.equal(tokens('0'))
        expect(await app.pdai.balanceOf(app.user2.address)).to.equal('100000000000')

        // user 1, 2 withdraw
        await app.pdai.connect(app.user1).redeem(await app.pdai.balanceOf(app.user1.address))
        await app.pdai.connect(app.user2).redeem(await app.pdai.balanceOf(app.user2.address))
        expect(await app.dai.balanceOf(app.user1.address)).to.equal(tokens('10'))
        expect(await app.pdai.balanceOf(app.user1.address)).to.equal(tokens('0'))
        expect(await app.dai.balanceOf(app.user2.address)).to.equal(tokens('20'))
        expect(await app.pdai.balanceOf(app.user2.address)).to.equal(tokens('0'))
    })
})

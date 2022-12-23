const setupAll = require('./utils/setupAllMocked')
const {tokens, mintAndDepositToken, advanceDay} = require('./utils/testHelpers')
const {expect} = require("chai")
const {ethers} = require('hardhat')
const {BigNumber} = ethers
const {expectEvent} = require("./utils/expectAddons")

let app

describe("Supply and withdraw logic", () => {
    beforeEach(async () => {
        app = await setupAll()
        await mintAndDepositToken(app, [app.pdai, app.pwbtc], tokens('1')) // first deposit so the MINIMUM_LIQUIDITY is handled
    })

    it("test first mint, MINIMUM_LIQUIDITY handling", async () => {
        // test ppbx, first mint
        expect(await app.ppbx.totalSupply()).to.equal(0)
        await app.pbx.mint(app.user1.address, tokens('10'))
        await app.pbx.connect(app.user1).approve(app.ppbx.address, tokens('10'))
        await expectEvent(app.ppbx.connect(app.user1).mint(tokens('1')), 'Mint', { minter: app.user1.address, mintAmount: tokens('1'), mintTokens: BigNumber.from("5000000000").sub(await app.ppbx.MINIMUM_LIQUIDITY()) })

        // pbx second mint
        await expectEvent(app.ppbx.connect(app.user1).mint(tokens('1')), 'Mint', { minter: app.user1.address, mintAmount: tokens('1'), mintTokens: "5000000000" })

        // advance day and accrue interest
        await advanceDay()
        await expectEvent(app.ppbx.accrueInterest(), 'AccrueInterest')

        // redeem all, check for zero total supply
        await expectEvent(app.ppbx.connect(app.user1).redeem(await app.ppbx.balanceOf(app.user1.address)), 'Redeem', { redeemer: app.user1.address })
        await expectEvent(app.ppbx.accrueInterest(), 'AccrueInterest')
        expect(await app.ppbx.balanceOf(app.user1.address)).to.equal(0)
        expect(await app.ppbx.totalSupply()).to.equal(await app.ppbx.MINIMUM_LIQUIDITY())

        // test usdc
        expect(await app.pusdc.totalSupply()).to.equal(0)
        await app.usdc.mint(app.user1.address, tokens('10'))
        await app.usdc.connect(app.user1).approve(app.pusdc.address, tokens('10'))
        await expectEvent(app.pusdc.connect(app.user1).mint(tokens('10')), 'Mint', { minter: app.user1.address, mintAmount: tokens('10'), mintTokens: BigNumber.from("50000000000000000000000").sub(await app.pusdc.MINIMUM_LIQUIDITY()) })
    })

    it("for single user", async () => {
        // user 1 supply
        await mintAndDepositToken(app, [app.pdai], tokens('10'), app.user1)

        expect(await app.dai.balanceOf(app.user1.address)).to.equal(tokens('0'))
        expect(await app.pdai.balanceOf(app.user1.address)).to.equal('50000000000')

        // user 1 withdraw
        await app.pdai.connect(app.user1).redeem(await app.pdai.balanceOf(app.user1.address))
        expect(await app.dai.balanceOf(app.user1.address)).to.equal(tokens('10'))
        expect(await app.pdai.balanceOf(app.user1.address)).to.equal(tokens('0'))
    })

    it("for multiple assets", async () => {
        // user 1 supply DAI
        await mintAndDepositToken(app, [app.pdai], tokens('10'), app.user1)

        // user 1 supply WBTC
        await app.wbtc.allocateTo(app.user1.address, tokens('20'))
        await app.wbtc.connect(app.user1).approve(app.pwbtc.address, tokens('20'))
        await app.pwbtc.connect(app.user1).mint(tokens('20'))

        expect(await app.dai.balanceOf(app.user1.address)).to.equal(tokens('0'))
        expect(await app.pdai.balanceOf(app.user1.address)).to.equal('50000000000')
        expect(await app.wbtc.balanceOf(app.user1.address)).to.equal(tokens('0'))
        expect(await app.pwbtc.balanceOf(app.user1.address)).to.equal('1000000000000000000000')

        // user 1 withdraw DAI, WBTC
        await app.pdai.connect(app.user1).redeem(await app.pdai.balanceOf(app.user1.address))
        await app.pwbtc.connect(app.user1).redeem(await app.pwbtc.balanceOf(app.user1.address))
        expect(await app.dai.balanceOf(app.user1.address)).to.equal(tokens('10'))
        expect(await app.pdai.balanceOf(app.user1.address)).to.equal(tokens('0'))
        expect(await app.wbtc.balanceOf(app.user1.address)).to.equal(tokens('20'))
        expect(await app.pwbtc.balanceOf(app.user1.address)).to.equal(tokens('0'))
    })

    it("for multiple users", async () => {
        // user 1 supply
        await mintAndDepositToken(app, [app.pdai], tokens('10'), app.user1)

        // user 2 supply
        await mintAndDepositToken(app, [app.pdai], tokens('20'), app.user2)

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

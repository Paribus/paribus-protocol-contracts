const setupAll = require('./utils/setupAllMocked')
const {tokens, advanceBlock, mintAndDepositToken} = require('./utils/testHelpers')
const {expect} = require("chai")
const {expectFractionalAmount} = require("./utils/expectAddons")

let app

describe("PBX reward distribution logic", () => {
    describe("for deposit", () => {
        beforeEach(async () => {
            app = await setupAll()
            await app.pbx.mint(app.unitroller.address, tokens('100000'))
            await app.unitroller._setPBXSpeeds([app.peth.address], [tokens('1')], [tokens('1')])
        })

        it("single user", async () => {
            // user 1 supply
            await app.peth.connect(app.user1).mint({value: '10000002000000000000'}) // tokens('10') + MINIMUM_LIQUIDITY included

            // user 1 claim PBX
            await advanceBlock(5)
            await app.unitroller.claimPBXReward(app.user1.address)

            expect(await app.pbx.balanceOf(app.user1.address)).to.equal(tokens('6'))
        })

        it("multiple users", async () => {
            // user 1, 2 supply
            await app.peth.connect(app.user1).mint({value: '10000002000000000000'}) // tokens('10') + MINIMUM_LIQUIDITY included
            await app.peth.connect(app.user2).mint({value: tokens('20')})

            // user 1, 2 claim PBX
            await advanceBlock(5)
            await app.unitroller.claimPBXReward(app.user1.address)
            await advanceBlock(2)
            await app.unitroller.claimPBXReward(app.user2.address)

            expect(await app.pbx.balanceOf(app.user1.address)).to.equal(tokens('3'))
            expect(await app.pbx.balanceOf(app.user2.address)).to.equal(tokens('6'))
        })
    })

    describe("for borrow", () => {
        beforeEach(async () => {
            app = await setupAll()
            await app.pbx.mint(app.unitroller.address, tokens('100000'))
            await app.unitroller._setPBXSpeeds([app.pdai.address], [tokens('0.2')], [tokens('0.2')])

            // owner supply
            await mintAndDepositToken(app, [app.pdai], tokens('100000'))
        })

        it("single user", async () => {
            // user 1 supply
            await app.peth.connect(app.user1).mint({value: '10000002000000000000'}) // tokens('10') + MINIMUM_LIQUIDITY included
            await app.unitroller.connect(app.user1).enterMarkets([app.peth.address])

            // user 1 borrow
            await app.pdai.connect(app.user1).borrow(tokens('10'))

            // user 1 claim PBX
            await advanceBlock(5)
            await app.unitroller.claimPBXReward(app.user1.address)

            expect(await app.pbx.balanceOf(app.user1.address)).to.equal(tokens('1.2'))
        })

        it("multiple users", async () => {
            // user 1, 2 supply
            await app.peth.connect(app.user1).mint({value: '10000002000000000000'}) // tokens('10') + MINIMUM_LIQUIDITY included
            await app.peth.connect(app.user2).mint({value: tokens('10')})
            await app.unitroller.connect(app.user1).enterMarkets([app.peth.address])
            await app.unitroller.connect(app.user2).enterMarkets([app.peth.address])

            // user 1, 2 borrow
            await app.pdai.connect(app.user1).borrow(tokens('20'))
            await app.pdai.connect(app.user2).borrow(tokens('30'))

            // user 1, 2 claim PBX
            await advanceBlock(5)
            await app.unitroller.claimPBXReward(app.user1.address)
            await advanceBlock(2)
            await app.unitroller.claimPBXReward(app.user2.address)

            await expectFractionalAmount(await app.pbx.balanceOf(app.user1.address), tokens('0.680000000001340000'), 4)
            await expectFractionalAmount(await app.pbx.balanceOf(app.user2.address), tokens('1.079999999997980000'), 4)
        })
    })
})

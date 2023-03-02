const setupAll = require('./utils/setupAllMocked')
const {tokens, advanceBlock, mintAndDepositToken} = require('./utils/testHelpers')
const {expect} = require("chai")
const {expectFractionalAmount} = require("./utils/expectAddons")

let app

describe("PBX reward distribution logic", () => {
    describe("for deposit", () => {
        beforeEach(async () => {
            app = await setupAll()
            await app.pbx.mint(app.unitroller.address, tokens('1000000000'))
            await app.unitroller._setPBXSpeeds([app.peth.address], [tokens('1')], [tokens('1')])
        })

        it("single user", async () => {
            await app.peth.connect(app.user1).mint({value: '10000002000000000000'}) // tokens('10') + MINIMUM_LIQUIDITY included

            await advanceBlock(5)
            await app.unitroller.claimPBXReward(app.user1.address)

            expect(await app.pbx.balanceOf(app.user1.address)).to.equal(tokens('6'))
        })

        it("single user 2", async () => {
            await app.unitroller._setPBXSpeeds([app.pusdc.address], ['100000000'], ['0'])
            await mintAndDepositToken(app, [app.pusdc], '1000000000', app.user1)

            await advanceBlock(100)
            await app.unitroller.claimPBXReward(app.user1.address)

            expect(await app.pbx.balanceOf(app.user1.address)).to.equal('10099999999')

            await advanceBlock(42)
            await app.unitroller.claimPBXReward(app.user1.address)

            expect(await app.pbx.balanceOf(app.user1.address)).to.equal('14399999998')
        })

        it("single user, multiple markets", async () => {
            await app.unitroller._setPBXSpeeds([app.pusdc.address], ['100000000'], ['0'])
            await mintAndDepositToken(app, [app.pusdc], '1000000000', app.user1)
            await app.peth.connect(app.user1).mint({value: '10000002000000000000'}) // tokens('10') + MINIMUM_LIQUIDITY included

            await advanceBlock(100)
            await app.unitroller.claimPBXReward(app.user1.address)

            expect(await app.pbx.balanceOf(app.user1.address)).to.equal('101000000010199999999')
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

        it("multiple users, multiple markets", async () => {
            await app.unitroller._setPBXSpeeds([app.pusdc.address], ['100000000'], ['0'])

            // user 1, 2 supply
            await mintAndDepositToken(app, [app.pusdc], '1000000000042', app.user1)
            await app.peth.connect(app.user1).mint({value: '10000002000000000000'}) // tokens('10') + MINIMUM_LIQUIDITY included
            await app.peth.connect(app.user2).mint({value: tokens('20')})

            // user 1, 2 claim PBX
            await advanceBlock(50)
            await app.unitroller.claimPBXReward(app.user1.address)
            await advanceBlock(22)
            await app.unitroller.claimPBXReward(app.user2.address)

            expect(await app.pbx.balanceOf(app.user1.address)).to.equal('18000000005299999999')
            expect(await app.pbx.balanceOf(app.user2.address)).to.equal('49333333333333333333')
        })
    })

    describe("for borrow", () => {
        beforeEach(async () => {
            app = await setupAll()
            await app.pbx.mint(app.unitroller.address, tokens('100000'))
            await app.unitroller._setPBXSpeeds([app.pdai.address], [tokens('0.2')], [tokens('0.2')])
            await app.unitroller._setPBXSpeeds([app.pusdc.address], ['0'], ['100000000'])

            // owner supply
            await mintAndDepositToken(app, [app.pdai], tokens('100000'))
            await mintAndDepositToken(app, [app.pusdc], tokens('100000'))
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

        it("single user, multiple markets", async () => {
            // user 1 supply
            await app.peth.connect(app.user1).mint({value: '10000002000000000000'}) // tokens('10') + MINIMUM_LIQUIDITY included
            await app.unitroller.connect(app.user1).enterMarkets([app.peth.address])

            // user 1 borrow
            await app.pdai.connect(app.user1).borrow(tokens('10'))
            await app.pusdc.connect(app.user1).borrow(tokens('2'))

            // user 1 claim PBX
            await advanceBlock(42)
            await app.unitroller.claimPBXReward(app.user1.address)

            expect(await app.pbx.balanceOf(app.user1.address)).to.equal('8800000000000000000')

            await advanceBlock(42)
            await app.unitroller.claimPBXReward(app.user1.address)

            expect(await app.pbx.balanceOf(app.user1.address)).to.equal('17400000000000000000')
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

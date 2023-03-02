const setupAll = require('./utils/setupAllMocked')
const {expectRevert, expectEvent} = require("./utils/expectAddons")
const {ethers} = require("hardhat")
const {ZERO_ADDRESS, mintAndDepositToken} = require("./utils/testHelpers")
const {setupUpgradeablePToken} = require("./utils/setupContracts")
const {expect} = require("chai")

let app

describe("Validations && checks", () => {
    beforeEach(async () => {
        app = await setupAll()
    })

    it("admin functions should not be callable by nonAdmin", async () => {
        const nonAdmin = app.user2

        await expectRevert(app.comptrollerPart1.connect(nonAdmin)._become(app.unitroller.address), 'only admin')

        await expectRevert(app.unitroller.connect(nonAdmin)._setPriceOracle(app.oracle.address), 'only admin')
        await expectRevert(app.unitroller.connect(nonAdmin)._setCloseFactor(1), 'only admin')
        await expectRevert(app.unitroller.connect(nonAdmin)._setCollateralFactor(app.pusdc.address, 1), 'only admin')
        await expectRevert(app.unitroller.connect(nonAdmin)._setLiquidationIncentive('1000000000'), 'only admin')
        await expectRevert(app.unitroller.connect(nonAdmin)._supportMarket(app.pusdc.address), 'only admin')
        await expectRevert(app.unitroller.connect(nonAdmin)._setMarketBorrowCaps([app.pusdc.address], [1]), 'only admin')
        await expectRevert(app.unitroller.connect(nonAdmin)._setBorrowCapGuardian(app.user1.address), 'only admin')
        await expectRevert(app.unitroller.connect(nonAdmin)._setPauseGuardian(app.user1.address), 'only admin')
        await expectRevert(app.unitroller.connect(nonAdmin)._setMintPausedGlobal(1), 'only pause guardian and admin can pause')
        await expectRevert(app.unitroller.connect(nonAdmin)._setMintPaused(app.pusdc.address, 1), 'only pause guardian and admin can pause')
        await expectRevert(app.unitroller.connect(nonAdmin)._setBorrowPaused(app.pusdc.address, 1), 'only pause guardian and admin can pause')
        await expectRevert(app.unitroller.connect(nonAdmin)._setBorrowPausedGlobal(1), 'only pause guardian and admin can pause')
        await expectRevert(app.unitroller.connect(nonAdmin)._setTransferPaused(1), 'only pause guardian and admin can pause')
        await expectRevert(app.unitroller.connect(nonAdmin)._setSeizePaused(1), 'only pause guardian and admin can pause')
        await expectRevert(app.unitroller.connect(nonAdmin)._setPBXToken(app.pbx.address), 'only admin')
        await expectRevert(app.unitroller.connect(nonAdmin)._grantPBX(app.user1.address, 1), 'only admin')
        await expectRevert(app.unitroller.connect(nonAdmin)._setPBXSpeeds([app.pusdc.address], [1], [1]), 'only admin')
        await expectRevert(app.unitroller.connect(nonAdmin)._setContributorPBXSpeed(app.user1.address, 1), 'only admin')

        const unitroller = await ethers.getContractAt("Unitroller", app.unitroller.address) // abi fix
        await expectRevert(unitroller.connect(nonAdmin)._setPendingImplementations(app.comptrollerPart1.address, app.comptrollerPart2.address), 'only admin')
        await expectRevert(unitroller.connect(nonAdmin)._setPendingAdmin(app.user2.address), 'only admin')
        await expectRevert(unitroller.connect(nonAdmin)._acceptAdmin(), 'only pending admin')

        await expectRevert(app.jrmWbtc.connect(nonAdmin)._setPendingAdmin(app.user2.address), 'only admin')
        await expectRevert(app.jrmWbtc.connect(nonAdmin)._acceptAdmin(), 'only pending admin')
        await expectRevert(app.jrmWbtc.connect(nonAdmin).updateJumpRateModel(1, 1, 1, 1), 'only admin')

        let pusdc = await ethers.getContractAt("PToken", app.pusdc.address) // abi fix
        await expectRevert(pusdc.connect(nonAdmin).initialize(app.unitroller.address, app.jrmStableCoin.address, 1, '', '', 1), 'only admin may initialize the market')
        await expectRevert(app.pusdc.connect(nonAdmin)._setPendingAdmin(app.user2.address), 'only admin')
        await expectRevert(app.pusdc.connect(nonAdmin)._acceptAdmin(), 'only pending admin')
        await expectRevert(app.pusdc.connect(nonAdmin)._setComptroller(app.unitroller.address), 'only admin')
        await expectRevert(app.pusdc.connect(nonAdmin)._setReserveFactor(1), 'only admin')
        await expectRevert(app.pusdc.connect(nonAdmin)._reduceReserves(1), 'only admin')
        await expectRevert(app.pusdc.connect(nonAdmin)._setInterestRateModel(app.jrmStableCoin.address), 'only admin')

        pusdc = await ethers.getContractAt("PErc20Delegator", app.pusdc.address) // abi fix
        await expectRevert(pusdc.connect(nonAdmin)._setImplementation(app.pusdc.address, 1, []), 'only admin')

        const peth = await ethers.getContractAt("PEtherDelegator", app.peth.address) // abi fix
        await expectRevert(peth.connect(nonAdmin)._setImplementation(app.peth.address, 1, []), 'only admin')

    })

    it("input args validation", async () => {
        await expectRevert.unspecified(app.unitroller._setPriceOracle(app.usdc.address))
        await expectRevert(app.unitroller._setCloseFactor('10000000000000000000000000'), 'invalid argument')
        await expectRevert(app.unitroller._setCollateralFactor(app.pusdc.address, '10000000000000000000000000'), 'invalid argument')
        await expectRevert(app.unitroller._setLiquidationIncentive('1'), 'invalid argument')
        await expectRevert(app.unitroller._setMarketBorrowCaps([], []), 'invalid input')
        await expectRevert(app.unitroller._setMarketBorrowCaps([], [1]), 'invalid input')
        await expectRevert(app.unitroller._setPBXToken(ZERO_ADDRESS), 'invalid argument')
        await expectRevert(app.unitroller.redeemVerify(app.pusdc.address, app.user1.address, 1, 0), 'redeemTokens zero')
        await expectRevert(app.unitroller.borrowAllowed(app.pusdc.address, app.user2.address, 1), 'sender must be pToken')

        await app.unitroller._setMarketBorrowCaps([app.pusdc.address], [1])
        await mintAndDepositToken(app, app.pwbtc, 100)
        await app.unitroller.enterMarkets([app.pusdc.address])
        await expectRevert(app.unitroller.borrowAllowed(app.pusdc.address, app.owner.address, 100), 'market borrow cap reached')

        await expectRevert(app.unitroller._grantPBX(app.user1.address, 100), 'insufficient PBX for grant')
        await expectRevert(app.unitroller._setPBXSpeeds([app.pusdc.address], [1], []), 'invalid argument')
        await expectRevert(app.unitroller._setPBXSpeeds([], [1], [1]), 'invalid argument')

        const pusdc = await ethers.getContractAt("PToken", app.pusdc.address) // abi fix
        await expectRevert(pusdc.initialize(app.unitroller.address, app.jrmStableCoin.address, 1, '', '', 1), 'market may only be initialized once')

        await expectRevert.unspecified(app.pusdc._setComptroller(app.user1.address))
        await expectRevert.unspecified(app.pusdc._setInterestRateModel(app.user1.address))

        let pToken = await ethers.getContractFactory('PErc20Immutable')
        await expectRevert(pToken.deploy(app.usdc.address, app.usdc.address, app.usdc.address, 0, 'asasd', 'asd', 8, app.owner.address), 'initial exchange rate must be greater than zero')
        await expectRevert(pToken.deploy(app.usdc.address, app.usdc.address, app.usdc.address, 1, 'asasd', 'asd', 8, app.owner.address), 'setting comptroller failed')
        await expectRevert(pToken.deploy(app.usdc.address, app.unitroller.address, app.usdc.address, 1, 'asasd', 'asd', 8, app.owner.address), 'setting interest rate model failed')
        await pToken.deploy(app.usdc.address, app.unitroller.address, app.jrmStableCoin.address, 1, 'asasd', 'asd', 8, app.owner.address) // no revert
        expect(pToken.address).to.not.equal(ZERO_ADDRESS).and.to.not.be.null
    })

    it("isPToken", async () => {
        const notPToken = app.user1.address

        await expectRevert.unspecified(app.oracle.setUnderlyingPrice(notPToken, 1))
        await expectRevert.unspecified(app.unitroller._setCollateralFactor(notPToken, '1'))
        await expectRevert.unspecified(app.unitroller._supportMarket(notPToken))
        await expectRevert.unspecified(app.unitroller.exitMarket(notPToken))
        await expectRevert.unspecified(app.unitroller._setMarketBorrowCaps([notPToken], [1]))
        await expectRevert.unspecified(app.unitroller.liquidateCalculateSeizeTokens(notPToken, app.pusdc.address, 1))
        await expectRevert.unspecified(app.unitroller.liquidateCalculateSeizeTokens(app.pusdc.address, notPToken, 1))
        await expectRevert.unspecified(app.unitroller.liquidateBorrowAllowed(notPToken, app.pusdc.address, app.user1.address, app.user2.address, 1))
        await expectRevert.unspecified(app.unitroller.redeemAllowed(notPToken, app.pusdc.address, 1))
        await expectRevert.unspecified(app.unitroller.borrowAllowed(notPToken, app.owner.address, 100))
        await expectRevert.unspecified(app.unitroller.transferAllowed(notPToken, app.owner.address, app.user1.address, 100))
        await expectRevert.unspecified(app.unitroller.mintAllowed(notPToken, app.owner.address, 100))

        await expectRevert.unspecified(app.unitroller.repayBorrowAllowed(notPToken, app.owner.address, app.user1.address, 100))
        await expectRevert.unspecified(app.unitroller.seizeAllowed(notPToken, app.pusdc.address, app.owner.address, app.user1.address, 100))
        await expectRevert.unspecified(app.unitroller.seizeAllowed(app.pusdc.address, notPToken, app.owner.address, app.user1.address, 100))
        await expectRevert.unspecified(app.unitroller.claimPBXSingle(app.user1.address, [notPToken]))

        const pusdc = await ethers.getContractAt("PErc20Delegator", app.pusdc.address) // abi fix
        await expectRevert.unspecified(pusdc._setImplementation(notPToken, 1, []))

        const peth = await ethers.getContractAt("PEtherDelegator", app.peth.address) // abi fix
        await expectRevert.unspecified(peth._setImplementation(notPToken, 1, []))

        await expectRevert.unspecified(app.pusdc.liquidateBorrow(app.user1.address, 1, notPToken))
    })

    it("pause guardians", async () => {
        await app.unitroller._setBorrowPaused(app.pusdc.address, 1)
        await expectRevert(app.unitroller.borrowAllowed(app.pusdc.address, app.owner.address, 100), 'borrow is paused')
        await app.unitroller._setBorrowPausedGlobal(1)
        await expectRevert(app.unitroller.borrowAllowed(app.peth.address, app.owner.address, 100), 'borrow is paused')

        await mintAndDepositToken(app, app.pwbtc, 100)
        await app.unitroller._setTransferPaused(1)
        await expectRevert(app.unitroller.transferAllowed(app.pwbtc.address, app.owner.address, app.user1.address, 100), 'transfer is paused')

        await app.unitroller._setMintPaused(app.pusdc.address, 1)
        await expectRevert(app.unitroller.mintAllowed(app.pusdc.address, app.owner.address, 100), 'mint is paused')
        await app.unitroller._setMintPausedGlobal(1)
        await expectRevert(app.unitroller.mintAllowed(app.peth.address, app.owner.address, 100), 'mint is paused')

        await app.unitroller._setSeizePaused(1)
        await expectRevert(app.unitroller.seizeAllowed(app.pwbtc.address, app.pusdc.address, app.owner.address, app.user1.address, 100), 'seize is paused')
    })

    it("denying comptroller", async () => {
        let denyingComptroller = await ethers.getContractFactory('DenyingComptrollerMock')
        denyingComptroller = await denyingComptroller.deploy()

        // to be able to do first mint
        let allowingComptroller = await ethers.getContractFactory('AllowingComptrollerMock')
        allowingComptroller = await allowingComptroller.deploy()

        const pToken = await setupUpgradeablePToken('pToken DAI', 'pDAI', 8, '200000000000000000000000000', app.dai, allowingComptroller, app.jrmStableCoin)

        await mintAndDepositToken(app, [pToken], '100000000000000')
        await expectEvent(pToken._setComptroller(denyingComptroller.address), 'NewComptroller')

        await expectEvent(pToken.mint(1), 'Failure', { error: 3 }) // COMPTROLLER_REJECTION
        await expectEvent(pToken.transfer(app.user1.address, 1), 'Failure', { error: 3 }) // COMPTROLLER_REJECTION
        await expectEvent(pToken.redeem(1), 'Failure', { error: 3 }) // COMPTROLLER_REJECTION
        await expectEvent(pToken.redeemUnderlying(1), 'Failure', { error: 3 }) // COMPTROLLER_REJECTION
        await expectEvent(pToken.borrow(1), 'Failure', { error: 3 }) // COMPTROLLER_REJECTION
        await expectEvent(pToken.repayBorrow(1), 'Failure', { error: 3 }) // COMPTROLLER_REJECTION
        await expectEvent(pToken.repayBorrowBehalf(app.user1.address, 1), 'Failure', { error: 3 }) // COMPTROLLER_REJECTION
        await expectEvent(pToken.liquidateBorrow(app.user1.address, 1, app.pusdc.address), 'Failure', { error: 3 }) // COMPTROLLER_REJECTION
        await expectEvent(pToken.seize(app.user1.address, app.user2.address, 1), 'Failure', { error: 3 }) // COMPTROLLER_REJECTION
    })
})

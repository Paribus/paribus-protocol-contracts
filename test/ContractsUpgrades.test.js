const setupAll = require('./utils/setupAllMocked')
const {setComptrollerImpl} = require("./utils/setupContracts")
const {expect} = require("chai")
const {ethers} = require("hardhat")
const {expectRevert, expectEvent, expectFractionalAmount} = require("./utils/expectAddons")
const {mintAndDepositToken, tokens, REPAY_MAX, advanceDay} = require("./utils/testHelpers")

let app

describe("Contracts upgrade flow test", () => {
    beforeEach(async () => {
        app = await setupAll()
    })

    it("upgrade comptroller", async () => {
        const NewComptrollerPart1 = await ethers.getContractFactory("ComptrollerPart1V2Mock")
        let newComptrollerPart1 = await NewComptrollerPart1.deploy()
        const NewComptrollerPart2 = await ethers.getContractFactory("ComptrollerPart2V2Mock")
        let newComptrollerPart2 = await NewComptrollerPart2.deploy()

        await setComptrollerImpl(app.unitroller.address, newComptrollerPart1, newComptrollerPart2)

        let unitroller = await ethers.getContractAt("ComptrollerV2Interface", app.unitroller.address) // abi fix
        await unitroller.setFoo(44)
        await unitroller.setBar(43)

        expect(await unitroller.getFoo()).to.equal(44)
        expect(await unitroller.getBar()).to.equal(43)

        expect(await app.unitroller.comptrollerPart1Implementation()).to.equal(newComptrollerPart1.address)
        expect(await app.unitroller.comptrollerPart2Implementation()).to.equal(newComptrollerPart2.address)

        expect(await app.unitroller.PBXToken()).to.equal(app.pbx.address)
    })

    it("upgrade scenario 1", async () => {
        /* upgrade everything first */

        // upgrade comptroller
        const NewComptrollerPart1 = await ethers.getContractFactory("ComptrollerPart1V2Mock")
        let newComptrollerPart1 = await NewComptrollerPart1.deploy()
        const NewComptrollerPart2 = await ethers.getContractFactory("ComptrollerPart2V2Mock")
        let newComptrollerPart2 = await NewComptrollerPart2.deploy()
        await setComptrollerImpl(app.unitroller.address, newComptrollerPart1, newComptrollerPart2)

        // upgrade pDAI
        const NewPDai = await ethers.getContractFactory("PErc20DelegateV2Mock")
        let newPdai = await NewPDai.deploy()
        const pDAIDelegator = await ethers.getContractAt('PTokenDelegatorInterface', app.pdai.address) // abi fix
        await pDAIDelegator._setImplementation(newPdai.address, true, [])

        // upgrade pEther
        const NewPEther = await ethers.getContractFactory("PEtherDelegateV2Mock")
        let newPeth = await NewPEther.deploy()
        const pEtherDelegator = await ethers.getContractAt('PTokenDelegatorInterface', app.peth.address) // abi fix
        await pEtherDelegator._setImplementation(newPeth.address, true, [])

        /* test */

        // test data
        await app.oracle.setUnderlyingPrice(app.peth.address, '1000000000000000000')
        await app.oracle.setUnderlyingPrice(app.pdai.address, '1000000000000000000')
        await app.unitroller._setCollateralFactor(app.peth.address, tokens('0.5'))

        // owner supply DAI
        await mintAndDepositToken(app, [app.pdai], tokens('1000'))
        await mintAndDepositToken(app, [app.peth], tokens('1')) // first deposit so the MINIMUM_LIQUIDITY is handled

        // user 1 supply ETH
        await mintAndDepositToken(app, [app.peth], tokens('20'), app.user1)
        expect(await app.peth.balanceOfUnderlyingStored(app.user1.address)).to.equal(tokens('20'))
        await app.unitroller.connect(app.user1).enterMarkets([app.peth.address])
        expect((await app.unitroller.getAccountLiquidity(app.user1.address))[1]).to.equal(tokens("10"))

        // user 1 borrow DAI
        expect(await app.dai.balanceOf(app.user1.address)).to.equal(tokens('0'))
        await expectEvent(app.pdai.connect(app.user1).borrow(tokens('10')), 'Borrow', { borrower: app.user1.address, borrowAmount: tokens('10'), accountBorrows: tokens('10'), totalBorrows: tokens('10') })
        expect(await app.dai.balanceOf(app.user1.address)).to.equal(tokens('10'))

        // advance day and accrue interest
        await advanceDay()
        await expectEvent(app.peth.accrueInterest(), 'AccrueInterest')
        await expectEvent(app.pdai.accrueInterest(), 'AccrueInterest')

        // user 1 repay DAI
        await app.dai.mint(app.user1.address, tokens('1'))
        await app.dai.connect(app.user1).approve(app.pdai.address, REPAY_MAX)
        await expectEvent(app.pdai.connect(app.user1).repayBorrow(REPAY_MAX), 'RepayBorrow', { payer: app.user1.address, borrower: app.user1.address, accountBorrows: 0 })
        expect(await app.pdai.borrowBalanceStored(app.user1.address)).to.equal(0)
        expectFractionalAmount(await app.dai.balanceOf(app.user1.address), tokens('1'), 16)
        expectFractionalAmount((await app.unitroller.getAccountLiquidity(app.user1.address))[1], tokens('10'), 16)
    })

    it("upgrade scenario 2", async () => {
        // test data
        await app.oracle.setUnderlyingPrice(app.peth.address, '1000000000000000000')
        await app.oracle.setUnderlyingPrice(app.pdai.address, '1000000000000000000')
        await app.unitroller._setCollateralFactor(app.peth.address, tokens('0.5'))

        // owner supply DAI
        await mintAndDepositToken(app, [app.pdai], tokens('1000'))
        await mintAndDepositToken(app, [app.peth], tokens('1')) // first deposit so the MINIMUM_LIQUIDITY is handled

        // user 1 supply ETH
        await mintAndDepositToken(app, [app.peth], tokens('20'), app.user1)
        await app.unitroller.connect(app.user1).enterMarkets([app.peth.address])
        expect(await app.peth.balanceOfUnderlyingStored(app.user1.address)).to.equal(tokens('20'))
        expect((await app.unitroller.getAccountLiquidity(app.user1.address))[1]).to.equal(tokens("10"))

        // upgrade comptroller
        const NewComptrollerPart1 = await ethers.getContractFactory("ComptrollerPart1V2Mock")
        let newComptrollerPart1 = await NewComptrollerPart1.deploy()
        const NewComptrollerPart2 = await ethers.getContractFactory("ComptrollerPart2V2Mock")
        let newComptrollerPart2 = await NewComptrollerPart2.deploy()
        await setComptrollerImpl(app.unitroller.address, newComptrollerPart1, newComptrollerPart2)

        // upgrade pDAI
        const NewPDai = await ethers.getContractFactory("PErc20DelegateV2Mock")
        let newPdai = await NewPDai.deploy()
        const pDAIDelegator = await ethers.getContractAt('PTokenDelegatorInterface', app.pdai.address) // abi fix
        await pDAIDelegator._setImplementation(newPdai.address, true, [])

        // upgrade pEther
        const NewPEther = await ethers.getContractFactory("PEtherDelegateV2Mock")
        let newPeth = await NewPEther.deploy()
        const pEtherDelegator = await ethers.getContractAt('PTokenDelegatorInterface', app.peth.address) // abi fix
        await pEtherDelegator._setImplementation(newPeth.address, true, [])

        expect(await app.peth.balanceOfUnderlyingStored(app.user1.address)).to.equal(tokens('20'))
        expect((await app.unitroller.getAccountLiquidity(app.user1.address))[1]).to.equal(tokens("10"))

        // user 1 borrow DAI
        expect(await app.dai.balanceOf(app.user1.address)).to.equal(tokens('0'))
        await expectEvent(app.pdai.connect(app.user1).borrow(tokens('10')), 'Borrow', { borrower: app.user1.address, borrowAmount: tokens('10'), accountBorrows: tokens('10'), totalBorrows: tokens('10') })
        expect(await app.dai.balanceOf(app.user1.address)).to.equal(tokens('10'))

        // advance day and accrue interest
        await advanceDay()
        await expectEvent(app.peth.accrueInterest(), 'AccrueInterest')
        await expectEvent(app.pdai.accrueInterest(), 'AccrueInterest')

        // user 1 repay DAI
        await app.dai.mint(app.user1.address, tokens('1'))
        await app.dai.connect(app.user1).approve(app.pdai.address, REPAY_MAX)
        await expectEvent(app.pdai.connect(app.user1).repayBorrow(REPAY_MAX), 'RepayBorrow', { payer: app.user1.address, borrower: app.user1.address, accountBorrows: 0 })
        expect(await app.pdai.borrowBalanceStored(app.user1.address)).to.equal(0)
        expectFractionalAmount(await app.dai.balanceOf(app.user1.address), tokens('1'), 16)
        expectFractionalAmount((await app.unitroller.getAccountLiquidity(app.user1.address))[1], tokens('10'), 16)
    })

    it("comptroller upgrade fails when implementation is invalid", async () => {
        const NewComptrollerPart1 = await ethers.getContractFactory("ComptrollerPart1V2Mock")
        let newComptrollerPart1 = await NewComptrollerPart1.deploy()
        let invalidComptrollerPart2 = await NewComptrollerPart1.deploy()

        let unitroller = await ethers.getContractAt("Unitroller", app.unitroller.address) // abi fix

        await expectRevert.unspecified(unitroller._setPendingImplementations(newComptrollerPart1.address, invalidComptrollerPart2.address))
    })

    it("comptroller upgrade fails when implementation is invalid 2", async () => {
        let unitroller = await ethers.getContractAt("Unitroller", app.unitroller.address) // abi fix

        await expectRevert.unspecified(unitroller._setPendingImplementations(app.unitroller.address, app.unitroller.address))
    })

    it("comptroller upgrade fails when implementation is invalid 3", async () => {
        let unitroller = await ethers.getContractAt("Unitroller", app.unitroller.address) // abi fix

        await expectRevert.unspecified(unitroller._setPendingImplementations(app.dai.address, app.dai.address))
    })

    it("isComptroller", async () => {
        let comptrollerPart1Address = await app.unitroller.comptrollerPart1Implementation()
        let comptrollerPart2Address = await app.unitroller.comptrollerPart2Implementation()
        let comptrollerPart1 = await ethers.getContractAt("ComptrollerInterface", comptrollerPart1Address)
        let comptrollerPart2 = await ethers.getContractAt("ComptrollerInterface", comptrollerPart2Address)

        expect(await app.unitroller.isComptroller()).to.equal(true)
        expect(await comptrollerPart1.isComptroller()).to.equal(false)
        expect(await comptrollerPart1.isComptrollerPart1()).to.equal(true)
        expect(await comptrollerPart2.isComptroller()).to.equal(false)
        expect(await comptrollerPart2.isComptrollerPart2()).to.equal(true)
    })

    it("upgrade pToken", async () => {
        const NewPDai = await ethers.getContractFactory("PErc20DelegateV2Mock")
        let newPdai = await NewPDai.deploy()

        const pTokenDelegator = await ethers.getContractAt('PTokenDelegatorInterface', app.pdai.address) // abi fix
        await pTokenDelegator._setImplementation(newPdai.address, true, [])

        const pdai = await NewPDai.attach(app.pdai.address) // abi fix
        await pdai.setFoo(42)
        await pdai.setBar(43)

        expect(await pTokenDelegator.implementation()).to.equal(newPdai.address)
        expect(await pdai.underlying()).to.equal(app.dai.address)
        expect(await pdai.isPToken()).to.equal(true)
        expect(await pdai.getFoo()).to.equal(42)
        expect(await pdai.getBar()).to.equal(43)
    })

    it("upgrade pEther", async () => {
        const NewPEther = await ethers.getContractFactory("PEtherDelegateV2Mock")
        let newPeth = await NewPEther.deploy()

        const pTokenDelegator = await ethers.getContractAt('PTokenDelegatorInterface', app.peth.address) // abi fix
        await pTokenDelegator._setImplementation(newPeth.address, true, [])

        const peth = await NewPEther.attach(app.peth.address) // abi fix
        await peth.setFoo(42)
        await peth.setBar(43)

        expect(await pTokenDelegator.implementation()).to.equal(newPeth.address)
        expect(await peth.isPToken()).to.equal(true)
        expect(await peth.getFoo()).to.equal(42)
        expect(await peth.getBar()).to.equal(43)
    })
})

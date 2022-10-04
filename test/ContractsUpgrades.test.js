const setupAll = require('./utils/setupAllMocked')
const {setComptrollerImpl} = require("./utils/setupContracts")
const {expect} = require("chai")
const {ethers} = require("hardhat")
const {expectRevert} = require("./utils/expectAddons")

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
        expect(await pdai.getFoo()).to.equal(42)
        expect(await pdai.getBar()).to.equal(43)
    })
})

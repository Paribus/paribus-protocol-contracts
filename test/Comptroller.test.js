const setupAll = require('./utils/setupAllMocked')
const {expectEvent} = require("./utils/expectAddons")
const {ethers} = require("hardhat")

let app

describe("PToken", () => {
    beforeEach(async () => {
        app = await setupAll()
    })

    it("change admin", async () => {
        const unitroller = await ethers.getContractAt('Unitroller', app.unitroller.address)
        await expectEvent(unitroller._setPendingAdmin(app.user1.address), 'NewPendingAdmin')
        await expectEvent(unitroller.connect(app.user1)._acceptAdmin(), 'NewAdmin')
    })
})

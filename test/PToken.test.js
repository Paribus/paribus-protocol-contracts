const setupAll = require('./utils/setupAllMocked')
const {expect} = require("chai")

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
})

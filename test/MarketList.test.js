const setupAll = require('./utils/setupAllMocked')
const {tokens} = require('./utils/testHelpers')
const {expect} = require("chai")

let app

describe("Market list", () => {
    beforeEach(async () => {
        app = await setupAll()
    })

    it("getAssetsIn", async () => {
        expect(await app.unitroller.connect(app.user1).getAssetsIn(app.user1.address)).to.be.empty

        // user 1 supply && enter markets
        await app.weth.connect(app.user1).deposit({value: tokens('1')})
        await app.weth.connect(app.user1).approve(app.pweth.address, tokens('1'))
        await app.pweth.connect(app.user1).mint(tokens('1'))
        await app.unitroller.connect(app.user1).enterMarkets([app.pweth.address])

        // user 1 enter market only
        await app.unitroller.connect(app.user1).enterMarkets([app.pdai.address])

        expect(await app.unitroller.connect(app.user1).getAssetsIn(app.user1.address)).to.have.members([app.pweth.address, app.pdai.address])

        // user 1 exit market
        await app.unitroller.connect(app.user1).exitMarket(app.pdai.address)

        expect(await app.unitroller.connect(app.user1).getAssetsIn(app.user1.address)).to.have.members([app.pweth.address])
    })

    it("getAllMarkets", async () => {
        expect(await app.unitroller.getAllMarkets()).to.have.members(
            [app.pdai.address, app.pwbtc.address, app.pusdc.address, app.peth.address, app.pweth.address, app.ppbx.address, app.psada.address])
    })
})

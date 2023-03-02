const setupAll = require('./utils/setupAllMocked')
const {expectEvent} = require("./utils/expectAddons")

let app

describe("PToken", () => {
    beforeEach(async () => {
        app = await setupAll()
    })

    it("change admin", async () => {
        await expectEvent(app.jrmStableCoin._setPendingAdmin(app.user1.address), 'NewPendingAdmin')
        await expectEvent(app.jrmStableCoin.connect(app.user1)._acceptAdmin(), 'NewAdmin')
    })
})

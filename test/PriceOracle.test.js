const {expect} = require("chai")
const {ethers} = require("hardhat")
const setupAll = require("./utils/setupAllMocked")
const {ZERO_ADDRESS} = require("./utils/testHelpers")

let app, ChainlinkAggregatorV3Mock, ChainlinkPriceOracle, Api3DapiServerMock, Api3PriceOracleMock

describe("Chainlink Price Oracle", () => {
    beforeEach(async () => {
        app = await setupAll()
        ChainlinkPriceOracle = await ethers.getContractFactory('ChainlinkPriceOracleMock')
        ChainlinkAggregatorV3Mock = await ethers.getContractFactory('ChainlinkAggregatorV3Mock')
    })

    it("getUnderlyingPrice", async () => {
        const btcFeed = await ChainlinkAggregatorV3Mock.deploy('3879944000000', 8)
        const ethFeed = await ChainlinkAggregatorV3Mock.deploy('269974656342000', 11)
        const priceOracle = await ChainlinkPriceOracle.deploy(btcFeed.address, ethFeed.address, app.wbtc.address, app.weth.address, app.usdc.address, '1000000000000000000', app.peth.address)

        expect((await priceOracle.getUnderlyingPrice(app.pwbtc.address)).toString()).to.equal('387994400000000000000000000000000')
        expect((await priceOracle.getUnderlyingPrice(app.peth.address)).toString()).to.equal('2699746563420000000000')
        expect((await priceOracle.getUnderlyingPrice(app.pweth.address)).toString()).to.equal('2699746563420000000000')
        expect((await priceOracle.getUnderlyingPrice(app.pusdc.address)).toString()).to.equal('1000000000000000000000000000000')
    })

    it("getPriceOfUnderlying", async () => {
        const btcFeed = await ChainlinkAggregatorV3Mock.deploy('3879944000000', 8)
        const ethFeed = await ChainlinkAggregatorV3Mock.deploy('269974656342000', 11)
        const priceOracle = await ChainlinkPriceOracle.deploy(btcFeed.address, ethFeed.address, app.wbtc.address, app.weth.address, app.usdc.address, '1000000000000000000', app.peth.address)

        expect((await priceOracle.getPriceOfUnderlying(app.wbtc.address, 18)).toString()).to.equal('38799440000000000000000')
        expect((await priceOracle.getPriceOfUnderlying(ZERO_ADDRESS, 18)).toString()).to.equal('2699746563420000000000')
        expect((await priceOracle.getPriceOfUnderlying(app.weth.address, 18)).toString()).to.equal('2699746563420000000000')
        expect((await priceOracle.getPriceOfUnderlying(app.usdc.address, 18)).toString()).to.equal('1000000000000000000')
    })

    it("getUnderlyingPrice when pEtherAddress == 0", async () => {
        const btcFeed = await ChainlinkAggregatorV3Mock.deploy('4279944000000', 8)
        const priceOracle = await ChainlinkPriceOracle.deploy(btcFeed.address, ZERO_ADDRESS, app.wbtc.address, ZERO_ADDRESS, ZERO_ADDRESS, '0', ZERO_ADDRESS)

        expect((await priceOracle.getUnderlyingPrice(app.pwbtc.address)).toString()).to.equal('427994400000000000000000000000000')
        expect((await priceOracle.getPriceOfUnderlying(app.wbtc.address, 18)).toString()).to.equal('42799440000000000000000')
    })
})

describe("Api3 Price Oracle", () => {
    beforeEach(async () => {
        app = await setupAll()
        Api3DapiServerMock = await ethers.getContractFactory('Api3DapiServerMock')
        Api3PriceOracleMock = await ethers.getContractFactory('Api3PriceOracleMock')
    })

    it("getUnderlyingPrice", async () => {
        const api3DapiServerMock = await Api3DapiServerMock.deploy('1088695160000000000', '42')
        const priceOracle = await Api3PriceOracleMock.deploy(api3DapiServerMock.address, app.wbtc.address)

        expect((await priceOracle.getUnderlyingPrice(app.pwbtc.address)).toString()).to.equal('10886951600000000000000000000')
    })
})

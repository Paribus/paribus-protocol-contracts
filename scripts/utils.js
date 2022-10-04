const {setupToken, setupPToken, setupPEther, setupUpgradeablePToken} = require('../test/utils/setupContracts')
const {tokens, fromWei, fromTokens, toTokens} = require('../test/utils/testHelpers')
const {ethers} = require('hardhat')

async function deployBasicTokens() {
    [owner] = await ethers.getSigners()

    let dai = await setupToken('Dai', 18, '0', '0', [(await ethers.provider.getNetwork()).chainId])
    console.log("dai: ", dai.address)

    let wbtc = await setupToken('WBTC', 8, '0', '0')
    console.log("wbtc: ", wbtc.address)

    let weth = await setupToken('WETH9', 18, '0', '0')
    console.log("weth: ", weth.address)

    let usdc = await setupToken('FiatTokenV2', 6, '0', '0', [], async (token) => {
        await token.initialize('USDC', 'USDC', 'USD', 6, owner.address, owner.address, owner.address, owner.address)
        await token.configureMinter(owner.address, tokens('99999999999'))
    })
    console.log("usdc: ", usdc.address)

    let pbx = await deployPBXMock()

    return {dai, wbtc, usdc, weth, pbx}
}

async function deployPBXMock() {
    [owner] = await ethers.getSigners()
    let pbx = await setupToken('PBXTokenMock', 18, '0', '0', ['0'])
    console.log("pbx: ", pbx.address, " // PBXTokenMock")
    return pbx
}

async function deploySynthetics() {
    let [owner,] = await ethers.getSigners()
    const Synth = await ethers.getContractFactory("SynthMock")
    const MultiColSynth = await ethers.getContractFactory("MultiCollateralSynthMock")
    // setupToken ?

    let sada = await Synth.deploy("SynthsADA", "sADA", owner.address)
    console.log("sada: ", sada.address)

    let slink = await Synth.deploy("SynthsLINK", "sLINK", owner.address)
    console.log("slink: ", slink.address)

    let sdot = await Synth.deploy("SynthsDOT", "sDOT", owner.address)
    console.log("sdot: ", sdot.address)

    let seth = await MultiColSynth.deploy("SynthsETH", "sETH", owner.address)
    console.log("seth: ", seth.address)

    let sbtc = await MultiColSynth.deploy("SynthsBTC", "sBTC", owner.address)
    console.log("sbtc: ", sbtc.address)

    return {sada, slink, sdot, seth, sbtc}
}

async function deployComptroller() {
    let [owner] = await ethers.getSigners()

    const Unitroller = await ethers.getContractFactory("Unitroller")
    let unitroller = await Unitroller.deploy()
    await unitroller.deployed()
    console.log("unitroller: ", unitroller.address)

    const Comptroller = await ethers.getContractFactory("Comptroller")
    let comptroller = await Comptroller.deploy()
    await comptroller.deployed()
    console.log("comptroller: ", comptroller.address)

    await setComptrollerImpl(unitroller.address, comptroller.address)

    // attach unitroller contract to comptroller abi
    return [comptroller.attach(unitroller.address), comptroller]
}

async function setComptrollerImpl(unitrollerAddress, newComptrollerAddress) {
    const Unitroller = await ethers.getContractFactory("Unitroller")
    let unitroller = await Unitroller.attach(unitrollerAddress)
    const Comptroller = await ethers.getContractFactory("Comptroller")
    let comptroller = await Comptroller.attach(newComptrollerAddress)

    await unitroller._setPendingImplementation(comptroller.address)
    await comptroller._become(unitroller.address)
}

async function deployPlatformContracts(priceOracleMock=false) {
    const [owner] = await ethers.getSigners()

    let oracle
    if (priceOracleMock) {
        const PriceOracle = await ethers.getContractFactory("SimplePriceOracle")
        oracle = await PriceOracle.deploy()
        await oracle.deployed()
        console.log("oracle: ", oracle.address, " // SimplePriceOracle")
    } else {
        oracle = null
    }

    const [unitroller, comptroller] = await deployComptroller()

    const JumpRateModelV2 = await ethers.getContractFactory("JumpRateModelV2")
    let jrmStableCoin = await JumpRateModelV2.deploy('0', '39222804184156400', '3272914755156920000', '800000000000000000', owner.address)
    await jrmStableCoin.deployed()
    console.log("jrmStableCoin: ", jrmStableCoin.address)

    let jrmEth = await JumpRateModelV2.deploy('0', '95322621997923200', '222330528872230000', '800000000000000000', owner.address)
    await jrmEth.deployed()
    console.log("jrmEth: ", jrmEth.address)

    let jrmWbtc = await JumpRateModelV2.deploy('0', '262458573636948000', '370843987858870000', '800000000000000000', owner.address)
    await jrmWbtc.deployed()
    console.log("jrmWbtc: ", jrmWbtc.address)

    let jrmPbx = await JumpRateModelV2.deploy('0', '182367147429835000', '3675373581049680000', '800000000000000000', owner.address)
    await jrmPbx.deployed()
    console.log("jrmPbx: ", jrmPbx.address)

    return {oracle, unitroller, comptroller, jrmStableCoin, jrmWbtc, jrmPbx, jrmEth}
}

async function deployPTokens(tokensContracts, platformContracts) {
    let pdai = await setupPToken('pToken DAI', 'pDAI', 8, '1000000000000000000', tokensContracts.dai, platformContracts.unitroller, platformContracts.jrmStableCoin)
    console.log("pdai: ", pdai.address)

    let pwbtc = await setupPToken('pToken WBTC', 'pWBTC', 8, '1000000000000000000', tokensContracts.wbtc, platformContracts.unitroller, platformContracts.jrmWbtc)
    console.log("pwbtc: ", pwbtc.address)

    let pusdc = await setupPToken('pToken USDC', 'pUSDC', 8, '10000000000000000', tokensContracts.usdc, platformContracts.unitroller, platformContracts.jrmStableCoin)
    console.log("pusdc: ", pusdc.address)

    let ppbx = await setupPToken('pToken PBX', 'pPBX', 8, '10000000000000000000000000000', tokensContracts.pbx, platformContracts.unitroller, platformContracts.jrmPbx)
    console.log("ppbx: ", ppbx.address)

    let pweth = await setupPToken('pToken WETH', 'pWETH', 8, '1000000000000000000', tokensContracts.weth, platformContracts.unitroller, platformContracts.jrmEth)
    console.log("pweth: ", pweth.address)

    return {pdai, pwbtc, pusdc, ppbx, pweth}
}

async function deployPTokensUpgradeable(tokensContracts, platformContracts) {
    let pdai = await setupUpgradeablePToken('pToken DAI', 'pDAI', 8, '1000000000000000000', tokensContracts.dai, platformContracts.unitroller, platformContracts.jrmStableCoin)
    console.log("pdai: ", pdai.address)

    let pwbtc = await setupUpgradeablePToken('pToken WBTC', 'pWBTC', 8, '1000000000000000000', tokensContracts.wbtc, platformContracts.unitroller, platformContracts.jrmWbtc)
    console.log("pwbtc: ", pwbtc.address)

    let pusdc = await setupUpgradeablePToken('pToken USDC', 'pUSDC', 8, '10000000000000000', tokensContracts.usdc, platformContracts.unitroller, platformContracts.jrmStableCoin)
    console.log("pusdc: ", pusdc.address)

    let ppbx = await setupUpgradeablePToken('pToken PBX', 'pPBX', 8, '10000000000000000000000000000', tokensContracts.pbx, platformContracts.unitroller, platformContracts.jrmPbx)
    console.log("ppbx: ", ppbx.address)

    let pweth = await setupUpgradeablePToken('pToken WETH', 'pWETH', 8, '1000000000000000000', tokensContracts.weth, platformContracts.unitroller, platformContracts.jrmEth)
    console.log("pweth: ", pweth.address)

    return {pdai, pwbtc, pusdc, ppbx, pweth}
}

async function deployPSynthetics(synthTokens, platformContracts) {
    // TODO jrmWbtc ??
    let psada = await setupPToken('pToken sADA', 'psADA', 8, '200000000000000000000000000', synthTokens.sada, platformContracts.unitroller, platformContracts.jrmWbtc)
    console.log("psDAI: ", psada.address)

    let pslink = await setupPToken('pToken sLINK', 'psLINK', 8, '200000000000000000000000000', synthTokens.slink, platformContracts.unitroller, platformContracts.jrmWbtc)
    console.log("psDAI: ", psada.address)

    let psdot = await setupPToken('pToken sDOT', 'psDOT', 8, '200000000000000000000000000', synthTokens.sdot, platformContracts.unitroller, platformContracts.jrmWbtc)
    console.log("psDAI: ", psada.address)

    let pseth = await setupPToken('pToken sETH', 'psETH', 8, '200000000000000000000000000', synthTokens.seth, platformContracts.unitroller, platformContracts.jrmWbtc)
    console.log("psETH: ", pseth.address)

    let psbtc = await setupPToken('pToken sBTC', 'psBTC', 8, '200000000000000000000000000', synthTokens.sbtc, platformContracts.unitroller, platformContracts.jrmWbtc)
    console.log("psBTC: ", psbtc.address)

    return {psada, pslink, psdot, pseth, psbtc}
}

const attachBasicTokens = async function (tokensAddresses, pbxAddress=null) {
    const Dai = await ethers.getContractFactory("Dai")
    const WBTC = await ethers.getContractFactory("WBTC")
    const FiatTokenV2 = await ethers.getContractFactory("FiatTokenV2")
    const WETH9 = await ethers.getContractFactory("WETH9")
    const PbxToken = await ethers.getContractFactory("PBXToken")

    return {
        dai: await Dai.attach(tokensAddresses.dai),
        wbtc: await WBTC.attach(tokensAddresses.wbtc),
        usdc: await FiatTokenV2.attach(tokensAddresses.usdc),
        weth: await WETH9.attach(tokensAddresses.weth),
        pbx: pbxAddress ? await PbxToken.attach(pbxAddress) : await PbxToken.attach(tokensAddresses.pbx)
    }
}

const attachPlatformContracts = async function (platformContractsAddresses, priceOracleMock=false, attachMaximillion=true) {
    const SimplePriceOracle = await ethers.getContractFactory("SimplePriceOracle") // simple mock
    const Comptroller = await ethers.getContractFactory("Comptroller")
    const JumpRateModelV2 = await ethers.getContractFactory("JumpRateModelV2")
    const Maximillion = await ethers.getContractFactory("Maximillion")

    return {
        maximillion: attachMaximillion ? await Maximillion.attach(platformContractsAddresses.maximillion) : null,
        oracle: priceOracleMock? await SimplePriceOracle.attach(platformContractsAddresses.oracle) : await ethers.getContractAt("PriceOracleInterface", platformContractsAddresses.oracle),
        comptroller: await Comptroller.attach(platformContractsAddresses.comptroller),
        unitroller: await Comptroller.attach(platformContractsAddresses.unitroller), // unitroller contract atttached to comptroller abi
        jrmStableCoin: await JumpRateModelV2.attach(platformContractsAddresses.jrmStableCoin),
        jrmWbtc: await JumpRateModelV2.attach(platformContractsAddresses.jrmWbtc),
        jrmPbx: await JumpRateModelV2.attach(platformContractsAddresses.jrmPbx),
        jrmEth: await JumpRateModelV2.attach(platformContractsAddresses.jrmEth)
    }
}

async function attachComptrollerAdminChangeMock(compAddress) {
    const Comptroller = await ethers.getContractFactory("ComptrollerAdminChangeMock")
    return Comptroller.attach(compAddress)
}

const attachPTokens = async function (pTokensAddresses) {
    const PErc20 = await ethers.getContractFactory("PErc20")

    return {
        pdai: await PErc20.attach(pTokensAddresses.pdai),
        pwbtc: await PErc20.attach(pTokensAddresses.pwbtc),
        pusdc: await PErc20.attach(pTokensAddresses.pusdc),
        ppbx: await PErc20.attach(pTokensAddresses.ppbx),
        pweth: await PErc20.attach(pTokensAddresses.pweth),
    }
}

async function deployPEther(platformContracts) {
    let peth = await setupPEther('pEther', 'pETH', 8, '100000000000000000000000000', platformContracts.unitroller, platformContracts.jrmEth)
    console.log("peth: ", peth.address)

    return peth
}

const attachPEther = async function(addresses) {
    const PEther = await ethers.getContractFactory("PEther")
    return PEther.attach(addresses.peth)
}

const deployMaximillion = async function (pEther) {
    const Maximillion = await ethers.getContractFactory("Maximillion")
    const maximillion = await Maximillion.deploy(pEther.address)
    console.log("maximillion: ", maximillion.address)
    return maximillion
}

async function deployRinkebyPriceOracle() {
    const ChainlinkPriceOracle = await ethers.getContractFactory('RinkebyPriceOracle')
    const oracle = await ChainlinkPriceOracle.deploy()
    console.log("oracle: ", oracle.address, " // RinkebyPriceOracle")
    return oracle
}

async function deploySimplePriceOracle() {
    const SimplePriceOracle = await ethers.getContractFactory('SimplePriceOracle')
    const oracle = await SimplePriceOracle.deploy()
    console.log("oracle: ", oracle.address, " // simple")
    return oracle
}

async function attachPriceOracle(oracleAddress) {
    return ethers.getContractAt("PriceOracleInterface", oracleAddress)
}

async function attachSimplePriceOracle(oracleAddress) {
    return ethers.getContractAt("SimplePriceOracle", oracleAddress)
}

async function deployLiquidatorRinkeby() {
    const Liquidator = await ethers.getContractFactory('Liquidator')
    const liquidator = await Liquidator.deploy('0xA55125A90d75a95EC00130E8E8C197dB5641Eb19', '0xE592427A0AEce92De3Edee1F18E0157C05861564')
    console.log("liquidator: ", liquidator.address)
    return liquidator
}

async function attachLiquidator(liquidatorAddress) {
    const Liquidator = await ethers.getContractFactory("Liquidator")
    return Liquidator.attach(liquidatorAddress)
}

async function loadTestPrices(oracle, pTokens, pEther=null) {
    // 10 ** (36 - underlying_asset_decimals) == 1 USD
    console.log('Setting test prices...')
    await oracle.setUnderlyingPrice(pTokens.pweth.address, '1000000000000000000') // 1e18
    await oracle.setUnderlyingPrice(pTokens.pwbtc.address, '10000000000000000000000000000')
    await oracle.setUnderlyingPrice(pTokens.pusdc.address, '1000000000000000000000000000000')
    await oracle.setUnderlyingPrice(pTokens.ppbx.address, '1000000000000000000')
    await oracle.setUnderlyingPrice(pTokens.pdai.address, '1000000000000000000')
    if (pEther) await oracle.setUnderlyingPrice(pEther.address, '1000000000000000000')
}

async function loadTestSettings(platform, basicTokens, pTokens) {
    console.log('Loading test settings...')
    await pTokens.pdai._setReserveFactor(tokens('0.1'))
    await pTokens.pwbtc._setReserveFactor(tokens('0.1'))
    await pTokens.pusdc._setReserveFactor(tokens('0.1'))
    await pTokens.ppbx._setReserveFactor(tokens('0.1'))
    await pTokens.pweth._setReserveFactor(tokens('0.1'))

    await platform.unitroller._setPBXToken(basicTokens.pbx.address)
    await platform.unitroller._setPriceOracle(platform.oracle.address)
    await platform.unitroller._setLiquidationIncentive(tokens('1.1'))
    await platform.unitroller._setCloseFactor(tokens('0.5'))

    await platform.unitroller._supportMarket(pTokens.pdai.address)
    await platform.unitroller._supportMarket(pTokens.pwbtc.address)
    await platform.unitroller._supportMarket(pTokens.pusdc.address)
    await platform.unitroller._supportMarket(pTokens.ppbx.address)
    await platform.unitroller._supportMarket(pTokens.pweth.address)

    // tokens(collateral_ratio), collateral_ratio <= 0.9
    await platform.unitroller._setCollateralFactor(pTokens.pwbtc.address, tokens('0.5'))
    await platform.unitroller._setCollateralFactor(pTokens.pusdc.address, tokens('0.5'))
    await platform.unitroller._setCollateralFactor(pTokens.ppbx.address, tokens('0.5'))
    await platform.unitroller._setCollateralFactor(pTokens.pweth.address, tokens('0.5'))
    await platform.unitroller._setCollateralFactor(pTokens.pdai.address, tokens('0.5'))

    console.log('Settings loaded')
}

async function loadPEtherTestSettings(peth, platformContracts) {
    console.log('Loading PEther settings...')
    await peth._setReserveFactor(tokens('0.1'))
    await platformContracts.unitroller._supportMarket(peth.address)
    await platformContracts.unitroller._setCollateralFactor(peth.address, tokens('0.5'))

    console.log('PEther settings loaded')
}

async function loadSynthSettings(pSynthTokens, platformContracts) {
    console.log('Loading synthetics settings...')
    await pSynthTokens.psada._setReserveFactor(tokens('0.1'))
    await pSynthTokens.pslink._setReserveFactor(tokens('0.1'))
    await pSynthTokens.psdot._setReserveFactor(tokens('0.1'))
    await pSynthTokens.pseth._setReserveFactor(tokens('0.1'))
    await pSynthTokens.psbtc._setReserveFactor(tokens('0.1'))

    await platformContracts.oracle.setUnderlyingPrice(pSynthTokens.psada.address, '1750000000000000000000')
    await platformContracts.oracle.setUnderlyingPrice(pSynthTokens.pslink.address, '1750000000000000000000')
    await platformContracts.oracle.setUnderlyingPrice(pSynthTokens.psdot.address, '1750000000000000000000')
    await platformContracts.oracle.setUnderlyingPrice(pSynthTokens.pseth.address, '1750000000000000000000')
    await platformContracts.oracle.setUnderlyingPrice(pSynthTokens.psbtc.address, '1750000000000000000000')

    await platformContracts.unitroller._supportMarket(pSynthTokens.psada.address)
    await platformContracts.unitroller._supportMarket(pSynthTokens.pslink.address)
    await platformContracts.unitroller._supportMarket(pSynthTokens.psdot.address)
    await platformContracts.unitroller._supportMarket(pSynthTokens.pseth.address)
    await platformContracts.unitroller._supportMarket(pSynthTokens.psbtc.address)

    // TODO _setPBXSpeeds ??

    await platformContracts.unitroller._setCollateralFactor(pSynthTokens.psada.address, tokens('0.65'))
    await platformContracts.unitroller._setCollateralFactor(pSynthTokens.pslink.address, tokens('0.65'))
    await platformContracts.unitroller._setCollateralFactor(pSynthTokens.psdot.address, tokens('0.65'))
    await platformContracts.unitroller._setCollateralFactor(pSynthTokens.pseth.address, tokens('0.65'))
    await platformContracts.unitroller._setCollateralFactor(pSynthTokens.psbtc.address, tokens('0.65'))
    console.log('Synthetics settings loaded')
}

function getTestAddresses() {
    if (process.env.NETWORK === "hardhat" || process.env.NETWORK === "" || process.env.NETWORK === undefined) {
        return {
        }

    } else if (process.env.NETWORK === "localhost") {
        return {
        }

    } else if (process.env.NETWORK === "ganache") {
        return {
        }

    } else if (process.env.NETWORK === "arbitrumTestnet") {
        return {
        }

    } else if (process.env.NETWORK === "rinkeby") {
        // return {
        //     dai:  '0x2Ec4c6fCdBF5F9beECeB1b51848fc2DB1f3a26af', // uniswap + aave
        //     wbtc:  '0x37022F97333df61A61595B7cf43b63205290f8Ee', // uniswap + aave
        //     weth:  '0x98a5F1520f7F7fb1e83Fe3398f9aBd151f8C65ed',
        //     usdc: '0x5B8B635c2665791cf62fe429cB149EaB42A3cEd8', // uniswap + aave
        //     pbx: '0x04A382E64E36D63Dc2bAA837aB5217620732c60A',
        //
        //     unitroller: '0x486e16c2C3E023Fc5faCb810637A58BC4169929b',
        //     comptroller: '0xdFA75ABe5afDe9a483260b22987c349128E55E08',
        //
        //     jrmStableCoin: '0x5Ad5Ca57270a551eF6d93DA4b51D5b6e94ec84fB', // JumpRateModelV2
        //     jrmEth: '0xE015070880A3B6C10E56372F880fa3948788f313', // JumpRateModelV2
        //     jrmWbtc: '0xE52D7f65b0B35983ce0f582eB5b70F0909D20aA0', // JumpRateModelV2
        //     jrmPbx: '0xB25B87b0652BC3A7e6597487c38E0F2Fc09FA6C5', // JumpRateModelV2
        //
        //     pdai: '0x5226f4d742e87Da8446a020314172f5C6b520008', // PErc20Delegator upgradeable
        //     pwbtc: '0xCdDb32690d479bAce939eD8319D94abB190dC5e2', // PErc20Delegator upgradeable
        //     ppbx: '0x0e22Bc9d3dbA30E67DC279F1201bE6540C85bB87', // PErc20Delegator upgradeable
        //     pweth: '0x000Ab22510d15400852b6548B122b62BD65A362B', // PErc20Delegator upgradeable
        //     pusdc: '0x63cC5a066508b396ddDC5592e301F46d279DB25C', // PErc20Delegator upgradeable
        //
        //     peth: '0x2a97aDE05f844802a6DB2a40f547096b464CcF18',
        //     maximillion: '0xF1f22B379d726402f71AeB26f28Daa233F541579',
        //
        //     oracle: '0x5C3936866d1F01850489a255c1e1FCf7C0040c9d', // RinkebyPriceOracle
        // }

        return {
            dai:  '0x2Ec4c6fCdBF5F9beECeB1b51848fc2DB1f3a26af', // uniswap + aave
            wbtc:  '0x37022F97333df61A61595B7cf43b63205290f8Ee', // uniswap + aave
            weth:  '0x98a5F1520f7F7fb1e83Fe3398f9aBd151f8C65ed',
            usdc: '0x5B8B635c2665791cf62fe429cB149EaB42A3cEd8', // uniswap + aave
            pbx: '0x04A382E64E36D63Dc2bAA837aB5217620732c60A',

            unitroller: '0x486e16c2C3E023Fc5faCb810637A58BC4169929b',
            comptroller: '0xdFA75ABe5afDe9a483260b22987c349128E55E08',

            jrmStableCoin: '0x5Ad5Ca57270a551eF6d93DA4b51D5b6e94ec84fB', // JumpRateModelV2
            jrmEth: '0xE015070880A3B6C10E56372F880fa3948788f313', // JumpRateModelV2
            jrmWbtc: '0xE52D7f65b0B35983ce0f582eB5b70F0909D20aA0', // JumpRateModelV2
            jrmPbx: '0xB25B87b0652BC3A7e6597487c38E0F2Fc09FA6C5', // JumpRateModelV2

            pdai: '0x5226f4d742e87Da8446a020314172f5C6b520008', // PErc20Delegator upgradeable
            pwbtc: '0xCdDb32690d479bAce939eD8319D94abB190dC5e2', // PErc20Delegator upgradeable
            ppbx: '0x0e22Bc9d3dbA30E67DC279F1201bE6540C85bB87', // PErc20Delegator upgradeable
            pweth: '0x000Ab22510d15400852b6548B122b62BD65A362B', // PErc20Delegator upgradeable
            pusdc: '0x63cC5a066508b396ddDC5592e301F46d279DB25C', // PErc20Delegator upgradeable

            peth: '0x2a97aDE05f844802a6DB2a40f547096b464CcF18',
            maximillion: '0xF1f22B379d726402f71AeB26f28Daa233F541579',

            oracle: '0x5C3936866d1F01850489a255c1e1FCf7C0040c9d', // RinkebyPriceOracle
        }

    } else {
        throw Error("unknown network")
    }
}

class _PlatformTokenHelper {
    constructor(token, pToken, platform, user) {
        this.token = token
        this.pToken = pToken
        this.platform = platform
        this.user = user
        this._decimals = this.token.decimals()
    }

    async enableAsCollateral() {
        return this.platform.comptroller.connect(this.user).enterMarkets([this.pToken.address])
    }

    async decimals() {
        return this._decimals
    }

    async disableAsCollateral() {
        return this.platform.comptroller.connect(this.user).exitMarket(this.pToken.address)
    }

    async supply(amount) {
        return this.pToken.connect(this.user).mint(amount)
    }

    async supplyTokens(amount) {
        return this.supply(toTokens(amount.toString(), await this.decimals()).toString())
    }

    async enableSupply() {
        return this.token.connect(this.user).approve(this.pToken.address, tokens('999999999999'))
    }

    async withdraw(amount) {
        return this.pToken.connect(this.user).redeem(amount)
    }

    async withdrawMax() {
        const amount = await this.pToken.balanceOf(this.user.address)
        return this.withdraw(amount)
    }

    async enableRepay() {
        return this.enableSupply()
    }

    async enableLiquidate() {
        return this.enableSupply()
    }

    async borrow(amount) {
        return this.pToken.connect(this.user).borrow(amount)
    }

    async borrowTokens(amount) {
        return this.borrow(toTokens(amount.toString(), await this.decimals()).toString())
    }

    async repayMax() {
        return this.repay('115792089237316195423570985008687907853269984665640564039457584007913129639935')
    }

    async repay(amount) {
        return this.pToken.connect(this.user).repayBorrow(amount)
    }

    async repayTokens(amount) {
        return this.repay(toTokens(amount.toString(), await this.decimals()).toString())
    }

    async liquidateBorrow(borrowerUser, amount, pTokenCollateral) {
        return this.pToken.connect(this.user).liquidateBorrow(borrowerUser.address, amount, pTokenCollateral.address)
    }

    async liquidateBorrowTokens(borrowerUser, amount, pTokenCollateral) {
        return this.liquidateBorrow(borrowerUser, toTokens(amount.toString(), await this.decimals()).toString(), pTokenCollateral)
    }
}

class PlatformHelper {
    constructor(platformContracts, basicTokens, pTokens, user, userStr='', pEther=null) {
        this.user = user
        this.userStr = this._getUserStr(userStr)
        this.platform = platformContracts
        this.basicTokens = basicTokens
        this.pTokens = pTokens
        this._tokensHelpers = {
            dai: new _PlatformTokenHelper(basicTokens.dai, pTokens.pdai, platformContracts, user),
            wbtc: new _PlatformTokenHelper(basicTokens.wbtc, pTokens.pwbtc, platformContracts, user),
            usdc: new _PlatformTokenHelper(basicTokens.usdc, pTokens.pusdc, platformContracts, user),
            pbx: new _PlatformTokenHelper(basicTokens.pbx, pTokens.ppbx, platformContracts, user),

            // sAda: new _PlatformTokenHelper(basicTokens.sada, pTokens.psada, platformContracts, user),
            // sLink: new _PlatformTokenHelper(basicTokens.slink, pTokens.pslink, platformContracts, user),
            // sDot: new _PlatformTokenHelper(basicTokens.sdot, pTokens.psdot, platformContracts, user),
            // sEth: new _PlatformTokenHelper(basicTokens.seth, pTokens.pseth, platformContracts, user),
            // sBtc: new _PlatformTokenHelper(basicTokens.sbtc, pTokens.psbtc, platformContracts, user),
        }

        // if (pEther) this._tokensHelpers.eth = new _PlatformTokenHelper(basicTokens.pbx, pTokens.ppbx, platformContracts, user)
    }

    _getUserStr(userStr) {
        if (userStr !== '')
            return userStr

        try {
            return this.user.address.toString().substr(-4)
        } catch (e) {
            return "User"
        }
    }

    async allEnableSupply() {
        const tokens = this.tokens()
        for (const [_, token] of Object.entries(tokens)) {
            await token.enableSupply()
        }
    }

    async allEnableAsCollateral() {
        const tokens = this.tokens()
        for (const [_, token] of Object.entries(tokens)) {
            await token.enableAsCollateral()
        }
    }

    tokens() {
        return this._tokensHelpers
    }

    async printInfo() {
        const liquidityDec = 18
        const r = await this.platform.comptroller.getAccountLiquidity(this.user.address)
        const r0 = r[0]
        const r1 = r[1]
        const r2 = r[2]
        console.log(`${this.userStr} liquidity: \$${fromTokens(r0.toString(), liquidityDec)}, \$${fromTokens(r1.toString(), liquidityDec)}, \$${fromTokens(r2.toString(), liquidityDec)}`)
    }

    async printBalances(tokens) {
        for (let token of tokens) {
            let b = await token.balanceOf(this.user.address)
            let dec = await token.decimals()
            console.log(this.userStr, await token.name(), ":", fromTokens(b.toString(), dec.toString()))
        }
    }
}

module.exports = {
    deployPTokensUpgradeable,
    loadTestPrices,
    deployMaximillion,
    deployPBXMock,
    attachComptrollerAdminChangeMock,
    attachPriceOracle,
    attachSimplePriceOracle,
    deploySimplePriceOracle,
    setComptrollerImpl,
    deployLiquidatorRinkeby,
    deployRinkebyPriceOracle,
    attachLiquidator,
    attachPEther,
    deployBasicTokens,
    deployPlatformContracts,
    loadTestSettings,
    attachBasicTokens,
    attachPlatformContracts,
    attachPTokens,
    PlatformHelper,
    deployPTokens,
    deployPEther,
    getTestAddresses,
    deployPSynthetics,
    deploySynthetics,
    loadSynthSettings,
    loadPEtherTestSettings
}

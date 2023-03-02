const {tokens} = require('./testHelpers')
const {create, all, bignumber} = require('mathjs')
const mathjs = create(all, {})
const {ethers} = require('hardhat')
const {expectEvent, expectEventInLogs} = require("./expectAddons")

const setupToken = async function (name, decimals, adminSupply, userSupply, deployParams = [], callAfterDeploy = async (_) => { }) {
    const [owner, user1, user2, user3, user4] = await ethers.getSigners()
    adminSupply = mathjs.format(mathjs.multiply(adminSupply, 10 ** decimals), {notation: 'fixed'})
    userSupply = mathjs.format(mathjs.multiply(userSupply, 10 ** decimals), {notation: 'fixed'})

    const Token = await ethers.getContractFactory(name)
    let token = await Token.deploy(...deployParams)
    await callAfterDeploy(token)

    if (bignumber(adminSupply).gt(0)) {
        await token.mint(owner.address, adminSupply)
    }

    if (bignumber(userSupply).gt(0)) {
        await Promise.all([
            token.mint(user1.address, userSupply),
            token.mint(user2.address, userSupply),
            token.mint(user3.address, userSupply),
            token.mint(user4.address, userSupply)
        ])
    }

    return token
}

const setupAllTokens = async function () {
    const [owner] = await ethers.getSigners()

    const [dai, wbtc, usdc, weth, pbx, sada] = await Promise.all([
            setupToken('Dai', 18, '0', '0', [(await ethers.provider.getNetwork()).chainId]),
            setupToken('WBTC', 8, '0', '0', []),
            setupToken('FiatTokenV2', 6, '0', '0', [], async (token) => {
                await token.initialize('USDC', 'USDC', 'USD', 6, owner.address, owner.address, owner.address, owner.address)
                await token.configureMinter(owner.address, tokens('99999999999'))
            }),
            setupToken('WETH9', 18, '0', '0'),
            setupToken('PBXTokenMock', 18, '0', '0', ['0']),
            setupToken('SynthMock', 18, '0', '0', ["SynthsADA", "sADA", owner.address])
        ]
    )

    return {dai, wbtc, usdc, weth, pbx, sada}
}

const setupPToken = async function (name, symbol, decimals, exchangeRate, underlyingAsset, unitroller, interestRateModel) {
    const [owner] = await ethers.getSigners()
    const PToken = await ethers.getContractFactory('PErc20Immutable')
    return PToken.deploy(underlyingAsset.address, unitroller.address, interestRateModel.address, exchangeRate, name, symbol, decimals, owner.address)
}

const setupUpgradeablePToken = async function (name, symbol, decimals, exchangeRate, underlyingAsset, unitroller, interestRateModel) {
    const [owner] = await ethers.getSigners()
    const [PErc20Delegate, PTokenDelegator] = await Promise.all([
        ethers.getContractFactory('PErc20Delegate'),
        ethers.getContractFactory('PErc20Delegator')
    ])

    const ptoken = await PErc20Delegate.deploy()
    const pTokenDelegator = await PTokenDelegator.deploy(underlyingAsset.address, unitroller.address, interestRateModel.address, exchangeRate, name, symbol, decimals, owner.address, ptoken.address, [])
    return ethers.getContractAt('PErc20Interface', pTokenDelegator.address)
}

const setupPEther = async function (name, symbol, decimals, exchangeRate, unitroller, interestRateModel) {
    const [owner] = await ethers.getSigners()
    const PEther = await ethers.getContractFactory("PEtherImmutable")
    return PEther.deploy(unitroller.address, interestRateModel.address, exchangeRate, name, symbol, decimals, owner.address)
}

const setupUpgradeablePEther = async function (name, symbol, decimals, exchangeRate, unitroller, interestRateModel) {
    const [owner] = await ethers.getSigners()
    const [PEtherDelegate, PEtherDelegator] = await Promise.all([
        ethers.getContractFactory('PEtherDelegate'),
        ethers.getContractFactory('PEtherDelegator')
    ])

    const ptoken = await PEtherDelegate.deploy()
    const pTokenDelegator = await PEtherDelegator.deploy(unitroller.address, interestRateModel.address, exchangeRate, name, symbol, decimals, owner.address, ptoken.address, [])
    return ethers.getContractAt('PEther', pTokenDelegator.address)
}

const setupAllPTokens = async function (tokensContracts, platformContracts) {
    const [pdai, pwbtc, pusdc, ppbx, pweth, peth, psada] = await Promise.all([
        setupUpgradeablePToken('pToken DAI', 'pDAI', 8, '200000000000000000000000000', tokensContracts.dai, platformContracts.unitroller, platformContracts.jrmStableCoin),
        setupUpgradeablePToken('pToken WBTC', 'pWBTC', 8, '20000000000000000', tokensContracts.wbtc, platformContracts.unitroller, platformContracts.jrmWbtc),
        setupUpgradeablePToken('pToken USDC', 'pUSDC', 8, '200000000000000', tokensContracts.usdc, platformContracts.unitroller, platformContracts.jrmStableCoin),
        setupUpgradeablePToken('pToken PBX', 'pPBX', 8, '200000000000000000000000000', tokensContracts.pbx, platformContracts.unitroller, platformContracts.jrmPbx),
        setupUpgradeablePToken('pToken WETH', 'pWETH', 8, '200000000000000000000000000', tokensContracts.weth, platformContracts.unitroller, platformContracts.jrmEth),
        setupUpgradeablePEther('pEther', 'pETH', 8, '200000000000000000000000000', platformContracts.unitroller, platformContracts.jrmEth),
        setupPToken('pToken sADA', 'psADA', 8, '200000000000000000000000000', tokensContracts.sada, platformContracts.unitroller, platformContracts.jrmPbx) // TODO jrm
    ])

    return {pdai, pwbtc, pusdc, ppbx, pweth, peth, psada}
}

const setComptrollerImpl = async function (unitrollerAddress, newComptrollerPart1, newComptrollerPart2) {
    const unitroller = await ethers.getContractAt("Unitroller", unitrollerAddress)
    await expectEvent(unitroller._setPendingImplementations(newComptrollerPart1.address, newComptrollerPart2.address), 'NewPendingImplementations')
    await Promise.all([
        expectEventInLogs(newComptrollerPart1._become(unitroller.address), 'Unitroller', 'NewImplementation'),
        expectEventInLogs(newComptrollerPart2._become(unitroller.address), 'Unitroller', 'NewImplementation'),
    ])
}

const setupPlatformContracts = async function () {
    const [owner] = await ethers.getSigners()

    const [SimplePriceOracle, Unitroller, ComptrollerPart1, ComptrollerPart2, JumpRateModelV2] = await Promise.all([
        ethers.getContractFactory("SimplePriceOracle"),
        ethers.getContractFactory("Unitroller"),
        ethers.getContractFactory("ComptrollerPart1"),
        ethers.getContractFactory("ComptrollerPart2"),
        ethers.getContractFactory("JumpRateModelV2")
    ])

    let [oracle, unitroller, comptrollerPart1, comptrollerPart2, jrmStableCoin, jrmEth, jrmWbtc, jrmPbx] = await Promise.all([
        SimplePriceOracle.deploy(),
        Unitroller.deploy(),
        ComptrollerPart1.deploy(),
        ComptrollerPart2.deploy(),

        JumpRateModelV2.deploy('0', '39222804184156400', '3272914755156920000', '800000000000000000', owner.address),
        JumpRateModelV2.deploy('0', '95322621997923200', '222330528872230000', '800000000000000000', owner.address),
        JumpRateModelV2.deploy('0', '262458573636948000', '370843987858870000', '800000000000000000', owner.address),
        JumpRateModelV2.deploy('0', '182367147429835000', '2557193424546420000', '800000000000000000', owner.address),
    ])

    await setComptrollerImpl(unitroller.address, comptrollerPart1, comptrollerPart2)

    unitroller = await ethers.getContractAt("ComptrollerInterface", unitroller.address) // abi fix
    return {oracle, unitroller, jrmStableCoin, jrmEth, jrmWbtc, jrmPbx, comptrollerPart1, comptrollerPart2}
}

const setupMaximillion = async function (pEtherAddress) {
    const Maximillion = await ethers.getContractFactory("Maximillion")
    return Maximillion.deploy(pEtherAddress)
}

const loadDefaultSettings = async function (platform, basicTokens, pTokens) {
    await Promise.all([
        platform.oracle.setUnderlyingPrice(pTokens.peth.address, '1750000000000000000000'),
        platform.oracle.setUnderlyingPrice(pTokens.pweth.address, '1750000000000000000000'),
        platform.oracle.setUnderlyingPrice(pTokens.pdai.address, '1000000000000000000'),
        platform.oracle.setUnderlyingPrice(pTokens.pusdc.address, '1000000000000000000000000000000'),
        platform.oracle.setUnderlyingPrice(pTokens.pwbtc.address, '550000000000000000000000000000000'),
        platform.oracle.setUnderlyingPrice(pTokens.ppbx.address, '3000000000000000000'),
        platform.oracle.setUnderlyingPrice(pTokens.psada.address, '1750000000000000000000'),

        pTokens.pdai._setReserveFactor(tokens('0.1')),
        pTokens.pwbtc._setReserveFactor(tokens('0.2')),
        pTokens.pusdc._setReserveFactor(tokens('0.1')),
        pTokens.ppbx._setReserveFactor(tokens('0.35')),
        pTokens.peth._setReserveFactor(tokens('0.2')),
        pTokens.pweth._setReserveFactor(tokens('0.2')),
        pTokens.psada._setReserveFactor(tokens('0.1')),
    ])

    await Promise.all([
        platform.unitroller._setPBXToken(basicTokens.pbx.address),
        platform.unitroller._setPriceOracle(platform.oracle.address),
        platform.unitroller._setLiquidationIncentive(tokens('1.1')),
        platform.unitroller._setCloseFactor(tokens('0.5')),
    ])

    await Promise.all([
        platform.unitroller._supportMarket(pTokens.pdai.address),
        platform.unitroller._supportMarket(pTokens.pwbtc.address),
        platform.unitroller._supportMarket(pTokens.pusdc.address),
        platform.unitroller._supportMarket(pTokens.peth.address),
        platform.unitroller._supportMarket(pTokens.pweth.address),
        platform.unitroller._supportMarket(pTokens.ppbx.address),
        platform.unitroller._supportMarket(pTokens.psada.address),

        platform.unitroller._setCollateralFactor(pTokens.pdai.address, tokens('0.85')),
        platform.unitroller._setCollateralFactor(pTokens.pwbtc.address, tokens('0.75')),
        platform.unitroller._setCollateralFactor(pTokens.pusdc.address, tokens('0.85')),
        platform.unitroller._setCollateralFactor(pTokens.peth.address, tokens('0.75')),
        platform.unitroller._setCollateralFactor(pTokens.pweth.address, tokens('0.75')),
        platform.unitroller._setCollateralFactor(pTokens.ppbx.address, tokens('0.00')), // TODO ??
        platform.unitroller._setCollateralFactor(pTokens.psada.address, tokens('0.75')),
    ])
}

module.exports = {
    setComptrollerImpl,
    setupToken,
    setupAllTokens,
    setupPToken,
    setupUpgradeablePToken,
    setupPEther,
    setupUpgradeablePEther,
    setupAllPTokens,
    setupPlatformContracts,
    loadDefaultSettings,
    setupMaximillion
}

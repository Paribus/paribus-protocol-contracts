const {setupPlatformContracts, setupMaximillion, setupAllTokens, setupAllPTokens, loadDefaultSettings} = require('../utils/setupContracts')
const {ethers} = require('hardhat')


const setupAll = async function () {
    let [owner, user1, user2, user3, user4] = await ethers.getSigners()

    const [tokensContracts, platformContracts] = await Promise.all([
        setupAllTokens(),
        setupPlatformContracts()
    ])

    const pTokens = await setupAllPTokens(tokensContracts, platformContracts)
    const maximillion = await setupMaximillion(pTokens.peth.address)

    await loadDefaultSettings(platformContracts, tokensContracts, pTokens)

    return {
        owner, user1, user2, user3, user4,
        dai: tokensContracts.dai,
        wbtc: tokensContracts.wbtc,
        weth: tokensContracts.weth,
        pbx: tokensContracts.pbx,
        usdc: tokensContracts.usdc,
        sada: tokensContracts.sada,
        pdai: pTokens.pdai,
        pwbtc: pTokens.pwbtc,
        peth: pTokens.peth,
        pweth: pTokens.pweth,
        ppbx: pTokens.ppbx,
        pusdc: pTokens.pusdc,
        psada: pTokens.psada,
        oracle: platformContracts.oracle,
        unitroller: platformContracts.unitroller,
        jrmStableCoin: platformContracts.jrmStableCoin,
        jrmWbtc: platformContracts.jrmWbtc,
        jrmEth: platformContracts.jrmEth,
        jrmPbx: platformContracts.jrmPbx,
        maximillion
    }
}

module.exports = setupAll

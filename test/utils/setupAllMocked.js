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
        ...tokensContracts,
        ...pTokens,
        ...platformContracts,
        maximillion,
    }
}

module.exports = setupAll

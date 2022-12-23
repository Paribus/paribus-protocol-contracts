const {tokens, fromTokens} = require('../test/utils/testHelpers')

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
    PlatformHelper,
}

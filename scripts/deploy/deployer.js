const {ethers} = require('hardhat')
const assert = require('assert')
const {tokens, REPAY_MAX, toTokens} = require("../../test/utils/testHelpers")

class DeployerRegtest {
    constructor(addresses = {}) {
        this.addresses = addresses
        this.contracts = {}
    }

    async deploy() {
        // for (let i = 0; i < 5; i++) {
            try {
                await this._deploy()
                // break
            } catch (e) {
                console.log(e)
                // console.log("\nRETRYING...\n")
            }
        // }
        console.log("\nDEPLOY END\n")
    }

    async _deploy() {
        await this._loadBasicTokens()
        await this._loadComptroller()
        await this._loadJumpRateModels()
        await this._loadPTokens()
        await this._loadPEther()
        await this._loadMaximillion()
        await this._loadPriceOracle()
        await this._loadSetttings()
        await this._loadPEtherSettings()
        // TODO top up comptroller PBX?
    }

    async _handleFailureEvents(tx) {
        for (let i = 0; i < tx.events.length; i++) {
            if (tx.events[i].event === "Failure" || tx.events[i].eventSignature === "Failure(uint256,uint256,uint256)")
                throw new Error("Failure event")
        }
    }

    async _handleTxIfNeeded(txPromise, txNameToLog) { // NFT TODO handle anyway?
        txNameToLog = this._prepareTxNameToLog(txNameToLog)
        if (this.addresses[txNameToLog]) return
        let txHash

        try {
            let tx = await txPromise()
            txHash = tx.hash
            tx = await tx.wait()
            assert(txHash === tx.transactionHash)
            await this._handleFailureEvents(tx)
            this._logSuccessfulTx(txNameToLog, txHash)
            return tx
        } catch (e) {
            let txHashErrStr = txHash ? ": " + txHash : ""
            console.log("Error:", txNameToLog + txHashErrStr + ":", e.toString())
            throw e
        }
    }

    _prepareTxNameToLog(txNameToLog) {
        return txNameToLog.replaceAll(".", "_").replaceAll("(", "_").replaceAll(")", "_").replaceAll(",", "_").replaceAll(' ', '')
    }

    _logSuccessfulTx(txNameToLog, txHash) {
        txNameToLog = this._prepareTxNameToLog(txNameToLog)
        console.log(txNameToLog + ": '" + txHash + "',")
        this.addresses[txNameToLog] = txHash
    }

    _logDeployedContract(name, comment) {
        assert(this.contracts[name])
        this.addresses[name] = this.contracts[name].address
        comment = comment ? " // " + comment : ""
        console.log(name + ": '" + this.addresses[name] + "'" + "," + comment)
    }

    // ----

    async _deployBasicToken(contractName, deployParams = []) {
        const Token = await ethers.getContractFactory(contractName)
        let token = await Token.deploy(...deployParams)
        return token
    }

    async _loadBasicTokens() {
        let [owner] = await ethers.getSigners()

        if (this.addresses.dai) this.contracts.dai = await ethers.getContractAt("Dai", this.addresses.dai)
        else {
            assert(!this._isUpgradablePTokenDeployed("pdai"))
            this.contracts.dai = await this._deployBasicToken('Dai', [(await ethers.provider.getNetwork()).chainId])
            this._logDeployedContract("dai")
        }

        if (this.addresses.wbtc) this.contracts.wbtc = await ethers.getContractAt("WBTC", this.addresses.wbtc)
        else {
            assert(!this._isUpgradablePTokenDeployed("pwbtc"))
            this.contracts.wbtc = await this._deployBasicToken('WBTC')
            this._logDeployedContract("wbtc")
        }

        if (this.addresses.pbx) this.contracts.pbx = await ethers.getContractAt("PBXTestTokenMintable", this.addresses.pbx)
        else {
            assert(!this._isUpgradablePTokenDeployed("ppbx"))
            this.contracts.pbx = await this._deployBasicToken('PBXTestTokenMintable', ['0'])
            this._logDeployedContract("pbx", "PBXTestTokenMintable")
        }

        if (this.addresses.weth) this.contracts.weth = await ethers.getContractAt("WETH9", this.addresses.weth)
        else {
            assert(!this._isUpgradablePTokenDeployed("pweth"))
            this.contracts.weth = await this._deployBasicToken('WETH9')
            this._logDeployedContract("weth")
        }

        if (this.addresses.usdc) this.contracts.usdc = await ethers.getContractAt("FiatTokenV2", this.addresses.usdc)
        else {
            assert(!this._isUpgradablePTokenDeployed("pusdc"))
            assert(!this.addresses["usdc_initialize"] && !this.addresses["usdc_configureMinter"])
            this.contracts.usdc = await this._deployBasicToken('FiatTokenV2')
            this._logDeployedContract("usdc")
        }
        await this._handleTxIfNeeded(() => this.contracts.usdc.initialize('USDC', 'USDC', 'USD', 6, owner.address, owner.address, owner.address, owner.address), "usdc.initialize")
        await this._handleTxIfNeeded(() => this.contracts.usdc.configureMinter(owner.address, tokens('999999999999999')), "usdc.configureMinter")
    }

    async _setComptrollerImpl() {
        if (this._isComptrollerImplSet()) return

        console.log("Setting comptroller implementation...")
        assert(this.contracts.unitroller && this.contracts.comptroller_part1 && this.contracts.comptroller_part2)
        assert(this.addresses.unitroller && this.addresses.comptroller_part1 && this.addresses.comptroller_part2)

        await this._handleTxIfNeeded(() => this.contracts.unitroller._setPendingImplementations(this.addresses.comptroller_part1, this.addresses.comptroller_part2), "unitroller._setPendingImplementations")
        await this._handleTxIfNeeded(() => this.contracts.comptroller_part1._become(this.addresses.unitroller), "comptroller_part1._become")
        await this._handleTxIfNeeded(() => this.contracts.comptroller_part2._become(this.addresses.unitroller), "comptroller_part2._become")
    }

    _isComptrollerImplSet() {
        if (this.addresses.unitroller__setPendingImplementations && this.addresses.comptroller_part1__become && this.addresses.comptroller_part2__become) {
            assert(this.addresses.comptroller_part1 && this.addresses.comptroller_part2 && this.addresses.unitroller)
            return true
        } else {
            assert(!this.addresses.unitroller__setPendingImplementations && !this.addresses.comptroller_part1__become && !this.addresses.comptroller_part2__become)
            return false
        }
    }

    async _loadComptroller() { // upgradeable, part1 + part2
        if (!this.addresses.unitroller) {
            assert(!this._isComptrollerImplSet() && this._noPTokenDeployed())
            const Unitroller = await ethers.getContractFactory("Unitroller")
            this.contracts.unitroller = await Unitroller.deploy()
            await this.contracts.unitroller.deployed()
            this._logDeployedContract("unitroller")
        } else {
            this.contracts.unitroller = await ethers.getContractAt("Unitroller", this.addresses.unitroller)
        }

        if (!this.addresses.comptroller_part1) {
            assert(!this._isComptrollerImplSet())
            const ComptrollerPart1 = await ethers.getContractFactory("ComptrollerPart1")
            this.contracts.comptroller_part1 = await ComptrollerPart1.deploy()
            await this.contracts.comptroller_part1.deployed()
            this._logDeployedContract("comptroller_part1")
        } else {
            assert(this.addresses.unitroller)
            this.contracts.comptroller_part1 = await ethers.getContractAt("ComptrollerPart1", this.addresses.comptroller_part1)
        }

        if (!this.addresses.comptroller_part2) {
            assert(!this._isComptrollerImplSet())
            const ComptrollerPart2 = await ethers.getContractFactory("ComptrollerPart2")
            this.contracts.comptroller_part2 = await ComptrollerPart2.deploy()
            await this.contracts.comptroller_part2.deployed()
            this._logDeployedContract("comptroller_part2")
        } else {
            assert(this.addresses.unitroller)
            this.contracts.comptroller_part2 = await ethers.getContractAt("ComptrollerPart2", this.addresses.comptroller_part2)
        }

        await this._setComptrollerImpl()
        this.contracts.unitroller = await ethers.getContractAt("ComptrollerInterface", this.addresses.unitroller) // abi fix; attach unitroller contract to comptroller abi
    }

    async _loadJumpRateModels() {
        let [owner] = await ethers.getSigners()
        const JumpRateModelV2 = await ethers.getContractFactory("JumpRateModelV2")

        if (!this.addresses.jrmStableCoin) {
            this.contracts.jrmStableCoin = await JumpRateModelV2.deploy('0', '39222804184156400', '3272914755156920000', '800000000000000000', owner.address)
            this._logDeployedContract("jrmStableCoin", "JumpRateModelV2")
        } else {
            this.contracts.jrmStableCoin = await JumpRateModelV2.attach(this.addresses.jrmStableCoin)
        }

        if (!this.addresses.jrmEth) {
            this.contracts.jrmEth = await JumpRateModelV2.deploy('0', '95322621997923200', '222330528872230000', '800000000000000000', owner.address)
            this._logDeployedContract("jrmEth", "JumpRateModelV2")
        } else {
            this.contracts.jrmEth = await JumpRateModelV2.attach(this.addresses.jrmEth)
        }

        if (!this.addresses.jrmWbtc) {
            this.contracts.jrmWbtc = await JumpRateModelV2.deploy('0', '262458573636948000', '370843987858870000', '800000000000000000', owner.address)
            this._logDeployedContract("jrmWbtc", "JumpRateModelV2")
        } else {
            this.contracts.jrmWbtc = await JumpRateModelV2.attach(this.addresses.jrmWbtc)
        }

        if (!this.addresses.jrmPbx) {
            this.contracts.jrmPbx = await JumpRateModelV2.deploy('0', '182367147429835000', '3675373581049680000', '800000000000000000', owner.address)
            this._logDeployedContract("jrmPbx", "JumpRateModelV2")
        } else {
            this.contracts.jrmPbx = await JumpRateModelV2.attach(this.addresses.jrmPbx)
        }
    }

    async _deployPErc20NonUpgradeable(name, symbol, decimals, exchangeRate, underlyingAsset, interestRateModel) {
        const [owner] = await ethers.getSigners()
        const keyName = symbol.toLowerCase()

        const PToken = await ethers.getContractFactory('PErc20Immutable')
        this.contracts[keyName] = await PToken.deploy(underlyingAsset, this.addresses.unitroller, interestRateModel, exchangeRate, name, symbol, decimals, owner.address)
        this._logDeployedContract(keyName, "PErc20Immutable non-upgradeable")
    }

    async _deployPErc20(name, symbol, decimals, exchangeRate, underlyingAsset, interestRateModel) { // upgradeable PErc20
        const [owner] = await ethers.getSigners()
        let setImplementation = false

        const delegateKeyName = symbol.toLowerCase() + "_delegate"
        const PErc20Delegate = await ethers.getContractFactory('PErc20Delegate')
        const delegatorKeyName = symbol.toLowerCase()
        const PErc20Delegator = await ethers.getContractFactory('PErc20Delegator')

        if (!this.addresses[delegateKeyName]) {
            this.contracts[delegateKeyName] = await PErc20Delegate.deploy()
            await this.contracts[delegateKeyName].deployed()
            this._logDeployedContract(delegateKeyName, "PErc20Delegate")
            if (this.addresses[delegatorKeyName])
                setImplementation = true
        } else {
            this.contracts[delegateKeyName] = await PErc20Delegate.attach(this.addresses[delegateKeyName])
        }

        if (!this.addresses[delegatorKeyName]) {
            assert(this.addresses[delegateKeyName] && this.addresses.unitroller)
            this.contracts[delegatorKeyName] = await PErc20Delegator.deploy(underlyingAsset, this.addresses.unitroller, interestRateModel, exchangeRate, name, symbol, decimals, owner.address, this.addresses[delegateKeyName], [])
            await this.contracts[delegatorKeyName].deployed()
            this._logDeployedContract(delegatorKeyName, "PErc20Delegator upgradeable")
        } else {
            this.contracts[delegatorKeyName] = await PErc20Delegator.attach(this.addresses[delegatorKeyName])
        }

        if (setImplementation)
            await this._handleTxIfNeeded(() => this.contracts[delegatorKeyName]._setImplementation(this.addresses[delegateKeyName], false, []), delegatorKeyName + "._setImplementation")

        this.contracts[delegatorKeyName] = await ethers.getContractAt("PErc20Interface", this.addresses[delegatorKeyName]) // abi fix
    }

    _noPTokenDeployed() {
        return !this._isUpgradablePTokenDeployed("peth") &&
            !this._isUpgradablePTokenDeployed("pdai") &&
            !this._isUpgradablePTokenDeployed("ppbx") &&
            !this._isUpgradablePTokenDeployed("pwbtc") &&
            !this._isUpgradablePTokenDeployed("pweth") &&
            !this._isUpgradablePTokenDeployed("pusdc")
    }

    _isUpgradablePTokenDeployed(name) {
        if (this.addresses[name] && this.addresses[name + "_delegate"]) return true
        assert(!this.addresses[name + "__setImplementation"])
        return false
    }

    _isNonUpgradablePTokenDeployed(name) {
        if (this.addresses[name]) return true;
        assert(!this.addresses["unitroller__supportMarket_" + name + "_"])
        assert(!this.addresses["unitroller__setCollateralFactor_" + name + "_"])
        assert(!this.addresses["unitroller__setNFTCollateralFactor_" + name + "_"])
        assert(!this.addresses["oracle_setUnderlyingPrice_" + name + "_"])
        assert(!this.addresses["oracle_setUnderlyingNFTPrice_" + name + "_"])
        assert(!this.addresses["_" + name + "_setReserveFactor"])
        return false;
    }

    async _loadPTokens() {
        assert(this.addresses.unitroller)
        const PErc20 = await ethers.getContractFactory("PErc20")

        if (!this._isUpgradablePTokenDeployed("pdai")) {
            assert(this.addresses.dai && this.addresses.jrmStableCoin)
            await this._deployPErc20('pToken DAI', 'pDAI', 8, '200000000000000000000000000', this.addresses.dai, this.addresses.jrmStableCoin)
        } else {
            this.contracts.pdai = await PErc20.attach(this.addresses.pdai)
        }

        if (!this._isUpgradablePTokenDeployed("pwbtc")) {
            assert(this.addresses.wbtc && this.addresses.jrmWbtc)
            await this._deployPErc20('pToken WBTC', 'pWBTC', 8, '20000000000000000', this.addresses.wbtc, this.addresses.jrmWbtc)
        } else {
            this.contracts.pwbtc = await PErc20.attach(this.addresses.pwbtc)
        }

        if (!this._isUpgradablePTokenDeployed("ppbx")) {
            assert(this.addresses.pbx && this.addresses.jrmPbx)
            await this._deployPErc20('pToken PBX', 'pPBX', 8, '200000000000000000000000000', this.addresses.pbx, this.addresses.jrmPbx)
        } else {
            this.contracts.ppbx = await PErc20.attach(this.addresses.ppbx)
        }

        if (!this._isUpgradablePTokenDeployed("pweth")) {
            assert(this.addresses.weth && this.addresses.jrmStableCoin)
            await this._deployPErc20('pToken WETH', 'pWETH', 8, '1000000000000000000', this.addresses.weth, this.addresses.jrmStableCoin)
        } else {
            this.contracts.pweth = await PErc20.attach(this.addresses.pweth)
        }

        if (!this._isUpgradablePTokenDeployed("pusdc")) {
            assert(this.addresses.usdc && this.addresses.jrmStableCoin)
            await this._deployPErc20('pToken USDC', 'pUSDC', 8, '10000000000000000', this.addresses.usdc, this.addresses.jrmStableCoin)
        } else {
            this.contracts.pusdc = await PErc20.attach(this.addresses.pusdc)
        }
    }

    async _loadPEther() { // non-upgradeable
        assert(this.addresses.unitroller)
        assert(this.addresses.jrmEth)
        const PEther = await ethers.getContractFactory("PEther")

        if (!this.addresses.peth) {
            assert(!this.addresses.maximillion)
            const [owner] = await ethers.getSigners()
            this.contracts.peth = await PEther.deploy(this.addresses.unitroller, this.addresses.jrmEth, '200000000000000000000000000', 'pEther', 'pETH', 8, owner.address)
            this._logDeployedContract("peth")
        } else {
            this.contracts.peth = await PEther.attach(this.addresses.peth)
        }
    }

    async _loadMaximillion() {
        assert(this.addresses.peth)
        const Maximillion = await ethers.getContractFactory("Maximillion")

        if (!this.addresses.maximillion) {
            this.contracts.maximillion = await Maximillion.deploy(this.addresses.peth)
            this._logDeployedContract("maximillion")
        } else {
            this.contracts.maximillion = await Maximillion.attach(this.addresses.maximillion)
        }
    }

    async _loadPriceOracle() { // mock
        const PriceOracle = await ethers.getContractFactory("SimplePriceOracle")

        if (!this.addresses.oracle) {
            this.contracts.oracle = await PriceOracle.deploy()
            this._logDeployedContract("oracle", "SimplePriceOracle")
        } else {
            this.contracts.oracle = await PriceOracle.attach(this.addresses.oracle)
        }
    }

    async _loadTestPrices() {
        assert(this.contracts.oracle)
        console.log('Setting test prices...')

        // 10 ** (36 - underlying_asset_decimals) == 1 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingPrice(this.addresses.pwbtc, '10000000000000000000000000000'), "oracle.setUnderlyingPrice(pwbtc)")
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingPrice(this.addresses.ppbx, '1000000000000000000'), "oracle.setUnderlyingPrice(ppbx)")
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingPrice(this.addresses.pdai, '1000000000000000000'), "oracle.setUnderlyingPrice(pdai)")
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingPrice(this.addresses.pusdc, '1000000000000000000000000000000'), "oracle.setUnderlyingPrice(pusdc)")
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingPrice(this.addresses.pweth, '1000000000000000000'), "oracle.setUnderlyingPrice(pweth)")
    }

    async _loadSetttings() {
        assert(this.contracts.unitroller)
        await this._loadTestPrices()

        console.log('Loading test settings...')

        // ptoken._setReserveFactor
        await this._handleTxIfNeeded(() => this.contracts.pdai._setReserveFactor(tokens('0.1')), "pdai._setReserveFactor")
        await this._handleTxIfNeeded(() => this.contracts.pwbtc._setReserveFactor(tokens('0.1')), "pwbtc._setReserveFactor")
        await this._handleTxIfNeeded(() => this.contracts.ppbx._setReserveFactor(tokens('0.1')), "ppbx._setReserveFactor")
        await this._handleTxIfNeeded(() => this.contracts.pusdc._setReserveFactor(tokens('0.1')), "pusdc._setReserveFactor")
        await this._handleTxIfNeeded(() => this.contracts.pweth._setReserveFactor(tokens('0.1')), "pweth._setReserveFactor")

        // unitroller
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setPBXToken(this.addresses.pbx), "unitroller._setPBXToken")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setPriceOracle(this.addresses.oracle), "unitroller._setPriceOracle")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setLiquidationIncentive(tokens('1.1')), "unitroller._setLiquidationIncentive")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setCloseFactor(tokens('0.5')), "unitroller._setCloseFactor")

        // unitroller._supportMarket
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportMarket(this.addresses.pdai), "unitroller._supportMarket(pdai)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportMarket(this.addresses.pwbtc), "unitroller._supportMarket(pwbtc)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportMarket(this.addresses.ppbx), "unitroller._supportMarket(ppbx)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportMarket(this.addresses.pusdc), "unitroller._supportMarket(pusdc)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportMarket(this.addresses.pweth), "unitroller._supportMarket(pweth)")

        // unitroller._setCollateralFactor
        // tokens(collateral_ratio), collateral_ratio <= 0.9
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setCollateralFactor(this.addresses.pdai, tokens('0.5')), "unitroller._setCollateralFactor(pdai)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setCollateralFactor(this.addresses.pwbtc, tokens('0.5')), "unitroller._setCollateralFactor(pwbtc)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setCollateralFactor(this.addresses.ppbx, tokens('0.5')), "unitroller._setCollateralFactor(ppbx)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setCollateralFactor(this.addresses.pusdc, tokens('0.5')), "unitroller._setCollateralFactor(pusdc)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setCollateralFactor(this.addresses.pweth, tokens('0.5')), "unitroller._setCollateralFactor(pweth)")
    }

    async _loadPEtherTestPrice() {
        assert(this.contracts.oracle)
        console.log('Setting PEther test prices...')

        // 10 ** (36 - underlying_asset_decimals) == 1 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingPrice(this.addresses.peth, '1000000000000000000'), "oracle.setUnderlyingPrice(peth)")
    }

    async _loadPEtherSettings() {
        assert(this.contracts.unitroller)
        assert(this.contracts.peth)
        assert(this.addresses.peth)
        await this._loadPEtherTestPrice()

        console.log('Loading PEther test settings...')

        await this._handleTxIfNeeded(() => this.contracts.peth._setReserveFactor(tokens('0.2')), "peth._setReserveFactor")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportMarket(this.addresses.peth), "unitroller._supportMarket(peth)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setCollateralFactor(this.addresses.peth, tokens('0.82')), "unitroller._setCollateralFactor(peth)")
    }
}


class DeployerRinkeby extends DeployerRegtest {
    constructor(addresses = {}) {
        super(addresses)
    }

    async _deploy() {
        console.log("DEPLOYING RINKEBY TESTNET ENV...")
        await this._loadBasicTokens()
        await this._loadComptroller()
        await this._loadJumpRateModels()
        await this._loadPTokens()
        await this._loadPEther()
        await this._loadMaximillion()
        console.log("UPDATE PRICE ORACLE ADDRESSES")
        return
        await this._loadPriceOracle()
        await this._loadSetttings()
        await this._loadPEtherSettings()
        // TODO top up comptroller PBX?
    }

    async _loadPriceOracle() {
        const PriceOracle = await ethers.getContractFactory("RinkebyPriceOracle")

        if (!this.addresses.oracle) {
            this.contracts.oracle = await PriceOracle.deploy()
            this.addresses.oracle = this.contracts.oracle.address
            this._logDeployedContract("oracle", "RinkebyPriceOracle")
        } else {
            this.contracts.oracle = await ethers.getContractAt("PriceOracleInterface", this.addresses.oracle)
        }
    }

    async _loadTestPrices() {
    }

    async _loadPEtherTestPrice() {
    }

    // async _loadSetttings() { }
}


class DeployerRinkarby extends DeployerRegtest {
    constructor(addresses = {}) {
        super(addresses)
    }

    async _deploy() {
        let [owner] = await ethers.getSigners()
        console.log("DEPLOYING ARBITRUM RINKARBY TESTNET ENV...")
        console.log("USING OWNER ==", owner.address)

        await this._loadBasicTokens()
        await this._loadComptroller()
        await this._loadJumpRateModels()
        await this._loadPTokens()
        // console.log("UPDATE PRICE ORACLE ADDRESSES")
        // return
        await this._loadPriceOracle()
        await this._loadSetttings()
        // TODO top up comptroller PBX?
    }

    async _loadBasicTokens() {
        let [owner] = await ethers.getSigners()

        if (this.addresses.wbtc) this.contracts.wbtc = await ethers.getContractAt("WBTC", this.addresses.wbtc) // MINTABLE OWNER
        else {
            assert(!this._isUpgradablePTokenDeployed("pwbtc"))
            this.contracts.wbtc = await this._deployBasicToken('WBTC')
            this._logDeployedContract("wbtc")
        }

        if (this.addresses.weth) this.contracts.weth = await ethers.getContractAt("Erc20TokenMock", this.addresses.weth) // MINTABLE DUMMY MOCK
        else {
            assert(!this._isUpgradablePTokenDeployed("pweth"))
            this.contracts.weth = await this._deployBasicToken('Erc20TokenMock', ['0', 'Wrapped ETH', 'WETH'])
            this._logDeployedContract("weth", "Erc20TokenMock")
        }

        if (this.addresses.usdc) this.contracts.usdc = await ethers.getContractAt("FiatTokenV2", this.addresses.usdc) // MINTABLE OWNER
        else {
            assert(!this._isUpgradablePTokenDeployed("pusdc"))
            assert(!this.addresses["usdc_initialize"] && !this.addresses["usdc_configureMinter"])
            this.contracts.usdc = await this._deployBasicToken('FiatTokenV2')
            this._logDeployedContract("usdc")
        }
        await this._handleTxIfNeeded(() => this.contracts.usdc.initialize('USDC', 'USDC', 'USD', 6, owner.address, owner.address, owner.address, owner.address), "usdc.initialize")
        await this._handleTxIfNeeded(() => this.contracts.usdc.configureMinter(owner.address, tokens('999999999999999')), "usdc.configureMinter")

        if (this.addresses.usdt) this.contracts.usdt = await ethers.getContractAt("TetherToken", this.addresses.usdt) // INITIAL SUPPLY
        else {
            assert(!this._isUpgradablePTokenDeployed("pusdt"))
            this.contracts.usdt = await this._deployBasicToken('TetherToken', [tokens('999999'), 'Tether USD', 'USDT', '6'])
            this._logDeployedContract("usdt")
        }

        if (this.addresses.pbx) this.contracts.pbx = await ethers.getContractAt("PBXTestTokenMintable", this.addresses.pbx) // MINTABLE
        else {
            assert(!this._isUpgradablePTokenDeployed("ppbx"))
            this.contracts.pbx = await this._deployBasicToken('PBXTestTokenMintable', [tokens('999999')])
            this._logDeployedContract("pbx", "PBXTestTokenMintable")
        }
    }

    async _loadJumpRateModels() {
        let [owner] = await ethers.getSigners()
        const JumpRateModelV2 = await ethers.getContractFactory("JumpRateModelV2")

        if (!this.addresses.jrmStableCoin) { // usdc, usdt
            this.contracts.jrmStableCoin = await JumpRateModelV2.deploy('0', '39999999998615040', '1089999999998841600', '800000000000000000', owner.address)
            this._logDeployedContract("jrmStableCoin", "JumpRateModelV2")
        } else {
            this.contracts.jrmStableCoin = await JumpRateModelV2.attach(this.addresses.jrmStableCoin)
        }

        if (!this.addresses.jrmEth) {
            this.contracts.jrmEth = await JumpRateModelV2.deploy('0', '95322621997923200', '222330528872230000', '800000000000000000', owner.address) // TODO params??
            this._logDeployedContract("jrmEth", "JumpRateModelV2")
        } else {
            this.contracts.jrmEth = await JumpRateModelV2.attach(this.addresses.jrmEth)
        }

        if (!this.addresses.jrmWbtc) {
            this.contracts.jrmWbtc = await JumpRateModelV2.deploy('0', '262458573636948000', '370843987858870000', '800000000000000000', owner.address)  // TODO params??
            this._logDeployedContract("jrmWbtc", "JumpRateModelV2")
        } else {
            this.contracts.jrmWbtc = await JumpRateModelV2.attach(this.addresses.jrmWbtc)
        }
    }

    async _loadPTokens() {
        assert(this.addresses.unitroller)
        const PErc20 = await ethers.getContractFactory("PErc20")

        if (!this._isUpgradablePTokenDeployed("pwbtc")) {
            assert(this.addresses.wbtc && this.addresses.jrmWbtc)
            await this._deployPErc20('pToken WBTC', 'pWBTC', 8, '20000000000000000', this.addresses.wbtc, this.addresses.jrmWbtc)
        } else {
            this.contracts.pwbtc = await PErc20.attach(this.addresses.pwbtc)
        }

        if (!this._isUpgradablePTokenDeployed("pweth")) {
            assert(this.addresses.weth && this.addresses.jrmEth)
            await this._deployPErc20('pToken WETH', 'pWETH', 8, '200000000000000000000000000', this.addresses.weth, this.addresses.jrmEth)
        } else {
            this.contracts.pweth = await PErc20.attach(this.addresses.pweth)
        }

        if (!this._isUpgradablePTokenDeployed("pusdc")) {
            assert(this.addresses.usdc && this.addresses.jrmStableCoin)
            await this._deployPErc20('pToken USDC', 'pUSDC', 8, '200000000000000', this.addresses.usdc, this.addresses.jrmStableCoin)
        } else {
            this.contracts.pusdc = await PErc20.attach(this.addresses.pusdc)
        }

        if (!this._isUpgradablePTokenDeployed("pusdt")) {
            assert(this.addresses.usdt && this.addresses.jrmStableCoin)
            await this._deployPErc20('pToken USDT', 'pUSDT', 8, '200000000000000', this.addresses.usdt, this.addresses.jrmStableCoin)
        } else {
            this.contracts.pusdt = await PErc20.attach(this.addresses.pusdt)
        }
    }

    async _loadPriceOracle() {
        const PriceOracle = await ethers.getContractFactory("RinkarbyPriceOracle")

        if (!this.addresses.oracle) {
            this.contracts.oracle = await PriceOracle.deploy()
            this.addresses.oracle = this.contracts.oracle.address
            this._logDeployedContract("oracle", "RinkarbyPriceOracle")
        } else {
            this.contracts.oracle = await ethers.getContractAt("PriceOracleInterface", this.addresses.oracle)
        }
    }

    async _loadSetttings() {
        assert(this.contracts.unitroller)
        console.log('Loading settings...')

        // ptoken._setReserveFactor
        await this._handleTxIfNeeded(() => this.contracts.pwbtc._setReserveFactor(tokens('0.2')), "pwbtc._setReserveFactor")
        await this._handleTxIfNeeded(() => this.contracts.pusdc._setReserveFactor(tokens('0.075')), "pusdc._setReserveFactor")
        await this._handleTxIfNeeded(() => this.contracts.pweth._setReserveFactor(tokens('0.2')), "pweth._setReserveFactor")
        await this._handleTxIfNeeded(() => this.contracts.pusdt._setReserveFactor(tokens('0.075')), "pusdt._setReserveFactor")

        // unitroller
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setPBXToken(this.addresses.pbx), "unitroller._setPBXToken")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setPriceOracle(this.addresses.oracle), "unitroller._setPriceOracle")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setLiquidationIncentive(tokens('1.1')), "unitroller._setLiquidationIncentive") // 1.08 ??
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setCloseFactor(tokens('0.5')), "unitroller._setCloseFactor")

        // unitroller._supportMarket
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportMarket(this.addresses.pwbtc), "unitroller._supportMarket(pwbtc)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportMarket(this.addresses.pusdc), "unitroller._supportMarket(pusdc)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportMarket(this.addresses.pweth), "unitroller._supportMarket(pweth)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportMarket(this.addresses.pusdt), "unitroller._supportMarket(pusdt)")

        // unitroller._setCollateralFactor
        // tokens(collateral_ratio), collateral_ratio <= 0.9
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setCollateralFactor(this.addresses.pwbtc, tokens('0.7')), "unitroller._setCollateralFactor(pwbtc)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setCollateralFactor(this.addresses.pusdc, tokens('0.82')), "unitroller._setCollateralFactor(pusdc)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setCollateralFactor(this.addresses.pweth, tokens('0.82')), "unitroller._setCollateralFactor(pweth)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setCollateralFactor(this.addresses.pusdt, tokens('0.82')), "unitroller._setCollateralFactor(pusdt)")
    }
}


class DeployerNFT extends DeployerRegtest {
    constructor(addresses = {}) {
        super(addresses)
    }

    async _deploy() {
        console.log("DEPLOYING TEST NFT ENV ON " + process.env.NETWORK + " NETWORK ...")
        await this._loadBasicTokens()
        await this._loadNftTokens()
        await this._loadComptroller()
        await this._loadJumpRateModels()
        await this._loadPTokens()
        await this._loadPNftTokens()
        await this._loadPriceOracle()
        await this._loadSetttings()
        await this._loadNftSetttings()
        await this._setupNFTLiquidation()
        await this._finishDeployment()
    }

    async _deployNftToken(name, symbol) {
        const Erc721 = await ethers.getContractFactory("ERC721ClaimableMock")
        return Erc721.deploy(name, symbol)
    }

    async _deployCryptoPunksMock() {
        const CryptoPunksMarketMock = await ethers.getContractFactory("CryptoPunksMarketMock")
        return CryptoPunksMarketMock.deploy()
    }

    async _deployPNFTToken(name, symbol, underlyingAsset) { // non-upgradable
        const [owner] = await ethers.getSigners()
        const PErc721 = await ethers.getContractFactory('PErc721Immutable')
        this.contracts[symbol.toLowerCase()] = await PErc721.deploy(underlyingAsset, this.addresses.unitroller, name, symbol, owner.address)
        this._logDeployedContract(symbol.toLowerCase(), "PErc721Immutable")
    }

    async _deployUpgradablePNFTToken(name, symbol, underlyingAsset) {
        const [owner] = await ethers.getSigners()
        let setImplementation = false

        const delegateKeyName = symbol.toLowerCase() + "_delegate"
        const PErc721Delegate = await ethers.getContractFactory('PErc721Delegate')
        const delegatorKeyName = symbol.toLowerCase()
        const PNFTTokenDelegator = await ethers.getContractFactory('PNFTTokenDelegator')

        if (!this.addresses[delegateKeyName]) {
            this.contracts[delegateKeyName] = await PErc721Delegate.deploy()
            await this.contracts[delegateKeyName].deployed()
            this._logDeployedContract(delegateKeyName, "PErc721Delegate")
            if (this.addresses[delegatorKeyName])
                setImplementation = true

        } else {
            this.contracts[delegateKeyName] = await PErc721Delegate.attach(this.addresses[delegateKeyName])
        }

        if (!this.addresses[delegatorKeyName]) {
            assert(this.addresses[delegateKeyName] && this.addresses.unitroller)
            this.contracts[delegatorKeyName] = await PNFTTokenDelegator.deploy(underlyingAsset, this.addresses.unitroller, name, symbol, owner.address, this.addresses[delegateKeyName], [])
            await this.contracts[delegatorKeyName].deployed()
            this._logDeployedContract(delegatorKeyName, "PNFTTokenDelegator upgradeable")
        } else {
            this.contracts[delegatorKeyName] = await PNFTTokenDelegator.attach(this.addresses[delegatorKeyName])
        }

        if (setImplementation)
            await this._handleTxIfNeeded(() => this.contracts[delegatorKeyName]._setImplementation(this.addresses[delegateKeyName], false, []), delegatorKeyName + "._setImplementation")

        this.contracts[delegatorKeyName] = await ethers.getContractAt("PErc721Interface", this.addresses[delegatorKeyName]) // abi fix
    }

    async _deployPCryptoPunks(name, symbol) {
        assert(this.addresses.cryptopunks)
        const [owner] = await ethers.getSigners()
        const PCryptoPunks = await ethers.getContractFactory('PCryptoPunksImmutable')
        this.contracts[symbol.toLowerCase()] = await PCryptoPunks.deploy(this.addresses.cryptopunks, this.addresses.unitroller, name, symbol, owner.address)
        this._logDeployedContract(symbol.toLowerCase(), "PCryptoPunksImmutable")
    }

    async _loadNftTokens() {
        if (this.addresses.erc721) this.contracts.erc721 = await ethers.getContractAt("ERC721ClaimableMock", this.addresses.erc721)
        else {
            assert(!this._isUpgradablePTokenDeployed("perc721"))
            this.contracts.erc721 = await this._deployNftToken("Erc721Mock", "E721M")
            this._logDeployedContract("erc721", "ERC721ClaimableMock")
        }

        if (this.addresses.erc721_2) this.contracts.erc721_2 = await ethers.getContractAt("ERC721ClaimableMock", this.addresses.erc721_2)
        else {
            assert(!this._isUpgradablePTokenDeployed("perc721_2"))
            this.contracts.erc721_2 = await this._deployNftToken("Erc721Mock", "E721M_2")
            this._logDeployedContract("erc721_2", "ERC721ClaimableMock")
        }

        if (this.addresses.erc721_3) this.contracts.erc721_3 = await ethers.getContractAt("ERC721ClaimableMock", this.addresses.erc721_3)
        else {
            assert(!this._isUpgradablePTokenDeployed("perc721_3"))
            this.contracts.erc721_3 = await this._deployNftToken("Erc721Mock", "E721M_3")
            this._logDeployedContract("erc721_3", "ERC721ClaimableMock")
        }

        if (this.addresses.erc721_4) this.contracts.erc721_4 = await ethers.getContractAt("ERC721ClaimableMock", this.addresses.erc721_4)
        else {
            assert(!this._isUpgradablePTokenDeployed("perc721_4"))
            this.contracts.erc721_4 = await this._deployNftToken("Erc721Mock_4", "E721M_4")
            this._logDeployedContract("erc721_4", "ERC721ClaimableMock")
        }

        if (this.addresses.cryptopunks) this.contracts.cryptopunks = await ethers.getContractAt("CryptoPunksMarketMock", this.addresses.cryptopunks)
        else {
            assert(!this._isUpgradablePTokenDeployed("pcryptopunks"))
            this.contracts.cryptopunks = await this._deployCryptoPunksMock()
            this._logDeployedContract("cryptopunks", "CryptoPunksMarketMock")
        }
    }

    async _loadPNftTokens() {
        const PErc721 = await ethers.getContractFactory("PErc721")

        if (!this._isNonUpgradablePTokenDeployed("perc721")) {
            assert(this.addresses.erc721)
            await this._deployPNFTToken('pToken Erc721Mock', 'pErc721', this.addresses.erc721)
        } else {
            this.contracts.perc721 = await PErc721.attach(this.addresses.perc721)
        }

        if (!this._isUpgradablePTokenDeployed("perc721_2")) {
            assert(this.addresses.erc721_2)
            await this._deployUpgradablePNFTToken('pToken Erc721Mock 2', 'pErc721_2', this.addresses.erc721_2)
        } else {
            this.contracts.perc721_2 = await PErc721.attach(this.addresses.perc721_2)
        }

        if (!this._isUpgradablePTokenDeployed("perc721_3")) {
            assert(this.addresses.erc721_3)
            await this._deployUpgradablePNFTToken('pToken Erc721Mock 3', 'pErc721_3', this.addresses.erc721_3)
        } else {
            this.contracts.perc721_3 = await PErc721.attach(this.addresses.perc721_3)
        }

        if (!this._isUpgradablePTokenDeployed("perc721_4")) {
            assert(this.addresses.erc721_4)
            await this._deployUpgradablePNFTToken('pToken Erc721Mock 4', 'pErc721_4', this.addresses.erc721_4)
        } else {
            this.contracts.perc721_4 = await PErc721.attach(this.addresses.perc721_4)
        }

        if (!this._isNonUpgradablePTokenDeployed("pcryptopunks")) {
            assert(this.addresses.cryptopunks)
            await this._deployPCryptoPunks('pToken CryptoPunks', 'pcryptopunks')
        } else {
            this.contracts.pcryptopunks = await ethers.getContractAt("PCryptoPunks", this.addresses.pcryptopunks)
        }
    }

    async _loadNftSetttings() {
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 0, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,0)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 1, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,1)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 2, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,2)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 3, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,3)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 4, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,4)") // 100 USD

        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 0, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,0)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 1, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,1)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 2, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,2)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 3, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,3)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 4, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,4)") // 100 USD

        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_2, 0, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_2,0)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_2, 1, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_2,1)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_2, 2, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_2,2)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_2, 3, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_2,3)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_2, 4, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_2,4)") // 100 USD

        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_3, 0, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_3,0)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_3, 1, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_3,1)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_3, 2, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_3,2)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_3, 3, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_3,3)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_3, 4, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_3,4)") // 100 USD

        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_4, 0, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_4,0)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_4, 1, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_4,1)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_4, 2, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_4,2)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_4, 3, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_4,3)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_4, 4, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_4,4)") // 100 USD

        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportNFTMarket(this.addresses.perc721), "unitroller._supportNFTMarket(perc721)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportNFTMarket(this.addresses.perc721_2), "unitroller._supportNFTMarket(perc721_2)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportNFTMarket(this.addresses.perc721_3), "unitroller._supportNFTMarket(perc721_3)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportNFTMarket(this.addresses.perc721_4), "unitroller._supportNFTMarket(perc721_4)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportNFTMarket(this.addresses.pcryptopunks), "unitroller._supportNFTMarket(pcryptopunks)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setNFTCollateralFactor(this.addresses.perc721, tokens('0.4')), "unitroller._setNFTCollateralFactor(perc721)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setNFTCollateralFactor(this.addresses.perc721_2, tokens('0.4')), "unitroller._setNFTCollateralFactor(perc721_2)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setNFTCollateralFactor(this.addresses.perc721_3, tokens('0.4')), "unitroller._setNFTCollateralFactor(perc721_3)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setNFTCollateralFactor(this.addresses.perc721_4, tokens('0.4')), "unitroller._setNFTCollateralFactor(perc721_4)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setNFTCollateralFactor(this.addresses.pcryptopunks, tokens('0.4')), "unitroller._setNFTCollateralFactor(pcryptopunks)")
    }

    async _setupNFTLiquidation() {
        console.log("Setting-up NFT liquidation...")
        const NFTXVaultFactoryMock = await ethers.getContractFactory('NFTXVaultFactoryMock')
        const NFTXMarketplaceZapMock = await ethers.getContractFactory('NFTXMarketplaceZapMock')

        if (this.addresses.nftxVaultFactoryMock) this.contracts.nftxVaultFactoryMock = await NFTXVaultFactoryMock.attach(this.addresses.nftxVaultFactoryMock)
        else {
            assert(!this.addresses.nftxMarketplaceZap)
            this.contracts.nftxVaultFactoryMock = await NFTXVaultFactoryMock.deploy();
            this._logDeployedContract("nftxVaultFactoryMock", "NFTXVaultFactoryMock")
        }

        if (this.addresses.nftxMarketplaceZap) this.contracts.nftxMarketplaceZap = await NFTXMarketplaceZapMock.attach(this.addresses.nftxMarketplaceZap)
        else {
            assert(this.addresses.cryptopunks)
            this.contracts.nftxMarketplaceZap = await NFTXMarketplaceZapMock.deploy(this.addresses.cryptopunks, this.addresses.nftxVaultFactoryMock);
            this._logDeployedContract("nftxMarketplaceZap", "NFTXMarketplaceZapMock")
        }

        await this._handleTxIfNeeded(() => this.contracts.nftxVaultFactoryMock.setNFTAsset(42, this.addresses.cryptopunks), "nftxVaultFactoryMock.setNFTAsset(42,cryptopunks)")
        await this._handleTxIfNeeded(() => this.contracts.nftxVaultFactoryMock.setNFTAsset(43, this.addresses.erc721), "nftxVaultFactoryMock.setNFTAsset(43,erc721)")
        await this._handleTxIfNeeded(() => this.contracts.nftxVaultFactoryMock.setNFTAsset(44, this.addresses.erc721_2), "nftxVaultFactoryMock.setNFTAsset(44,erc721_2)")
        await this._handleTxIfNeeded(() => this.contracts.nftxVaultFactoryMock.setNFTAsset(45, this.addresses.erc721_3), "nftxVaultFactoryMock.setNFTAsset(45,erc721_3)")
        await this._handleTxIfNeeded(() => this.contracts.nftxVaultFactoryMock.setNFTAsset(46, this.addresses.erc721_4), "nftxVaultFactoryMock.setNFTAsset(46,erc721_4)")

        assert(this.addresses.pusdc)
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setNFTLiquidationExchangePToken(this.addresses.pusdc), "unitroller._setNFTLiquidationExchangePToken")
        await this._handleTxIfNeeded(() => this.contracts.usdc.mint(this.addresses.nftxMarketplaceZap, '100000000000000000'), "usdc.mint(nftxMarketplaceZap)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setNFTXMarketplaceZapAddress(this.addresses.nftxMarketplaceZap), "unitroller._setNFTXMarketplaceZapAddress")

        await this._handleTxIfNeeded(() => this.contracts.pcryptopunks._setNFTXVaultId(42), "pcryptopunks._setNFTXVaultId")
        await this._handleTxIfNeeded(() => this.contracts.perc721._setNFTXVaultId(43), "perc721._setNFTXVaultId")
        await this._handleTxIfNeeded(() => this.contracts.perc721_2._setNFTXVaultId(44), "perc721_2._setNFTXVaultId")
        await this._handleTxIfNeeded(() => this.contracts.perc721_3._setNFTXVaultId(45), "perc721_3._setNFTXVaultId")
        await this._handleTxIfNeeded(() => this.contracts.perc721_4._setNFTXVaultId(46), "perc721_4._setNFTXVaultId")
    }

    async _finishDeployment() { // NFT TODO playground
        console.log("Finishing deployment...")
        const [owner, user1] = await ethers.getSigners()

        const kamil = '0x2446bBaBB0f61D900977634842798478CcF0A8bb'
        const maciej = '0x9e8258ede5e00E7DffB9F35BBF4001DF98B6cE23'

        // await this._handleTxIfNeeded(() => this.contracts.dai.mint('0x9e8258ede5e00E7DffB9F35BBF4001DF98B6cE23', tokens('100')), "12343565")
        // await this._handleTxIfNeeded(() => this.contracts.usdc.mint('0x9e8258ede5e00E7DffB9F35BBF4001DF98B6cE23', '100000000'), "feryhdcfgd")

        await this._handleTxIfNeeded(() => this.contracts.erc721.claim(maciej, 200), "erc721.claim(200)")
        await this._handleTxIfNeeded(() => this.contracts.erc721.claim(maciej, 201), "erc721.claim(201)")
        await this._handleTxIfNeeded(() => this.contracts.erc721.claim(maciej, 202), "erc721.claim(202)")

        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 200, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,200)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 201, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,201)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 202, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,202)") // 100 USD

        await this._handleTxIfNeeded(() => this.contracts.erc721_2.claim(maciej, 200), "erc721_2.claim(200)")
        await this._handleTxIfNeeded(() => this.contracts.erc721_2.claim(maciej, 201), "erc721_2.claim(201)")
        await this._handleTxIfNeeded(() => this.contracts.erc721_2.claim(maciej, 202), "erc721_2.claim(202)")

        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_2, 200, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_2,200)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_2, 201, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_2,201)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_2, 202, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_2,202)") // 100 USD

        await this._handleTxIfNeeded(() => this.contracts.erc721_3.claim(maciej, 200), "erc721_3.claim(200)")
        await this._handleTxIfNeeded(() => this.contracts.erc721_3.claim(maciej, 201), "erc721_3.claim(201)")
        await this._handleTxIfNeeded(() => this.contracts.erc721_3.claim(maciej, 202), "erc721_3.claim(202)")

        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_3, 200, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_3,200)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_3, 201, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_3,201)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_3, 202, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_3,202)") // 100 USD

        await this._handleTxIfNeeded(() => this.contracts.erc721_4.claim(maciej, 200), "erc721_4.claim(200)")
        await this._handleTxIfNeeded(() => this.contracts.erc721_4.claim(maciej, 201), "erc721_4.claim(201)")
        await this._handleTxIfNeeded(() => this.contracts.erc721_4.claim(maciej, 202), "erc721_4.claim(202)")

        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_4, 200, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_4,200)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_4, 201, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_4,201)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721_4, 202, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721_4,202)") // 100 USD

        // await this._handleTxIfNeeded(() => this.contracts.pbx.mint(this.addresses.unitroller, tokens('10000')), "pbx.mint(unitroller)")
        // await this._handleTxIfNeeded(() => this.contracts.cryptopunks.allInitialOwnersAssigned(), "cryptopunks.allInitialOwnersAssigned")
        //
        // await this._handleTxIfNeeded(() => this.contracts.cryptopunks.getPunk(0), "cryptopunks.getPunk(0)")
        // await this._handleTxIfNeeded(() => this.contracts.cryptopunks.offerPunkForSaleToAddress(0, 0, this.addresses.pcryptopunks), "cryptopunks.offerPunkForSaleToAddress(0,pcryptopunks)")
        // await this._handleTxIfNeeded(() => this.contracts.pcryptopunks.mint(0), "pcryptopunks.mint(0)")
        // await this._handleTxIfNeeded(() => this.contracts.unitroller.enterNFTMarkets([this.addresses.pcryptopunks]), "unitroller.enterNFTMarkets(pcryptopunks)")
        //
        // await this._handleTxIfNeeded(() => this.contracts.cryptopunks.getPunk(1), "cryptopunks.getPunk(1)")
        // await this._handleTxIfNeeded(() => this.contracts.cryptopunks.offerPunkForSaleToAddress(1, 0, this.addresses.pcryptopunks), "cryptopunks.offerPunkForSaleToAddress(1,pcryptopunks)")
        // await this._handleTxIfNeeded(() => this.contracts.pcryptopunks.mint(1), "pcryptopunks.mint(1)")
        //
        // await this._handleTxIfNeeded(() => this.contracts.erc721.claim(owner.address, 0), "erc721.claim(0)")
        // await this._handleTxIfNeeded(() => this.contracts.erc721.approve(this.addresses.perc721, 0), "erc721.approve(perc721,0)")
        // await this._handleTxIfNeeded(() => this.contracts.perc721.mint(0), "perc721.mint(0)")
        // await this._handleTxIfNeeded(() => this.contracts.unitroller.enterNFTMarkets([this.addresses.perc721]), "unitroller.enterNFTMarkets(perc721)")
        //
        // await this._handleTxIfNeeded(() => this.contracts.dai.mint(owner.address, '10000000000000000000'), "dai.mint")
        // await this._handleTxIfNeeded(() => this.contracts.dai.approve(this.addresses.pdai, '10000000000000000000'), "dai.approve")
        // await this._handleTxIfNeeded(() => this.contracts.pdai.mint('10000000000000000000'), "pdai.mint")
        // await this._handleTxIfNeeded(() => this.contracts.unitroller.enterMarkets([this.addresses.pdai]), "unitroller.enterMarkets(pdai)")
        //
        // await this._handleTxIfNeeded(() => this.contracts.usdc.mint(owner.address, '10000000'), "usdc.mint")
        // await this._handleTxIfNeeded(() => this.contracts.usdc.approve(this.addresses.pusdc, '10000000'), "usdc.approve")
        // await this._handleTxIfNeeded(() => this.contracts.pusdc.mint('10000000'), "pusdc.mint")
        // await this._handleTxIfNeeded(() => this.contracts.unitroller.enterMarkets([this.addresses.pusdc]), "unitroller.enterMarkets(pusdc)")
        //
        // await this._handleTxIfNeeded(() => this.contracts.pcryptopunks.transferFrom(owner.address, user1.address, 0), "pcryptopunks.transferFrom(owner,user1,0)")
        // await this._handleTxIfNeeded(() => this.contracts.unitroller.connect(user1).enterNFTMarkets([this.addresses.pcryptopunks]), "unitroller.connect(user1).enterNFTMarkets(pcryptopunks)")
    }
}


class DeployerDemoEnvGoerli extends DeployerRegtest {
    constructor(addresses = {}) {
        super(addresses)
    }

    async _deploy() {
        let [owner] = await ethers.getSigners()
        console.log("DEPLOYING DEMO ENV ON " + process.env.NETWORK + " NETWORK ...")
        console.log("USING OWNER ==", owner.address)

        await this._loadBasicTokens()
        await this._loadComptroller()
        await this._loadJumpRateModels()
        await this._loadPTokens()
        await this._loadPEther()
        await this._loadMaximillion()

        // console.log("UPDATE PRICE ORACLE ADDRESSES NOW, RECOMPILE")
        // return

        await this._loadPriceOracle()
        await this._verifyPriceOracle()
        await this._loadSetttings()
        await this._loadPEtherSettings()
        await this._finishDeployment()
        // await this._transferOwnership()
    }

    async _verifyPriceOracle() {
        try {
            assert(await this.contracts.oracle.getUnderlyingPrice(this.addresses.pwbtc) > 0);
            assert(await this.contracts.oracle.getUnderlyingPrice(this.addresses.plink) > 0);
            assert(await this.contracts.oracle.getUnderlyingPrice(this.addresses.pusdc) > 0);
            assert(await this.contracts.oracle.getUnderlyingPrice(this.addresses.peth) > 0);
        } catch (e) {
            throw new Error('verify price oracle')
        }
    }

    async _loadBasicTokens() {
        let [owner] = await ethers.getSigners()

        if (this.addresses.pbx) this.contracts.pbx = await ethers.getContractAt("PBXTestTokenMintable", this.addresses.pbx)
        else {
            assert(!this._isUpgradablePTokenDeployed("ppbx"))
            this.contracts.pbx = await this._deployBasicToken('PBXTestTokenMintable', ['0'])
            this._logDeployedContract("pbx", "PBXTestTokenMintable")
        }

        if (this.addresses.wbtc) this.contracts.wbtc = await ethers.getContractAt("WBTC", this.addresses.wbtc) // MINTABLE OWNER
        else {
            assert(!this._isUpgradablePTokenDeployed("pwbtc"))
            this.contracts.wbtc = await this._deployBasicToken('WBTC')
            this._logDeployedContract("wbtc")
        }

        if (this.addresses.usdc) this.contracts.usdc = await ethers.getContractAt("FiatTokenV2", this.addresses.usdc) // MINTABLE OWNER
        else {
            assert(!this._isUpgradablePTokenDeployed("pusdc"))
            assert(!this.addresses["usdc_initialize"] && !this.addresses["usdc_configureMinter"])
            this.contracts.usdc = await this._deployBasicToken('FiatTokenV2')
            this._logDeployedContract("usdc")
        }
        await this._handleTxIfNeeded(() => this.contracts.usdc.initialize('USDC', 'USDC', 'USD', 6, owner.address, owner.address, owner.address, owner.address), "usdc.initialize")
        await this._handleTxIfNeeded(() => this.contracts.usdc.configureMinter(owner.address, tokens('999999999999999')), "usdc.configureMinter")

        if (this.addresses.link) this.contracts.link = await ethers.getContractAt("ERC20TokenMock", this.addresses.link) // MINTABLE OWNER
        else {
            assert(!this._isUpgradablePTokenDeployed("plink"))
            this.contracts.link = await this._deployBasicToken('ERC20TokenMock', ['0', 'ChainLink Token', 'LINK'])
            this._logDeployedContract("link", "ERC20TokenMock")
        }
    }

    async _loadJumpRateModels() {
        let [owner] = await ethers.getSigners()
        const JumpRateModelV2 = await ethers.getContractFactory("JumpRateModelV2")

        if (!this.addresses.jrmStableCoin) {
            this.contracts.jrmStableCoin = await JumpRateModelV2.deploy('0', '39222804184156400', '3272914755156920000', '800000000000000000', owner.address)
            this._logDeployedContract("jrmStableCoin", "JumpRateModelV2")
        } else {
            this.contracts.jrmStableCoin = await JumpRateModelV2.attach(this.addresses.jrmStableCoin)
        }

        if (!this.addresses.jrmEth) {
            this.contracts.jrmEth = await JumpRateModelV2.deploy('0', '95322621997923200', '222330528872230000', '800000000000000000', owner.address)
            this._logDeployedContract("jrmEth", "JumpRateModelV2")
        } else {
            this.contracts.jrmEth = await JumpRateModelV2.attach(this.addresses.jrmEth)
        }

        if (!this.addresses.jrmWbtc) {
            this.contracts.jrmWbtc = await JumpRateModelV2.deploy('0', '262458573636948000', '370843987858870000', '800000000000000000', owner.address)
            this._logDeployedContract("jrmWbtc", "JumpRateModelV2")
        } else {
            this.contracts.jrmWbtc = await JumpRateModelV2.attach(this.addresses.jrmWbtc)
        }

        if (!this.addresses.jrmLink) {
            this.contracts.jrmLink = await JumpRateModelV2.deploy('0', '262458573636948000', '370843987858870000', '800000000000000000', owner.address) // copy of jrmWbtc
            this._logDeployedContract("jrmLink", "JumpRateModelV2")
        } else {
            this.contracts.jrmLink = await JumpRateModelV2.attach(this.addresses.jrmLink)
        }
    }

    async _loadPTokens() {
        assert(this.addresses.unitroller)
        const PErc20 = await ethers.getContractFactory("PErc20")

        if (!this._isUpgradablePTokenDeployed("pwbtc")) {
            assert(this.addresses.wbtc && this.addresses.jrmWbtc)
            await this._deployPErc20('pToken WBTC', 'pWBTC', 8, '20000000000000000', this.addresses.wbtc, this.addresses.jrmWbtc)
        } else {
            this.contracts.pwbtc = await PErc20.attach(this.addresses.pwbtc)
        }

        if (!this._isUpgradablePTokenDeployed("pusdc")) {
            assert(this.addresses.usdc && this.addresses.jrmStableCoin)
            await this._deployPErc20('pToken USDC', 'pUSDC', 8, '200000000000000', this.addresses.usdc, this.addresses.jrmStableCoin)
        } else {
            this.contracts.pusdc = await PErc20.attach(this.addresses.pusdc)
        }

        if (!this._isUpgradablePTokenDeployed("plink")) {
            assert(this.addresses.link && this.addresses.jrmLink)
            await this._deployPErc20('pToken LINK', 'pLINK', 8, '200000000000000000000000000', this.addresses.link, this.addresses.jrmLink)
        } else {
            this.contracts.plink = await PErc20.attach(this.addresses.plink)
        }
    }

    async _loadPEther() { // non-upgradeable
        assert(this.addresses.unitroller)
        assert(this.addresses.jrmEth)
        const PEther = await ethers.getContractFactory("PEther")

        if (!this.addresses.peth) {
            assert(!this.addresses.maximillion)
            const [owner] = await ethers.getSigners()
            this.contracts.peth = await PEther.deploy(this.addresses.unitroller, this.addresses.jrmEth, '200000000000000000000000000', 'pEther', 'pETH', 8, owner.address)
            this._logDeployedContract("peth")
        } else {
            this.contracts.peth = await PEther.attach(this.addresses.peth)
        }
    }

    async _loadMaximillion() {
        assert(this.addresses.peth)
        const Maximillion = await ethers.getContractFactory("Maximillion")

        if (!this.addresses.maximillion) {
            this.contracts.maximillion = await Maximillion.deploy(this.addresses.peth)
            this._logDeployedContract("maximillion")
        } else {
            this.contracts.maximillion = await Maximillion.attach(this.addresses.maximillion)
        }
    }

    async _loadPriceOracle() {
        const PriceOracle = await ethers.getContractFactory("GoerliPriceOracle")

        if (!this.addresses.oracle) {
            this.contracts.oracle = await PriceOracle.deploy()
            this.addresses.oracle = this.contracts.oracle.address
            this._logDeployedContract("oracle", "GoerliPriceOracle")
        } else {
            this.contracts.oracle = await ethers.getContractAt("PriceOracleInterface", this.addresses.oracle)
        }
    }

    async _loadSetttings() {
        assert(this.contracts.unitroller)
        console.log('Loading settings...')

        // ptoken._setReserveFactor
        await this._handleTxIfNeeded(() => this.contracts.pwbtc._setReserveFactor(tokens('0.2')), "pwbtc._setReserveFactor")
        await this._handleTxIfNeeded(() => this.contracts.plink._setReserveFactor(tokens('0.2')), "plink._setReserveFactor")
        await this._handleTxIfNeeded(() => this.contracts.pusdc._setReserveFactor(tokens('0.075')), "pusdc._setReserveFactor")

        // unitroller
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setPBXToken(this.addresses.pbx), "unitroller._setPBXToken")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setPriceOracle(this.addresses.oracle), "unitroller._setPriceOracle")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setLiquidationIncentive(tokens('1.1')), "unitroller._setLiquidationIncentive") // 1.08 ??
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setCloseFactor(tokens('0.5')), "unitroller._setCloseFactor")

        // unitroller._supportMarket
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportMarket(this.addresses.pwbtc), "unitroller._supportMarket(pwbtc)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportMarket(this.addresses.pusdc), "unitroller._supportMarket(pusdc)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportMarket(this.addresses.plink), "unitroller._supportMarket(plink)")

        // unitroller._setCollateralFactor
        // tokens(collateral_ratio), collateral_ratio <= 0.9
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setCollateralFactor(this.addresses.pwbtc, tokens('0.7')), "unitroller._setCollateralFactor(pwbtc)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setCollateralFactor(this.addresses.plink, tokens('0.7')), "unitroller._setCollateralFactor(plink)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setCollateralFactor(this.addresses.pusdc, tokens('0.82')), "unitroller._setCollateralFactor(pusdc)")
    }

    async _loadPEtherSettings() {
        assert(this.contracts.unitroller)
        assert(this.contracts.peth)
        assert(this.addresses.peth)
        console.log('Loading PEther test settings...')

        await this._handleTxIfNeeded(() => this.contracts.peth._setReserveFactor(tokens('0.2')), "peth._setReserveFactor")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportMarket(this.addresses.peth), "unitroller._supportMarket(peth)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setCollateralFactor(this.addresses.peth, tokens('0.82')), "unitroller._setCollateralFactor(peth)")
    }

    async _finishDeployment() { // NFT TODO playground
        console.log("Finishing deployment...")
        const [owner, user1] = await ethers.getSigners()

        // await this._handleTxIfNeeded(() => this.contracts.pbx.mint(this.addresses.unitroller, tokens('10000')), "pbx.mint(unitroller)")

        // await this._handleTxIfNeeded(() => this.contracts.wbtc.mint(owner.address, toTokens('1000', 8)), "wbtc.mint(owner)")
        await this._handleTxIfNeeded(() => this.contracts.usdc.mint(owner.address, toTokens('1000000', 6)), "usdc.mint(owner)2")
        // await this._handleTxIfNeeded(() => this.contracts.link.mint(owner.address, tokens('1000')), "link.mint(owner)")

        // let simon = '0x840fC25B63512E9DAA94579A9cB9f046719334EC'
        // await this._handleTxIfNeeded(() => this.contracts.wbtc.mint(simon, toTokens('1000', 8)), "wbtc.mint(simon)")
        // await this._handleTxIfNeeded(() => this.contracts.usdc.mint(simon, toTokens('1000', 6)), "usdc.mint(simon)")
        // await this._handleTxIfNeeded(() => this.contracts.link.mint(simon, tokens('1000')), "link.mint(simon)")
    }

    async _transferOwnership() {
        let simon = '0x840fC25B63512E9DAA94579A9cB9f046719334EC'

        await this._handleTxIfNeeded(() => this.contracts.pbx.transferOwnership(simon), "pbx.transferOwnership(simon)")
        await this._handleTxIfNeeded(() => this.contracts.wbtc.transferOwnership(simon), "wbtc.transferOwnership(simon)")
        await this._handleTxIfNeeded(() => this.contracts.usdc.transferOwnership(simon), "usdc.transferOwnership(simon)")
        await this._handleTxIfNeeded(() => this.contracts.link.transferOwnership(simon), "link.transferOwnership(simon)")

        const unitroller = await ethers.getContractAt("Unitroller", this.addresses.unitroller)
        await this._handleTxIfNeeded(() => unitroller._setPendingAdmin(simon), "unitroller._setPendingAdmin(simon)") // _acceptAdmin
        await this._handleTxIfNeeded(() => this.contracts.pwbtc._setPendingAdmin(simon), "pwbtc._setPendingAdmin(simon)") // _acceptAdmin
        await this._handleTxIfNeeded(() => this.contracts.pusdc._setPendingAdmin(simon), "pusdc._setPendingAdmin(simon)") // _acceptAdmin
        await this._handleTxIfNeeded(() => this.contracts.plink._setPendingAdmin(simon), "plink._setPendingAdmin(simon)") // _acceptAdmin
        await this._handleTxIfNeeded(() => this.contracts.peth._setPendingAdmin(simon), "peth._setPendingAdmin(simon)") // _acceptAdmin
    }
}


class DeployerMumbaiPriceOracleOnly extends DeployerRegtest {
    constructor(addresses = {}) {
        super(addresses)
    }

    async _deploy() {
        await this._loadPriceOracle()
    }

    async _loadPriceOracle() {
        const PriceOracle = await ethers.getContractFactory("MumbaiPriceOracleTest")

        if (!this.addresses.oracle) {
            this.contracts.oracle = await PriceOracle.deploy()
            this._logDeployedContract("oracle", "MumbaiPriceOracleTest")
        } else {
            this.contracts.oracle = await PriceOracle.attach(this.addresses.oracle)
        }
    }
}


module.exports = {
    DeployerRegtest,
    DeployerRinkeby,
    DeployerRinkarby,
    DeployerNFT,
    DeployerDemoEnvGoerli,
    DeployerMumbaiPriceOracleOnly
}

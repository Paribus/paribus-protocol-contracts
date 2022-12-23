const {ethers} = require('hardhat')
const assert = require('assert')
const {tokens, REPAY_MAX} = require("../../test/utils/testHelpers")

class DeployerRegtest {
    constructor(addresses = {}) {
        this.addresses = addresses
        this.contracts = {}
    }

    async deploy(tries=5) {
        for (let i = 0; i < tries; i++) {
            try {
                await this._deploy()
                break
            } catch (e) {
                if (i + 1 < tries) {
                    console.log(e)
                    console.log("\nRETRYING...\n")
                }
            }
        }
        console.log("DEPLOY END")
        // console.log(this.addresses)
    }

    async _deploy() {
        let [owner] = await ethers.getSigners()
        console.log("DeployerRegtest ON " + process.env.NETWORK + " NETWORK ...")
        console.log("USING OWNER ==", owner.address)

        await this._loadBasicTokens()
        await this._loadComptroller()
        await this._loadJumpRateModels()
        await this._loadPTokens()
        await this._loadPEther()
        await this._loadPriceOracle()
        await this._loadSetttings()
        await this._finishDeployment()
    }

    async _handleFailureEvents(tx) {
        for (let i = 0; i < tx.events.length; i++) {
            if (tx.events[i].event === "Failure" || tx.events[i].eventSignature === "Failure(uint256,uint256,uint256)")
                throw new Error(`Failure event: ${tx.events[i].args}`)
        }
    }

    async _handleTx(txPromise, txNameToLog) {
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

    async _handleTxIfNeeded(txPromise, txNameToLog, tries=5) {
        if (this.addresses[this._prepareTxNameToLog(txNameToLog)]) return

        return this._handleTxAnyway(txPromise, txNameToLog, tries)
    }

    async _handleTxAnyway(txPromise, txNameToLog, tries=5) {
        txNameToLog = this._prepareTxNameToLog(txNameToLog)

        for (let i = 0; i < tries; i++) {
            try {
                await this._handleTx(txPromise, txNameToLog)
                break
            } catch (e) {
                if (i + 1 < tries) {
                    console.log("\nRETRYING...\n")
                } else {
                    throw e
                }
            }
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

    async _verifyPriceOracle() {
        try {
            if (this.addresses['pwbtc']) assert(await this.contracts.oracle.getUnderlyingPrice(this.addresses.pwbtc) > 0)
            if (this.addresses['pdai']) assert(await this.contracts.oracle.getUnderlyingPrice(this.addresses.pdai) > 0)
            if (this.addresses['plink']) assert(await this.contracts.oracle.getUnderlyingPrice(this.addresses.plink) > 0)
            if (this.addresses['pusdc']) assert(await this.contracts.oracle.getUnderlyingPrice(this.addresses.pusdc) > 0)
            if (this.addresses['pusdt']) assert(await this.contracts.oracle.getUnderlyingPrice(this.addresses.pusdt) > 0)
            if (this.addresses['pweth']) assert(await this.contracts.oracle.getUnderlyingPrice(this.addresses.pweth) > 0)
            if (this.addresses['peth']) assert(await this.contracts.oracle.getUnderlyingPrice(this.addresses.peth) > 0)
            if (this.addresses['ppbx']) assert(await this.contracts.oracle.getUnderlyingPrice(this.addresses.ppbx) > 0)
        } catch (e) {
            throw new Error('verify price oracle')
        }
    }

    async _deployBasicToken(contractName, deployParams = []) {
        const Token = await ethers.getContractFactory(contractName)
        return Token.deploy(...deployParams)
    }

    async _loadBasicTokens() {
        let [owner] = await ethers.getSigners()

        if (this.addresses.dai) this.contracts.dai = await ethers.getContractAt("Dai", this.addresses.dai)
        else {
            assert(!this._isPTokenDeployed("pdai"))
            this.contracts.dai = await this._deployBasicToken('Dai', [(await ethers.provider.getNetwork()).chainId])
            this._logDeployedContract("dai")
        }

        if (this.addresses.wbtc) this.contracts.wbtc = await ethers.getContractAt("WBTC", this.addresses.wbtc) // MINTABLE OWNER
        else {
            assert(!this._isPTokenDeployed("pwbtc"))
            this.contracts.wbtc = await this._deployBasicToken('WBTC')
            this._logDeployedContract("wbtc")
        }

        if (this.addresses.pbx) this.contracts.pbx = await ethers.getContractAt("PBXTestTokenMintable", this.addresses.pbx) // MINTABLE OWNER
        else {
            assert(!this._isPTokenDeployed("ppbx"))
            this.contracts.pbx = await this._deployBasicToken('PBXTestTokenMintable', ['0'])
            this._logDeployedContract("pbx", "PBXTestTokenMintable")
        }

        if (this.addresses.weth) this.contracts.weth = await ethers.getContractAt("WETH9", this.addresses.weth)
        else {
            assert(!this._isPTokenDeployed("pweth"))
            this.contracts.weth = await this._deployBasicToken('WETH9')
            this._logDeployedContract("weth")
        }

        if (this.addresses.usdc) this.contracts.usdc = await ethers.getContractAt("FiatTokenV2", this.addresses.usdc) // MINTABLE OWNER
        else {
            assert(!this._isPTokenDeployed("pusdc"))
            assert(!this.addresses["usdc_initialize"] && !this.addresses["usdc_configureMinter"])
            this.contracts.usdc = await this._deployBasicToken('FiatTokenV2')
            this._logDeployedContract("usdc")
        }
        await this._handleTxIfNeeded(() => this.contracts.usdc.initialize('USDC', 'USDC', 'USD', 6, owner.address, owner.address, owner.address, owner.address), "usdc.initialize")
        await this._handleTxIfNeeded(() => this.contracts.usdc.configureMinter(owner.address, tokens('999999999999999')), "usdc.configureMinter")
    }

    async _setComptrollerImpl() {
        if (this._isComptrollerImplSet()) return

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

    async _deployPEther() {
        assert(this.addresses.jrmEth)
        const [owner] = await ethers.getSigners()
        let setImplementation = false

        const delegateKeyName = "peth_delegate"
        const PEtherDelegate = await ethers.getContractFactory('PEtherDelegate')
        const delegatorKeyName = "peth"
        const PEtherDelegator = await ethers.getContractFactory('PEtherDelegator')

        if (!this.addresses[delegateKeyName]) {
            this.contracts[delegateKeyName] = await PEtherDelegate.deploy()
            await this.contracts[delegateKeyName].deployed()
            this._logDeployedContract(delegateKeyName, "PEtherDelegate")
            if (this.addresses[delegatorKeyName])
                setImplementation = true
        } else {
            this.contracts[delegateKeyName] = await PEtherDelegate.attach(this.addresses[delegateKeyName])
        }

        if (!this.addresses[delegatorKeyName]) {
            assert(!this.addresses.maximillion)
            assert(this.addresses[delegateKeyName] && this.addresses.unitroller && this.addresses.jrmEth)
            this.contracts[delegatorKeyName] = await PEtherDelegator.deploy(this.addresses.unitroller, this.addresses.jrmEth, '200000000000000000000000000', 'pEther', 'pETH', 8, owner.address, this.addresses[delegateKeyName], [])
            await this.contracts[delegatorKeyName].deployed()
            this._logDeployedContract(delegatorKeyName, "PEtherDelegator upgradeable")
        } else {
            this.contracts[delegatorKeyName] = await PEtherDelegator.attach(this.addresses[delegatorKeyName])
        }

        if (setImplementation)
            await this._handleTxIfNeeded(() => this.contracts[delegatorKeyName]._setImplementation(this.addresses[delegateKeyName], false, []), delegatorKeyName + "._setImplementation")

        this.contracts[delegatorKeyName] = await ethers.getContractAt("PErc20Interface", this.addresses[delegatorKeyName]) // abi fix
    }

    _noPTokenDeployed() {
        return !this._isPTokenDeployed("peth") &&
            !this._isPTokenDeployed("pdai") &&
            !this._isPTokenDeployed("ppbx") &&
            !this._isPTokenDeployed("pwbtc") &&
            !this._isPTokenDeployed("pweth") &&
            !this._isPTokenDeployed("pusdc") &&
            !this._isPTokenDeployed("plink") &&
            !this._isPTokenDeployed("pusdt") &&
            !this._isPTokenDeployed("perc721") &&
            !this._isPTokenDeployed("pcryptopunks")
    }

    _isPTokenDeployed(name) {
        if (this.addresses[name] && this.addresses[name + "_delegate"]) return true
        assert(!this.addresses[name + "__setImplementation"])
        assert(!this.addresses["unitroller__supportMarket_" + name + "_"])
        assert(!this.addresses["unitroller__supportNFTMarket_" + name + "_"])
        assert(!this.addresses["unitroller__setCollateralFactor_" + name + "_"])
        assert(!this.addresses["unitroller__setNFTCollateralFactor_" + name + "_"])
        assert(!this.addresses["oracle_setUnderlyingPrice_" + name + "_"])
        assert(!this.addresses["oracle_setUnderlyingNFTPrice_" + name + "_"])
        assert(!this.addresses["_" + name + "_setReserveFactor"])
        return false
    }

    async _loadPTokens() {
        assert(this.addresses.unitroller)
        const PErc20 = await ethers.getContractFactory("PErc20")

        if (!this._isPTokenDeployed("pdai")) {
            assert(this.addresses.dai && this.addresses.jrmStableCoin)
            await this._deployPErc20('pToken DAI', 'pDAI', 8, '200000000000000000000000000', this.addresses.dai, this.addresses.jrmStableCoin)
        } else {
            this.contracts.pdai = await PErc20.attach(this.addresses.pdai)
        }

        if (!this._isPTokenDeployed("ppbx")) {
            assert(this.addresses.pbx && this.addresses.jrmPbx)
            await this._deployPErc20('pToken PBX', 'pPBX', 8, '200000000000000000000000000', this.addresses.pbx, this.addresses.jrmPbx)
        } else {
            this.contracts.ppbx = await PErc20.attach(this.addresses.ppbx)
        }

        if (!this._isPTokenDeployed("pwbtc")) {
            assert(this.addresses.wbtc && this.addresses.jrmWbtc)
            await this._deployPErc20('pToken WBTC', 'pWBTC', 8, '20000000000000000', this.addresses.wbtc, this.addresses.jrmWbtc)
        } else {
            this.contracts.pwbtc = await PErc20.attach(this.addresses.pwbtc)
        }

        if (!this._isPTokenDeployed("pweth")) {
            assert(this.addresses.weth && this.addresses.jrmStableCoin)
            await this._deployPErc20('pToken WETH', 'pWETH', 8, '200000000000000000000000000', this.addresses.weth, this.addresses.jrmStableCoin)
        } else {
            this.contracts.pweth = await PErc20.attach(this.addresses.pweth)
        }

        if (!this._isPTokenDeployed("pusdc")) {
            assert(this.addresses.usdc && this.addresses.jrmStableCoin)
            await this._deployPErc20('pToken USDC', 'pUSDC', 8, '200000000000000', this.addresses.usdc, this.addresses.jrmStableCoin)
        } else {
            this.contracts.pusdc = await PErc20.attach(this.addresses.pusdc)
        }
    }

    async _loadPEther() {
        const PEther = await ethers.getContractFactory("PEther")

        if (!this._isPTokenDeployed("peth")) {
            assert(!this.addresses.maximillion)
            await this._deployPEther()
        } else {
            this.contracts.peth = await PEther.attach(this.addresses.peth)
        }

        await this._loadMaximillion()
    }

    async _loadMaximillion() {
        const Maximillion = await ethers.getContractFactory("Maximillion")

        if (!this.addresses.maximillion) {
            assert(this.addresses.peth)
            this.contracts.maximillion = await Maximillion.deploy(this.addresses.peth)
            this._logDeployedContract("maximillion")
        } else {
            this.contracts.maximillion = await Maximillion.attach(this.addresses.maximillion)
        }

        assert(await this.contracts.maximillion.pEther() === this.addresses.peth)
    }

    async _loadPriceOracle() { // mock
        const PriceOracle = await ethers.getContractFactory("SimplePriceOracle")

        if (!this.addresses.oracle) {
            this.contracts.oracle = await PriceOracle.deploy()
            this._logDeployedContract("oracle", "SimplePriceOracle")
            await this._loadTestPrices()
        } else {
            this.contracts.oracle = await PriceOracle.attach(this.addresses.oracle)
        }

        await this._verifyPriceOracle()
    }

    async _loadTestPrices() {
        assert(this.contracts.oracle)

        // 10 ** (36 - underlying_asset_decimals) == 1 USD
        if (this.addresses['peth']) await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingPrice(this.addresses.peth, '1000000000000000000'), "oracle.setUnderlyingPrice(peth)")
        if (this.addresses['ppbx']) await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingPrice(this.addresses.ppbx, '1000000000000000000'), "oracle.setUnderlyingPrice(ppbx)")
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingPrice(this.addresses.pwbtc, '10000000000000000000000000000'), "oracle.setUnderlyingPrice(pwbtc)")
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingPrice(this.addresses.pdai, '1000000000000000000'), "oracle.setUnderlyingPrice(pdai)")
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingPrice(this.addresses.pusdc, '1000000000000000000000000000000'), "oracle.setUnderlyingPrice(pusdc)")
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingPrice(this.addresses.pweth, '1000000000000000000'), "oracle.setUnderlyingPrice(pweth)")
    }

    async _loadSetttings() {
        assert(this.contracts.unitroller)

        // ptoken._setReserveFactor
        await this._handleTxIfNeeded(() => this.contracts.pdai._setReserveFactor(tokens('0.075')), "pdai._setReserveFactor")
        await this._handleTxIfNeeded(() => this.contracts.pwbtc._setReserveFactor(tokens('0.2')), "pwbtc._setReserveFactor")
        await this._handleTxIfNeeded(() => this.contracts.pusdc._setReserveFactor(tokens('0.075')), "pusdc._setReserveFactor")
        await this._handleTxIfNeeded(() => this.contracts.pweth._setReserveFactor(tokens('0.2')), "pweth._setReserveFactor")

        // unitroller
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setPBXToken(this.addresses.pbx), "unitroller._setPBXToken")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setPriceOracle(this.addresses.oracle), "unitroller._setPriceOracle")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setLiquidationIncentive(tokens('1.1')), "unitroller._setLiquidationIncentive")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setCloseFactor(tokens('0.5')), "unitroller._setCloseFactor")

        // unitroller._supportMarket
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportMarket(this.addresses.pdai), "unitroller._supportMarket(pdai)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportMarket(this.addresses.pwbtc), "unitroller._supportMarket(pwbtc)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportMarket(this.addresses.pusdc), "unitroller._supportMarket(pusdc)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportMarket(this.addresses.pweth), "unitroller._supportMarket(pweth)")

        // unitroller._setCollateralFactor
        // tokens(collateral_ratio <= 0.9)
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setCollateralFactor(this.addresses.pdai, tokens('0.82')), "unitroller._setCollateralFactor(pdai)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setCollateralFactor(this.addresses.pwbtc, tokens('0.7')), "unitroller._setCollateralFactor(pwbtc)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setCollateralFactor(this.addresses.pusdc, tokens('0.82')), "unitroller._setCollateralFactor(pusdc)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setCollateralFactor(this.addresses.pweth, tokens('0.7')), "unitroller._setCollateralFactor(pweth)")

        // pPBX settings
        if (this.addresses['ppbx']) {
            await this._handleTxIfNeeded(() => this.contracts.ppbx._setReserveFactor(tokens('0.2')), "ppbx._setReserveFactor")
            await this._handleTxIfNeeded(() => this.contracts.unitroller._supportMarket(this.addresses.ppbx), "unitroller._supportMarket(ppbx)")
            await this._handleTxIfNeeded(() => this.contracts.unitroller._setCollateralFactor(this.addresses.ppbx, tokens('0.7')), "unitroller._setCollateralFactor(ppbx)")
        }

        // pEther settings
        if (this.addresses['peth']) {
            await this._handleTxIfNeeded(() => this.contracts.peth._setReserveFactor(tokens('0.2')), "peth._setReserveFactor")
            await this._handleTxIfNeeded(() => this.contracts.unitroller._supportMarket(this.addresses.peth), "unitroller._supportMarket(peth)")
            await this._handleTxIfNeeded(() => this.contracts.unitroller._setCollateralFactor(this.addresses.peth, tokens('0.7')), "unitroller._setCollateralFactor(peth)")
        }
    }

    async _finishDeployment() {
        await this._handleTxIfNeeded(() => this.contracts.pbx.mint(this.addresses.unitroller, tokens('10000')), "pbx.mint(unitroller)")
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.allInitialOwnersAssigned(), "cryptopunks.allInitialOwnersAssigned")
    }

    async _transferOwnership(to) {
        await this._handleTxIfNeeded(() => this.contracts.pbx.transferOwnership(to), "pbx.transferOwnership(" + to + ")")
        await this._handleTxIfNeeded(() => this.contracts.wbtc.transferOwnership(to), "wbtc.transferOwnership(" + to + ")")
        await this._handleTxIfNeeded(() => this.contracts.usdc.transferOwnership(to), "usdc.transferOwnership(" + to + ")")
        await this._handleTxIfNeeded(() => this.contracts.usdc.configureMinter(to, tokens('999999999999999')), "usdc.configureMinter(" + to + ")")
        if (this.addresses.link) await this._handleTxIfNeeded(() => this.contracts.link.transferOwnership(to), "link.transferOwnership(" + to + ")")

        const unitroller = await ethers.getContractAt("Unitroller", this.addresses.unitroller)
        await this._handleTxIfNeeded(() => unitroller._setPendingAdmin(to), "unitroller._setPendingAdmin(" + to + ")") // _acceptAdmin
        await this._handleTxIfNeeded(() => this.contracts.pwbtc._setPendingAdmin(to), "pwbtc._setPendingAdmin(" + to + ")") // _acceptAdmin
        await this._handleTxIfNeeded(() => this.contracts.pusdc._setPendingAdmin(to), "pusdc._setPendingAdmin(" + to + ")") // _acceptAdmin
        if (this.addresses.plink) await this._handleTxIfNeeded(() => this.contracts.plink._setPendingAdmin(to), "plink._setPendingAdmin(" + to + ")") // _acceptAdmin
        await this._handleTxIfNeeded(() => this.contracts.peth._setPendingAdmin(to), "peth._setPendingAdmin(" + to + ")") // _acceptAdmin
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
        await this._loadPEther()
        await this._loadPriceOracle()
        await this._loadSetttings()
        await this._loadNftSetttings()
        await this._setupNFTLiquidation()
        await this._finishDeployment()
        await this._playground()
    }

    async _deployNftToken(name, symbol) {
        const Erc721 = await ethers.getContractFactory("ERC721ClaimableMock")
        return Erc721.deploy(name, symbol)
    }

    async _deployCryptoPunksMock() {
        const CryptoPunksMarketMock = await ethers.getContractFactory("CryptoPunksMarketMock")
        return CryptoPunksMarketMock.deploy()
    }

    async _deployPNFTToken(name, symbol, underlyingAssetAddress) {
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
            this.contracts[delegatorKeyName] = await PNFTTokenDelegator.deploy(underlyingAssetAddress, this.addresses.unitroller, name, symbol, owner.address, this.addresses[delegateKeyName], [])
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
        let setImplementation = false

        const delegateKeyName = symbol.toLowerCase() + "_delegate"
        const PCryptoPunksDelegate = await ethers.getContractFactory('PCryptoPunksDelegate')
        const delegatorKeyName = symbol.toLowerCase()
        const PNFTTokenDelegator = await ethers.getContractFactory('PNFTTokenDelegator')

        if (!this.addresses[delegateKeyName]) {
            this.contracts[delegateKeyName] = await PCryptoPunksDelegate.deploy()
            await this.contracts[delegateKeyName].deployed()
            this._logDeployedContract(delegateKeyName, "PCryptoPunksDelegate")
            if (this.addresses[delegatorKeyName])
                setImplementation = true

        } else {
            this.contracts[delegateKeyName] = await PCryptoPunksDelegate.attach(this.addresses[delegateKeyName])
        }

        if (!this.addresses[delegatorKeyName]) {
            assert(this.addresses[delegateKeyName] && this.addresses.unitroller)
            this.contracts[delegatorKeyName] = await PNFTTokenDelegator.deploy(this.addresses.cryptopunks, this.addresses.unitroller, name, symbol, owner.address, this.addresses[delegateKeyName], [])
            await this.contracts[delegatorKeyName].deployed()
            this._logDeployedContract(delegatorKeyName, "PCryptoPunks upgradeable")
        } else {
            this.contracts[delegatorKeyName] = await PNFTTokenDelegator.attach(this.addresses[delegatorKeyName])
        }

        if (setImplementation)
            await this._handleTxIfNeeded(() => this.contracts[delegatorKeyName]._setImplementation(this.addresses[delegateKeyName], false, []), delegatorKeyName + "._setImplementation")

        this.contracts[delegatorKeyName] = await ethers.getContractAt("PNFTTokenInterface", this.addresses[delegatorKeyName]) // abi fix
    }

    async _loadNftTokens() {
        if (this.addresses.erc721) this.contracts.erc721 = await ethers.getContractAt("ERC721ClaimableMock", this.addresses.erc721)
        else {
            assert(!this._isPTokenDeployed("perc721"))
            this.contracts.erc721 = await this._deployNftToken("Erc721Mock", "E721M")
            this._logDeployedContract("erc721", "ERC721ClaimableMock")
        }

        if (this.addresses.cryptopunks) this.contracts.cryptopunks = await ethers.getContractAt("CryptoPunksMarketMock", this.addresses.cryptopunks)
        else {
            assert(!this._isPTokenDeployed("pcryptopunks"))
            this.contracts.cryptopunks = await this._deployCryptoPunksMock()
            this._logDeployedContract("cryptopunks", "CryptoPunksMarketMock")
        }
    }

    async _loadPNftTokens() {
        const PErc721 = await ethers.getContractFactory("PErc721")

        if (!this._isPTokenDeployed("perc721")) {
            assert(this.addresses.erc721)
            await this._deployPNFTToken('pToken Erc721Mock', 'pErc721', this.addresses.erc721)
        } else {
            this.contracts.perc721 = await PErc721.attach(this.addresses.perc721)
        }

        if (!this._isPTokenDeployed("pcryptopunks")) {
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
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 5, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,5)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 6, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,6)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 7, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,7)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 8, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,8)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 9, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,9)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 10, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,10)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 11, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,11)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 12, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,12)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 100, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,100)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 101, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,101)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 102, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,102)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 103, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,103)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 104, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,104)") // 100 USD

        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 0, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,0)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 1, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,1)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 2, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,2)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 3, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,3)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 4, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,4)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 5, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,5)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 6, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,6)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 7, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,7)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 8, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,8)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 9, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,9)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 100, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,100)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 101, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,101)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 102, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,102)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 103, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,103)") // 100 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 104, '100000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,104)") // 100 USD

        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportNFTMarket(this.addresses.perc721), "unitroller._supportNFTMarket(perc721)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._supportNFTMarket(this.addresses.pcryptopunks), "unitroller._supportNFTMarket(pcryptopunks)")

        await this._handleTxIfNeeded(() => this.contracts.unitroller._setNFTCollateralFactor(this.addresses.perc721, tokens('0.4')), "unitroller._setNFTCollateralFactor(perc721)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setNFTCollateralFactor(this.addresses.pcryptopunks, tokens('0.4')), "unitroller._setNFTCollateralFactor(pcryptopunks)")
    }

    async _setupNFTLiquidation() {
        assert(this.addresses.usdc)
        assert(this.addresses.pusdc)

        const NFTXVaultFactoryMock = await ethers.getContractFactory('NFTXVaultFactoryMock')
        const NFTXMarketplaceZapMock = await ethers.getContractFactory('NFTXMarketplaceZapMock')
        const SudoswapLSSVMRouterMock = await ethers.getContractFactory('LSSVMRouterMock')
        const SudoswapLSSVMPairMock = await ethers.getContractFactory('LSSVMPairMock')

        if (this.addresses.sudoswapLSSVMRouterMock) this.contracts.sudoswapLSSVMRouterMock = await SudoswapLSSVMRouterMock.attach(this.addresses.sudoswapLSSVMRouterMock)
        else {
            assert(!this.addresses.unitroller__setSudoswapPairRouterAddress)
            this.contracts.sudoswapLSSVMRouterMock = await SudoswapLSSVMRouterMock.deploy();
            this._logDeployedContract("sudoswapLSSVMRouterMock", "SudoswapLSSVMRouterMock")
        }

        if (this.addresses.sudoswapLSSVMPairMock_perc721) this.contracts.sudoswapLSSVMPairMock_perc721 = await SudoswapLSSVMPairMock.attach(this.addresses.sudoswapLSSVMPairMock_perc721)
        else {
            assert(this.addresses.erc721)
            assert(!this.addresses.perc721__setSudoswapLSSVMPairAddress)
            this.contracts.sudoswapLSSVMPairMock_perc721 = await SudoswapLSSVMPairMock.deploy(this.addresses.erc721, this.addresses.usdc, false);
            this._logDeployedContract("sudoswapLSSVMPairMock_perc721", "SudoswapLSSVMPairMock")
        }

        if (this.addresses.sudoswapLSSVMPairMock_pcryptopunks) this.contracts.sudoswapLSSVMPairMock_pcryptopunks = await SudoswapLSSVMPairMock.attach(this.addresses.sudoswapLSSVMPairMock_pcryptopunks)
        else {
            assert(this.addresses.cryptopunks)
            assert(!this.addresses.pcryptopunks__setSudoswapLSSVMPairAddress)
            this.contracts.sudoswapLSSVMPairMock_pcryptopunks = await SudoswapLSSVMPairMock.deploy(this.addresses.cryptopunks, this.addresses.usdc, true);
            this._logDeployedContract("sudoswapLSSVMPairMock_pcryptopunks", "SudoswapLSSVMPairMock")
        }

        if (this.addresses.nftxVaultFactoryMock) this.contracts.nftxVaultFactoryMock = await NFTXVaultFactoryMock.attach(this.addresses.nftxVaultFactoryMock)
        else {
            assert(!this.addresses.nftxMarketplaceZap)
            this.contracts.nftxVaultFactoryMock = await NFTXVaultFactoryMock.deploy();
            this._logDeployedContract("nftxVaultFactoryMock", "NFTXVaultFactoryMock")
        }

        if (this.addresses.nftxMarketplaceZap) this.contracts.nftxMarketplaceZap = await NFTXMarketplaceZapMock.attach(this.addresses.nftxMarketplaceZap)
        else {
            this.contracts.nftxMarketplaceZap = await NFTXMarketplaceZapMock.deploy(this.addresses.cryptopunks, this.addresses.nftxVaultFactoryMock);
            this._logDeployedContract("nftxMarketplaceZap", "NFTXMarketplaceZapMock")
        }

        await this._handleTxIfNeeded(() => this.contracts.nftxVaultFactoryMock.setNFTAsset(42, this.addresses.cryptopunks), "nftxVaultFactoryMock.setNFTAsset(42,cryptopunks)")
        await this._handleTxIfNeeded(() => this.contracts.nftxVaultFactoryMock.setNFTAsset(43, this.addresses.erc721), "nftxVaultFactoryMock.setNFTAsset(43,erc721)")

        await this._handleTxIfNeeded(() => this.contracts.unitroller._setNFTLiquidationExchangePToken(this.addresses.pusdc), "unitroller._setNFTLiquidationExchangePToken")
        await this._handleTxIfNeeded(() => this.contracts.usdc.mint(this.addresses.nftxMarketplaceZap, '100000000000000000000'), "usdc.mint(nftxMarketplaceZap)")
        await this._handleTxIfNeeded(() => this.contracts.usdc.mint(this.addresses.sudoswapLSSVMPairMock_pcryptopunks, '100000000000000000000'), "usdc.mint(sudoswapLSSVMPairMock_pcryptopunks)")
        await this._handleTxIfNeeded(() => this.contracts.usdc.mint(this.addresses.sudoswapLSSVMPairMock_perc721, '100000000000000000000'), "usdc.mint(sudoswapLSSVMPairMock_perc721)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setNFTXioMarketplaceZapAddress(this.addresses.nftxMarketplaceZap), "unitroller._setNFTXMarketplaceZapAddress")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setSudoswapPairRouterAddress(this.addresses.sudoswapLSSVMRouterMock), "unitroller._setSudoswapPairRouterAddress")

        await this._handleTxIfNeeded(() => this.contracts.unitroller._setNFTCollateralLiquidationBonusPBX(tokens('1.05')), "unitroller._setNFTCollateralLiquidationBonusPBX")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setNFTCollateralLiquidationIncentive(tokens('1.05')), "unitroller._setNFTCollateralLiquidationIncentive")
        await this._handleTxIfNeeded(() => this.contracts.unitroller._setNFTCollateralSeizeLiquidationFactor(tokens('0.8')), "unitroller._setNFTCollateralSeizeLiquidationFactor")

        await this._handleTxIfNeeded(() => this.contracts.pcryptopunks._setNFTXioVaultId(42), "pcryptopunks._setNFTXVaultId")
        await this._handleTxIfNeeded(() => this.contracts.perc721._setNFTXioVaultId(43), "perc721._setNFTXVaultId")

        await this._handleTxIfNeeded(() => this.contracts.pcryptopunks._setSudoswapLSSVMPairAddress(this.addresses.sudoswapLSSVMPairMock_pcryptopunks), "pcryptopunks._setSudoswapLSSVMPairAddress")
        await this._handleTxIfNeeded(() => this.contracts.perc721._setSudoswapLSSVMPairAddress(this.addresses.sudoswapLSSVMPairMock_perc721), "perc721._setSudoswapLSSVMPairAddress")
    }

    async _playground() {
        console.log('-------------------------------------------------------------------------')

        const [owner, user1] = await ethers.getSigners()
        const kamil = '0x2446bBaBB0f61D900977634842798478CcF0A8bb'
        const maciej = '0x9e8258ede5e00E7DffB9F35BBF4001DF98B6cE23'
        const michal = '0x58706d647ADfeF76818145F91D91DE2F5425228b'

        await this.contracts.cryptopunks.deployed()

        // MINT STANDARD TOKENS
        await this._handleTxIfNeeded(() => this.contracts.usdc.mint(owner.address, tokens('10000', 6)), "usdc.mint(owner)")
        await this._handleTxIfNeeded(() => this.contracts.usdc.mint(maciej, tokens('1000', 6)), "usdc.mint(maciej)")
        await this._handleTxIfNeeded(() => this.contracts.usdc.mint(michal, tokens('1000', 6)), "usdc.mint(michal)")

        await this._handleTxIfNeeded(() => this.contracts.dai.mint(owner.address, tokens('10000')), "dai.mint(owner)")
        await this._handleTxIfNeeded(() => this.contracts.dai.mint(user1.address, tokens('10000')), "dai.mint(user1)")
        await this._handleTxIfNeeded(() => this.contracts.dai.mint(maciej, tokens('1000')), "dai.mint(maciej)")
        await this._handleTxIfNeeded(() => this.contracts.dai.mint(michal, tokens('1000')), "dai.mint(michal)")

        await this._handleTxIfNeeded(() => this.contracts.wbtc.mint(owner.address, tokens('10000', 8)), "wbtc.mint(owner)")
        await this._handleTxIfNeeded(() => this.contracts.wbtc.mint(maciej, tokens('1000', 8)), "wbtc.mint(maciej)")
        await this._handleTxIfNeeded(() => this.contracts.wbtc.mint(michal, tokens('1000', 8)), "wbtc.mint(michal)")

        // MINT NFTs
        await this._handleTxIfNeeded(() => this.contracts.erc721.claim(maciej, 0), "erc721.claim(0)")
        await this._handleTxIfNeeded(() => this.contracts.erc721.claim(maciej, 1), "erc721.claim(1)")
        await this._handleTxIfNeeded(() => this.contracts.erc721.claim(maciej, 2), "erc721.claim(2)")
        await this._handleTxIfNeeded(() => this.contracts.erc721.claim(maciej, 3), "erc721.claim(3)")
        await this._handleTxIfNeeded(() => this.contracts.erc721.claim(maciej, 4), "erc721.claim(4)")

        await this._handleTxIfNeeded(() => this.contracts.erc721.claim(michal, 100), "erc721.claim(100)")
        await this._handleTxIfNeeded(() => this.contracts.erc721.claim(michal, 101), "erc721.claim(101)")
        await this._handleTxIfNeeded(() => this.contracts.erc721.claim(michal, 102), "erc721.claim(102)")
        await this._handleTxIfNeeded(() => this.contracts.erc721.claim(michal, 103), "erc721.claim(103)")
        await this._handleTxIfNeeded(() => this.contracts.erc721.claim(michal, 104), "erc721.claim(104)")

        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.getPunk(0), "cryptopunks.getPunk(0)")
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.getPunk(1), "cryptopunks.getPunk(1)")
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.getPunk(2), "cryptopunks.getPunk(2)")
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.getPunk(3), "cryptopunks.getPunk(3)")
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.getPunk(4), "cryptopunks.getPunk(4)")

        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.getPunk(100), "cryptopunks.getPunk(100)")
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.getPunk(101), "cryptopunks.getPunk(101)")
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.getPunk(102), "cryptopunks.getPunk(102)")
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.getPunk(103), "cryptopunks.getPunk(103)")
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.getPunk(104), "cryptopunks.getPunk(104)")

        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.transferPunk(maciej, 0), "cryptopunks.transferPunk(0)")
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.transferPunk(maciej, 1), "cryptopunks.transferPunk(1)")
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.transferPunk(maciej, 2), "cryptopunks.transferPunk(2)")
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.transferPunk(maciej, 3), "cryptopunks.transferPunk(3)")
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.transferPunk(maciej, 4), "cryptopunks.transferPunk(4)")

        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.transferPunk(michal, 100), "cryptopunks.transferPunk(100)")
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.transferPunk(michal, 101), "cryptopunks.transferPunk(101)")
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.transferPunk(michal, 102), "cryptopunks.transferPunk(102)")
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.transferPunk(michal, 103), "cryptopunks.transferPunk(103)")
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.transferPunk(michal, 104), "cryptopunks.transferPunk(104)")

        await this._handleTxIfNeeded(() => this.contracts.erc721.claim(owner.address, 5), "erc721.claim(0)")
        await this._handleTxIfNeeded(() => this.contracts.erc721.claim(owner.address, 6), "erc721.claim(1)")

        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.getPunk(5), "cryptopunks.getPunk(5)")
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.getPunk(6), "cryptopunks.getPunk(6)")

        // OWNER SUPPLY
        await this._handleTxIfNeeded(() => this.contracts.unitroller.enterMarkets([this.addresses.pwbtc, this.addresses.pusdc, this.addresses.pdai]), "unitroller.enterMarkets")
        await this._handleTxIfNeeded(() => this.contracts.usdc.approve(this.addresses.pusdc, REPAY_MAX), "usdc.approve(pusdc)")
        await this._handleTxIfNeeded(() => this.contracts.pusdc.mint(tokens('1000', 6)), "pusdc.mint")

        await this._handleTxIfNeeded(() => this.contracts.dai.approve(this.addresses.pdai, REPAY_MAX), "dai.approve(pdai)")
        await this._handleTxIfNeeded(() => this.contracts.pdai.mint(tokens('1000')), "pdai.mint")

        await this._handleTxIfNeeded(() => this.contracts.wbtc.approve(this.addresses.pwbtc, REPAY_MAX), "wbtc.approve(pwbtc)")
        await this._handleTxIfNeeded(() => this.contracts.pwbtc.mint(tokens('1000', 8)), "pwbtc.mint")

        // user1 SUPPLY PUNK#5 NFT
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.transferPunk(user1.address, 5), "cryptopunks.transferPunk(5)")
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.transferPunk(user1.address, 6), "cryptopunks.transferPunk(6)")
        await this._handleTxIfNeeded(() => this.contracts.unitroller.connect(user1).enterNFTMarkets([this.addresses.pcryptopunks, this.addresses.perc721]), "unitroller.connect(user1).enterNFTMarkets")
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.connect(user1).offerPunkForSaleToAddress(5, 0, this.addresses.pcryptopunks), "cryptopunks.connect(user1).offerPunkForSaleToAddress(5)")
        await this._handleTxIfNeeded(() => this.contracts.pcryptopunks.connect(user1).mint(5), "pcryptopunks.connect(user1).mint(5)")

        // user1 BORROW WBTC
        await this._handleTxIfNeeded(() => this.contracts.pwbtc.connect(user1).borrow(tokens('35', 8)), "pwbtc.connect(user1).borrow(90)") // 35 USD

        // CHANGE PUNK#5 NFT PRICE
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 5, '50000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,5)_2xx") // 50 USD

        // OWNER LIQUIDATE USER 1 PUNK#5 COLLATERAL
        await this._handleTxIfNeeded(() => this.contracts.pcryptopunks.liquidateCollateral(user1.address, 5), "pcryptopunks.liquidateCollateral(5)")

        // user1 SUPPLY PUNK#6 NFT
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.connect(user1).offerPunkForSaleToAddress(6, 0, this.addresses.pcryptopunks), "cryptopunks.connect(user1).offerPunkForSaleToAddress(6)")
        await this._handleTxIfNeeded(() => this.contracts.pcryptopunks.connect(user1).mint(6), "pcryptopunks.connect(user1).mint(6)")

        // user1 SUPPLY PUNK#7 NFT
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.connect(user1).getPunk(7), "cryptopunks.connect(user1).getPunk(7)")
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.connect(user1).offerPunkForSaleToAddress(7, 0, this.addresses.pcryptopunks), "cryptopunks.connect(user1).offerPunkForSaleToAddress(7)")
        await this._handleTxIfNeeded(() => this.contracts.pcryptopunks.connect(user1).mint(7), "pcryptopunks.connect(user1).mint(7)")

        // user1 SUPPLY PUNK#8 NFT
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.connect(user1).getPunk(8), "cryptopunks.connect(user1).getPunk(8)")
        await this._handleTxIfNeeded(() => this.contracts.cryptopunks.connect(user1).offerPunkForSaleToAddress(8, 0, this.addresses.pcryptopunks), "cryptopunks.connect(user1).offerPunkForSaleToAddress(8)")
        await this._handleTxIfNeeded(() => this.contracts.pcryptopunks.connect(user1).mint(8), "pcryptopunks.connect(user1).mint(8)")

        // user1 SUPPLY ERC721MOCK#10 NFT
        await this._handleTxIfNeeded(() => this.contracts.erc721.claim(user1.address, 10), "erc721.claim(10)")
        await this._handleTxIfNeeded(() => this.contracts.erc721.connect(user1).approve(this.addresses.perc721, 10), "erc721.connect(user1).approve(10)")
        await this._handleTxIfNeeded(() => this.contracts.perc721.connect(user1).mint(10), "perc721.connect(user1).mint(10)")

        // user1 SUPPLY ERC721MOCK#11 NFT
        await this._handleTxIfNeeded(() => this.contracts.erc721.claim(user1.address, 11), "erc721.claim(11)")
        await this._handleTxIfNeeded(() => this.contracts.erc721.connect(user1).approve(this.addresses.perc721, 11), "erc721.connect(user1).approve(11)")
        await this._handleTxIfNeeded(() => this.contracts.perc721.connect(user1).mint(11), "perc721.connect(user1).mint(11)")

        // user1 SUPPLY ERC721MOCK#12 NFT
        await this._handleTxIfNeeded(() => this.contracts.erc721.claim(user1.address, 12), "erc721.claim(12)")
        await this._handleTxIfNeeded(() => this.contracts.erc721.connect(user1).approve(this.addresses.perc721, 12), "erc721.connect(user1).approve(12)")
        await this._handleTxIfNeeded(() => this.contracts.perc721.connect(user1).mint(12), "perc721.connect(user1).mint(12)")

        // CHANGE NFT PRICE
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 6, '20000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,6)_2") // 20 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 7, '20000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,7)_2") // 20 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 8, '20000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,8)_2") // 20 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 10, '20000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,10)_2") // 20 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 11, '20000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,11)_2") // 20 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 12, '20000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,12)_2") // 20 USD

        // user1 BORROW WBTC
        await this._handleTxIfNeeded(() => this.contracts.pwbtc.connect(user1).borrow(tokens('35', 8)), "pwbtc.connect(user1).borrow(40)_2") // 35 USD

        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 6, '5000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,6)_3") // 5 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 7, '5000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,7)_3") // 5 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.pcryptopunks, 8, '5000000000000000000'), "oracle.setUnderlyingNFTPrice(pcryptopunks,8)_3") // 5 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 10, '5000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,10)_3") // 5 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 11, '5000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,11)_3") // 5 USD
        await this._handleTxIfNeeded(() => this.contracts.oracle.setUnderlyingNFTPrice(this.addresses.perc721, 12, '5000000000000000000'), "oracle.setUnderlyingNFTPrice(perc721,12)_3") // 5 USD
    }
}


module.exports = {
    DeployerRegtest,
    DeployerNFT
}

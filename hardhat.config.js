require('@nomicfoundation/hardhat-toolbox')
require('hardhat-contract-sizer')

module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.6.12",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            },
            {
                version: "0.5.17",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            },
            {
                version: "0.4.17",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            }
        ]
    },
    defaultNetwork: process.env.NETWORK,
    networks: {
        hardhat: {
            accounts: {
                accountsBalance: "1000000000000000000000"
            },
            allowUnlimitedContractSize: true
        },
        ganache: {
            url: "http://127.0.0.1:9545",
            accounts: {
                mnemonic: 'kitten similar lonely fly point puzzle radio beef casino shed once lend'
            }
        },
        rinkeby: {
            url: "https://rinkeby.infura.io/v3/" + "",
            timeout: 200000,
            // gasMultiplier: 10,
            // gas: 2500000,
            accounts: {
              mnemonic: ''
            }
        },
        goerli: {
            url: "https://goerli.infura.io/v3/" + "",
            timeout: 200000,
            // gasMultiplier: 10,
            // gasPrice: 500000000000,
            accounts: {
                mnemonic: ''
            }
        },
        arbitrumTestnet: {
            url: "https://rinkeby.arbitrum.io/rpc",
            timeout: 200000,
            gas: 2051258,
            accounts: {
              mnemonic: ''
            }
        },
        mumbai: {
            url: 'https://polygon-mumbai.g.alchemy.com/v2/' + "",
            timeout: 200000,
            accounts: {
              mnemonic: ''
            }
        }
    },
    mocha: {
        timeout: 60000
    },
    contractSizer: {
        disambiguatePaths: false
    },
    gasReporter: {
        currency: 'ETH',
        enabled: !!(process.env.HARDHAT_REPORT_GAS)
    },
    abiExporter: {
        runOnCompile: true,
        clear: true,
        flat: true,
        spacing: 4,
        except: ["@openzeppelin", "synthetix", "@chainlink", "Pausable", "Ownable", "BasicToken", "ERC20", "StandardToken"],
        pretty: false,
    }
}

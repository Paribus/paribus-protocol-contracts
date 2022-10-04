const {ethers} = require("hardhat")
const {DeployerRegtest, DeployerRinkeby, DeployerRinkarby, DeployerNFT, DeployerDemoEnvGoerli, DeployerMumbaiPriceOracleOnly} = require("./deployer")
const {tokens} = require("../../test/utils/testHelpers")
const assert = require("assert")
const {deployNEW_NFTEnv} = require("./deployOld");


async function deployGoerliDemoEnvInternal() {
    let addressesNew = {
        pbx: '0x7923bB0d406311eae3DdAc869fbAfE7a483608C4', // PBXTestTokenMintable
        wbtc: '0x2511cBfcb3a4581C128dD6e0196a618f25E1a10B',
        usdc: '0x06698e5d51bd05Eb3551a7Cf9DcA881aB069A9Ba',
        usdc_initialize: '0xbf91ae4e35a81765f780cfb26696c5cdfd1897db53824c932122c02012c537f6',
        usdc_configureMinter: '0xb8b3ce829724f65a648dfe8117010b2248cf7bf04db72be8390285931a1905d1',
        link: '0x6E3c9208bA7D4e6950DC540a483976774Cf00D77', // ERC20TokenMock
        unitroller: '0xf6A4bAa0Ce3f33985caE4650b521201095529fA8',
        comptroller_part1: '0x592E96aa4d26F50bE8980b9618068dAb3503E76B',
        comptroller_part2: '0x9Ce1c1f3582b7B7E9CBEA93F20126718c3F31a08',
        unitroller__setPendingImplementations: '0xb759283b5c317415c000a9861a9ccd5c7d3f5bbc9a231419fd59695aa04e2772',
        comptroller_part1__become: '0xcb6993a61fe342e4d67a3a856a0dd9184274cf4b2124af76460762ac190adb73',
        comptroller_part2__become: '0xb033e606d3dcedd213d828015d1753ede293f35444c106fb45c2035471e3fc0c',
        jrmStableCoin: '0xaeC6fe60D2E63ed198E87B108185C208C06151eC', // JumpRateModelV2
        jrmEth: '0xef9A6011fd5cDcCD782094494C0394bd5BF18f4A', // JumpRateModelV2
        jrmWbtc: '0x5F16Ead1F2a945AE3D25cCa296ca57528Ab4bDf8', // JumpRateModelV2
        jrmLink: '0xBaf5bfb0072Df4bAF28867bF5401BfC304770154', // JumpRateModelV2
        pwbtc_delegate: '0xAA97b9F6751c623bB6Ec1437fe33f787fE858e16', // PErc20Delegate
        pwbtc: '0xbd56D58077D573240811aF117d73726f5fD561D5', // PErc20Delegator upgradeable
        pusdc_delegate: '0x62604E90161fDCEeeB4147c0D7cF61903A526875', // PErc20Delegate
        pusdc: '0x851De5d6EBF9b48B278c48D17Bf9B9d375BcC106', // PErc20Delegator upgradeable
        plink_delegate: '0xf12e620882Ca0D28BeC74b3a39AFFc21D786c357', // PErc20Delegate
        plink: '0xa08906C1F0390945C8e2D3021C3712662eF55Be7', // PErc20Delegator upgradeable
        peth: '0x9517c419f5b9A9C7e876B066543d36d798c23fDD',
        maximillion: '0xC23Ab08Af4f1121346c1d12443bdABB65A3e0d0F',
        oracle: '0x70e1a210ac6bBEB54173E4F00b63699Dab22829d', // GoerliPriceOracle
        pwbtc__setReserveFactor: '0x71cb083cb7d0069cc0871d50b159746297281eca2c6be8b296ef30a213c735ff',
        plink__setReserveFactor: '0xab7510fae60b989aba0679b8664ebbf6964cf6f9e71337429ecf9eadc837cd09',
        pusdc__setReserveFactor: '0xc684a47e4e84b56619b3bcf643ce801daa1da16b092835597f77de204391000a',
        unitroller__setPBXToken: '0xd7ebb5f9b6df514f18fee89d7a9e8daf76b6475bbfe875a23619d82f3fc1cb2b',
        unitroller__setPriceOracle: '0xb36beea6c88e8ef50233d73b64debf28b0af0d16c4caf896e10710f9a91f115f',
        unitroller__setLiquidationIncentive: '0xbdf0774ae6f3ef08975f5c63ddcde00701659c4e4e1609e1477ce8aa8f86aeb8',
        unitroller__setCloseFactor: '0xdfe6555c9f36417d7aab200c9fcbeaf767e3a868ac69fe9bdad49777534671c1',
        unitroller__supportMarket_pwbtc_: '0x38b7d0d4d0e5d5d088a334585821837f6b8ff6ef6c7f6cf1d9879648b89e2cdd',
        unitroller__supportMarket_pusdc_: '0x683b49eab58d2abd6343896571d468a8f5ad85bb1ca1760ccddcc97af7cdb93d',
        unitroller__supportMarket_plink_: '0xea2f21f610a8374eb9b8206663b7b0023d34abfda515371934b7366aadda86ab',
        unitroller__setCollateralFactor_pwbtc_: '0xdbccbfa4ef73a0c48c3a75425183911cc0df8a691c5640d1d34e7183a30c9abb',
        unitroller__setCollateralFactor_plink_: '0x299a361d414eadc682568724353b9dd6df6ee75d72e319ce58e67013908f3ffb',
        unitroller__setCollateralFactor_pusdc_: '0x060bf16621fe4cdcb6713f7e0c0c9fe4c62af2e5332b30a6f93fe37b15fe5164',
        peth__setReserveFactor: '0xabddeb601b3811e9f857e099b394651bdbbbb8bcd6e0b086af83fab50f3db46a',
        unitroller__supportMarket_peth_: '0x44b7518b3d2121959b0748a560f4990b31d79a6972e9ddd1dc93412a0ca46895',
        unitroller__setCollateralFactor_peth_: '0xb2df0788cfdfad21884f1dcb474981f7117f447a96f759bd750ad901b4de6eb0',
        pbx_mint_unitroller_: '0x9da941ab8526b5a272a3bedfc8a106bc18cd0397ad9427afd0aa068f4e2d2b44',
        wbtc_mint_owner_: '0x26817533314d300d610aba2b4cc9ebbc119d22e95e94ab23ed72fc98fdc922b1',
        usdc_mint_owner_: '0x54cc5fa32c5046832d55ee78614b5b4dfd8757b4e4566e5bd4b823333a603967',
        link_mint_owner_: '0x622cec4907f32cb31dc94fd68512fb66f7de7574c06e904157e5f05192e94471',
        wbtc_mint_maciej_: '0x2f8f2b8b2f4a7d644783af2694f78badd3f07d55de340f0fbe5d40f7a4b6c8bb',
        usdc_mint_maciej_: '0x328f0ac15fadf4c80234bde38b95d74f4a7480662e3a386cf47b18b15d18c01b',
        link_mint_maciej_: '0x2445bdb732188d3dc42da2fe7589b4f3cd75cc39f8806f6649ba3fe865b4677b',
        usdc_mint_owner_2: '0x40fa8b352b7632b2fdb4f8b8cd7ed60363ce48a8b7b656e9c86cc2ded4384d3f',
        // OH NO
        pbx_transferOwnership_simon_: '0x667edc182c123bb78a59a3d50f07874054e16494250944e52913d83f7337de65',
        wbtc_transferOwnership_simon_: '0xaa370922f02e1b80057e7bf359e998eb697a6308d34a0d114a3ec0b03e9a0ada',
        usdc_transferOwnership_simon_: '0x8921b84aa94dcdfdbd2eb65c799ded18fb29c5846a12cd909fa6c2b9d94584fd',
    }


    let deployer = new DeployerDemoEnvGoerli(addressesNew)
    await deployer.deploy()
}

async function deployGoerliDemoEnvPublic() {
    let addressesPublic = {
        pbx: '0xbFb5750abb97c7799e43787a88337571A8a5e6aa', // PBXTestTokenMintable
        wbtc: '0x348AF93fa489a2CdA7B3D75B8D17DC1f3cE0dDe7',
        usdc: '0x4EA2749E7220C885D278d93217dBFBa7c094eDA5',
        usdc_initialize: '0xbebdced9928e74f45ae8e1c16df90839c40a515344442de052c5cd0655641601',
        usdc_configureMinter: '0x1fdd383ad47bdb5e203d84bbf417a8a9c0826d29a2d96e886ad596699cf490d4',
        link: '0x4CE552207d863b39cB07CB33Fa6EC8D158044167', // ERC20TokenMock

        unitroller: '0x7051a3e2B79fb0a2a4BD6ae5DeC67811aCBfEAFC',
        comptroller_part1: '0x8830a99EB043F136A6B8b2057b7084eb05e9a8A7',
        comptroller_part2: '0x85f04189D73785Ef935969b78AD2A9A3A3529F17',
        unitroller__setPendingImplementations: '0xbc6df75917f4298d3e21c16e2d666af0636ad063001107b3e9ed6f9c55b2589e',
        comptroller_part1__become: '0x020bc87f0a4617ef9662ea7439e54898a07ce02e1dce51cb99e5b7ff661f25dd',
        comptroller_part2__become: '0x4dc2d3cd4ac0f23b279d5acbf84bcbec203bcbfb36a47ebcd39e5cbc59fbd889',

        jrmStableCoin: '0x2Ee5aBA2D64660Ee3ffc19D62Aa9c948e6905e6A', // JumpRateModelV2
        jrmEth: '0x75C6F9611236E759DE50E259ed3c84aBf2d6345B', // JumpRateModelV2
        jrmWbtc: '0x6C59C4D46b1Dd71dFA34efc3181b8f72A29E3bC4', // JumpRateModelV2
        jrmLink: '0x45185F0907982b82942cc3014D2C8f1c20e87D54', // JumpRateModelV2

        pwbtc_delegate: '0x0F0a60Ae1F10B9E8377525D07bCd958c9ff1E791', // PErc20Delegate
        pwbtc: '0x2F69629AaD341E97A275293F7BcfC8Ed5DA37BA0', // PErc20Delegator upgradeable
        pusdc_delegate: '0x92d58E6f67FC28Bd765b7D8E5c2de6777e30fcbd', // PErc20Delegate
        pusdc: '0xaD470Ec9EB0b5089f1DA27700a03CDB51A1BF965', // PErc20Delegator upgradeable
        plink_delegate: '0xa8e912773F3d07eBA0704Be1992946652421FB0E', // PErc20Delegate
        plink: '0x5756D09708A227DFfbe26AF43f3b69a047111190', // PErc20Delegator upgradeable
        peth: '0x9997cC006b12D9Cf9cF157086c7b49e65A88ED0F',

        maximillion: '0x17bFB9Ab5B9289e67B52b0186FA0113c1A96e64b',
        oracle: '0xEf47d801a2C15897867CB83bF755D2acc772063A', // GoerliPriceOracle

        pwbtc__setReserveFactor: '0x4f1e04807e98633557315c74b0276d93e8cf4f84588fcfcaeef101f291f00aae',
        plink__setReserveFactor: '0x8d1a9dc00e59e3e615c4de6bd4177211892febb8f2b3d35a58dbcf9509c20b64',
        pusdc__setReserveFactor: '0x79a91d1fe4822aeba31687f4010c8b76b242d23f5a078a4711daac63d46992e1',
        unitroller__setPBXToken: '0xce168779efad07f7ec34fd3135b0d76bad11480366b60cf264bea37617655c72',
        unitroller__setPriceOracle: '0x590b6ebee7b8745118bfe5154e3577fcb24cacae3938f429328fc4e449d9b990',
        unitroller__setLiquidationIncentive: '0x4647a7241fef0f58ff2c22b1777f60be0348f1613f8a40b0f6e1c60df6dc28ac',
        unitroller__setCloseFactor: '0x91793dd6c6a16c9c726ef88184b2d91d251c6b4f28b34b258fbbb6b7a0937cd7',
        unitroller__supportMarket_pwbtc_: '0xd8648e9bdf6aab70fcb65ae7578442f0a19e90ae5204da84b96dd0ce0366b12c',
        unitroller__supportMarket_pusdc_: '0x347e660d67d849f68ca96e23cf3d620bf2ba60d3aa4ccadc2d87c3e3324436b3',
        unitroller__supportMarket_plink_: '0xb9b561c64261218764b1518f01c4ea7378fa5486a3dec49f8258fa0a386e21f9',
        unitroller__setCollateralFactor_pwbtc_: '0x3ed5199c30ee97da8cc02d4cfbc3b752c06ed760c703bb9893170d627263e80a',
        unitroller__setCollateralFactor_plink_: '0xe5dc5320e2f1a5e090668823e95f48f4ef5339cedba01f837f17fd67bc57dba7',
        unitroller__setCollateralFactor_pusdc_: '0xfd61119ea280f87e85daf72c9ebe7099960e4f12c583630715f6196d7b58a5ba',
        peth__setReserveFactor: '0x0e7ebfbdcf468bb9412ab4012b3bc018b385044fbbf31d5b43e7e6648332be90',
        unitroller__supportMarket_peth_: '0xe51f84e11065c440eccfdc8573f01dd3542f52a56e3e6dbc3efc01976a672bdb',
        unitroller__setCollateralFactor_peth_: '0x3144ee5048ceb02cd2dc0ad0d7cd71dad2ef3ff4b5a0b0f059631d5376fabc43',

        pbx_mint_unitroller_: '0x7bcbaa5f1cf257371d5cd22f50cd584581163a869e6e8cfd04d3902dd67d0814',
        wbtc_mint_owner_: '0xccf735424ca20afc1be3f5b270719d9e2044d0a0dbde5cb2c6daae9190cfa831',
        usdc_mint_owner_: '0x84349e9c6e590eaee60a3f0b3d1ee934d97c87041b190e2f033d8ae3ccc39ae2',
        link_mint_owner_: '0x74564a7e3acf9c5c1d6993e529efc10f2985734d5e20c5a6a8bba91cc280dd02',
        wbtc_mint_simon_: '0x694c0aa4d651fe847f8845a7a36b13b51ef5badd2722ef2f14b62bed845a7901',
        usdc_mint_simon_: '0x8c34346890aa2eb51c8236d70a1915ad7ff951e89a23ba9a78da64705519f60d',
        link_mint_simon_: '0x909820cb676a4cfb4da04ed621fd1c1f2abc1f32bcb403bbc94cf59b24d3735c',
        pbx_transferOwnership_simon_: '0x130f1d4c0bb0f3641490b6bdfbc732471f5881a19fab2d51d9a3ab6230a20d41',
        wbtc_transferOwnership_simon_: '0x11f69812f7ce322f3f050a5aec7d310c52385d881493bd63e449a114ee318917',
        usdc_transferOwnership_simon_: '0xb76f07129f04ee203978bbce928e6ac024945e8c51546b6abefe99ef09f7f47e',
        link_transferOwnership_simon_: '0xf836ff9080bffd69dcb50363b2d03bdc2c6e9796d1d1d17c9a5384763c453f64',
        unitroller__setPendingAdmin_simon_: '0x938f2c02c558a3cc22b35a3a02d426950943568c72c5eb980f674a326215d111',
        pwbtc__setPendingAdmin_simon_: '0x3fa2311c850a7bd04a01a8017fcbfe12bc8cfc0ed5314ce5bd2a7a95e4aeced5',
        pusdc__setPendingAdmin_simon_: '0x0c8a9745eb0c468dfcbd4c94ba6c49416b10ac85aff5f5ca319b886f6483a933',
        plink__setPendingAdmin_simon_: '0x0cbe6b69b84182ad83563564ad82c0e06a4f80dc3b4d8759d357282b270ceec6',
        peth__setPendingAdmin_simon_: '0x184320b6a464e5d7ecdf590527f4114924dfb4d06993e0fde6cf075f15cd1b83',
    }


    let deployer = new DeployerDemoEnvGoerli(addressesPublic)
    await deployer.deploy()
}

async function main() {
    // await deployGoerliDemoEnvInternal()
    await deployNEW_NFTEnv()
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })

const {ethers} = require("hardhat")
const {DeployerNFT, DeployerRegtest} = require("./deployer")
const {tokens} = require("../../test/utils/testHelpers")
const assert = require("assert")

async function test_deploy_script() {
    console.assert(process.env.NETWORK === 'hardhat')
    let deployer = new DeployerNFT({})
    await deployer.deploy()
}

async function deploy_NFT_TEST() {
    console.assert(process.env.NETWORK === 'mumbai')

    // liquidateSeizeCollateral
    let addresses3 = {
        dai: '0xB4093F46B00CE64881290b46d97C4A67A5bbA3f0',
        wbtc: '0x410795b76a104503161F41E455E80F1A39FC2976',
        pbx: '0x9BB141eD1B471457F2B5D02b14C45c15E5Fd51f8', // PBXTestTokenMintable
        weth: '0xF4fd1f67eDa70616647183d59B12aB97c9e4E7EF',
        usdc: '0x11bbBe83F55F4524a80FfBe782c47C520010e2bF',
        usdc_initialize: '0x348ea82ee28ec0a6c205049e4c2ab989d5b5b1e909eddbae5b99bb162ede7c8d',
        usdc_configureMinter: '0xf8a2a7d4d5bd3823686baefa6bc01c641990a8ed83001847b2753bc33e1a5965',
        erc721: '0x47793702a1663DEcf2eA650a6Af479AD2D6E9C01', // ERC721ClaimableMock
        cryptopunks: '0x88B5052b4FE4aD9f9802504a267b314Cc04e45B8', // CryptoPunksMarketMock
        unitroller: '0xBC2a0650045a2f92f87336F5079F7704260fAB9C',
        comptroller_part1: '0xF8C97528FdED30403c33B29DcB27B6c0b0e0d691',
        comptroller_part2: '0x768998ef0Ec2F7eC69257E2b4f9bC198f171B538',
        unitroller__setPendingImplementations: '0xdcba2841e3d944b6eee7a161edf5cdf6a375981fafc563140b67ac1eaf5fba03',
        comptroller_part1__become: '0x60cd2482169e14b8d913542e66fd667cd166e63e43e26dae7418c253e0464f4b',
        comptroller_part2__become: '0x472c27c4df956466620026bd078ded75ff51034d794ac30500a1041959d670ef',
        jrmStableCoin: '0x228ceD9f432D56470dB37c1A9398898bBe5c82C3', // JumpRateModelV2
        jrmEth: '0x51B19bE71547467019615D8242f93f08205c6885', // JumpRateModelV2
        jrmWbtc: '0x365b2d32d2660DCDC9aF8283fe7bEfaeCED0d926', // JumpRateModelV2
        jrmPbx: '0x56Ea931d786A04908Bf79222b346A0Eb4c5E6450', // JumpRateModelV2
        pdai_delegate: '0x54c668a703d9Ccd57E339da0f637b2BA6Ff60888', // PErc20Delegate
        pdai: '0xc57ca7037B4C5b78Ca1942D00e2c6eE95e0191e5', // PErc20Delegator upgradeable
        ppbx_delegate: '0x5468A1EeAe6Fd4f5B93D591Ad8DF6123C05483ba', // PErc20Delegate
        ppbx: '0x3c092E47D05ED5e37B0f5Fd391685eDC82d66B0D', // PErc20Delegator upgradeable
        pwbtc_delegate: '0xC959D653E1b0b1B265787c505a7662E3fFC9fa87', // PErc20Delegate
        pwbtc: '0x73a952EF88d33F4d6D36257aDE782890Ec9AF16B', // PErc20Delegator upgradeable
        pweth_delegate: '0xCDEfFad36547Fd48E6Fa82147223B5A8a8b23406', // PErc20Delegate
        pweth: '0xC0cf78Ce7a9422916CD0004A8269d87915DF76C7', // PErc20Delegator upgradeable
        pusdc_delegate: '0x719eE21261Fb40F4F6c6f4B81B020C62C394c530', // PErc20Delegate
        pusdc: '0xAA2F88df26c4730D9d42B684a0dfdE928bBD30DC', // PErc20Delegator upgradeable
        perc721_delegate: '0x047CB974C7ada8945E9fBd328ec3784eAD76ed50', // PErc721Delegate
        perc721: '0xCCA9D0fAB4a24A531e99F3b5d2d2CC60678313Dc', // PNFTTokenDelegator upgradeable
        pcryptopunks: '0x749d1b6081aB5fA80501E29322f197aB414fb0C9', // PCryptoPunksImmutable
        peth_delegate: '0x56d73A2B972DeD85F1e029c3c6f2c65D56212e38', // PEtherDelegate
        peth: '0x4555EFBA243f9aB228Dd94ea066d3ddb36dcD94B', // PEtherDelegator upgradeable
        maximillion: '0xf3eFba79fe18B18bB52EfF2aB7A203eEcC0a0E51',
        oracle: '0xD631B1dD2bFa3a9Af98e7a1B8b7DB2B1d9C9F4B2', // SimplePriceOracle
        oracle_setUnderlyingPrice_peth_: '0x7809841af86229c0ba2f6c54deeb67d34b88f588ca668f7df6459f56b4f9913b',
        oracle_setUnderlyingPrice_ppbx_: '0xb6659aeb0abd332df297335b1f938ef75db8949b03bd0df315be69f016d66d36',
        oracle_setUnderlyingPrice_pwbtc_: '0x6508edfb0325c301e187b070f77032cf9b9822c96bb626635dfd3578feb1b28d',
        oracle_setUnderlyingPrice_pdai_: '0x1a7bc14e931dbae85745e638763214294db2afaeb4446078fb4547994bd6e618',
        oracle_setUnderlyingPrice_pusdc_: '0x86d12ae1f2fae5bd59dad3c9eb537de55d0275bc8c1651e21cec90e9414e5c71',
        oracle_setUnderlyingPrice_pweth_: '0x0886b4a0f37edbcacecff245b2c301d8229f9d5185b7ff7726518f4131fbe110',
        unitroller__setPBXToken: '0xd4d2f50370a5b2716597ddf8bb4796ab1c45c8de9015508b2c5f7861c19ec711',
        unitroller__setPriceOracle: '0x99b8d551905f951b5ac9b7ec6fe0eeb45674a6a480909156ba08b334e82a60d5',
        unitroller__setLiquidationIncentive: '0xd3854d461002d8e2e9740452d937a29b7f3f2ef62be1d1fea58010c185d33dbe',
        unitroller__setCloseFactor: '0xe4a6c55ecb65286dc6101d71d793291dde351290ee4fcd790b98381245264395',
        unitroller__supportMarket_pdai_: '0x8cd65bf722c4d997bebd9c93889513dc9465a78924763e32a52997159b3c868a',
        unitroller__supportMarket_pwbtc_: '0x76a8df27a4c82e4d593121e6c78c63a327cb25f3d14dc9d9946da8dade90fdc9',
        unitroller__supportMarket_pusdc_: '0xeda140ab184b2d225470e9a6f4876f0d7546e8065dbfd59e0e5ef4c9e76faf7e',
        unitroller__supportMarket_pweth_: '0xca77965659759ef08df6265cd7bd03c61fefe804ae0a9a6da6fdc70fd02b2d3c',
        unitroller__supportMarket_ppbx_: '0x1736663890e3407bd8ca17006158ece031a7846e156273da3cf16667bde5e966',
        unitroller__supportMarket_peth_: '0x361a089becdbb158d96c46c6a536adc3949147d7459919cc0caeb748afd685c4',
        oracle_setUnderlyingNFTPrice_perc721_0_: '0x5889958edf0f1fd3b12b7a7b9b70119226c587186eb1b06f04fab022d51f2f34',
        oracle_setUnderlyingNFTPrice_perc721_1_: '0x8fc97117a46d3a34233fc631708dc4c2a1c3e12a3a07ebecfbd7d4822fa8973d',
        oracle_setUnderlyingNFTPrice_perc721_2_: '0x4b3369232c7733642f23b58e402670fbefacfde07fd0e76ca4e770cc54b658b5',
        oracle_setUnderlyingNFTPrice_perc721_3_: '0x7923349de0a18ddf01123b9ae47173af1409c2ec1caeea366b7ad5cb9c3e8aa1',
        oracle_setUnderlyingNFTPrice_perc721_4_: '0x4dfa6a3474b643843f85640737dc0e97478b1aaf7a7a4c0c1f944cba10c02c1a',
        oracle_setUnderlyingNFTPrice_perc721_5_: '0xa353fc871a99241985ccd14b055e33d5791c2547a99b66442291c5f559773d89',
        oracle_setUnderlyingNFTPrice_perc721_6_: '0x9aec3b3cbbcb0511e54b67a05991e43b56df5582bb2b8edc1bff9b3744f9835d',
        oracle_setUnderlyingNFTPrice_perc721_7_: '0x4c360d8cba694f00b56eb7fb059da1ed25b7f4197df2d7f21a5a629dc84c165b',
        oracle_setUnderlyingNFTPrice_perc721_8_: '0x2358dee5b7c9fbb8c5bad780ba3f5330c8aa9a87d7cd456ee316e4f35bca8d6b',
        oracle_setUnderlyingNFTPrice_perc721_9_: '0x5576ab83e6422ff8d6c7f992d45e2d2fca4a83891c344d8b5d880de39ba382d2',
        oracle_setUnderlyingNFTPrice_perc721_10_: '0xf74c2ee4595a7cf7e89e63f5b11d30b2feb432b2f8a04f769762f3cb9cf1d537',
        oracle_setUnderlyingNFTPrice_perc721_11_: '0xeab4eed9e136911823977374aeb44018e5b14b3a78ce85c138a018d07a07d213',
        oracle_setUnderlyingNFTPrice_perc721_12_: '0xfec19fe8ed5bb1c667236545b817ca51b21061fb5ba1f51576691cb6ee242dda',
        oracle_setUnderlyingNFTPrice_perc721_100_: '0xd5f801b30b4153114b0e39fdc8b6bef1abc9aed3fae899c1964f71fe5737c9e2',
        oracle_setUnderlyingNFTPrice_perc721_101_: '0x9a6aeba6705e8caf7c774e43b4e3ff4dd654e85d25c7aeffe0357514fd904861',
        oracle_setUnderlyingNFTPrice_perc721_102_: '0xc0513df42fa33375a22c5c1bc40a2dad8a357a72cdf5e8011b0ec248090df75e',
        oracle_setUnderlyingNFTPrice_perc721_103_: '0x6dfa61f8d1ee65cccc8041c9364fa40acaaa235ee0287e8f01771fd279b0a012',
        oracle_setUnderlyingNFTPrice_perc721_104_: '0x83351896f8391929c9f9bd474ce355042492cdc2e69656ee03c1584bdbe25dfd',
        oracle_setUnderlyingNFTPrice_pcryptopunks_0_: '0x2d234fec88699ba4c238b0652aa232b28ca01f469237bc3bdd19d4de58815288',
        oracle_setUnderlyingNFTPrice_pcryptopunks_1_: '0x7f2fc6afad80af19d0416f31c44a627b6b297b24d5e8e17f26ed65b76cf7e680',
        oracle_setUnderlyingNFTPrice_pcryptopunks_2_: '0xdcc7732b3b7bedadd27d89ed0bae7039773a74cd06aae381fb208786f1952ae0',
        oracle_setUnderlyingNFTPrice_pcryptopunks_3_: '0x8d83f55d4fdc7ca9b1d214914ab2c470883d8a382ee8dc7eda4d6c5bf847b87a',
        oracle_setUnderlyingNFTPrice_pcryptopunks_4_: '0x54ed23ec87b2f25ca449338c9ffa50eba126cc45f3a65ed2fed1f2ed2cb48667',
        oracle_setUnderlyingNFTPrice_pcryptopunks_5_: '0x7477b032f7ff549337005ae1e989c196df9110f991a8c1034bbf0ad52d7fef8e',
        oracle_setUnderlyingNFTPrice_pcryptopunks_6_: '0x198ca7e3f70990496cf5d10fdb4cdf78b9a0590212429b179e51da999834230b',
        oracle_setUnderlyingNFTPrice_pcryptopunks_7_: '0x421a75c4147d1a88060945e297be2f82afc68e28ec7d6834f02070ce038b6322',
        oracle_setUnderlyingNFTPrice_pcryptopunks_8_: '0x824f1b8f1b1aef40ba6c143ab17a1decd6e788218eec6be00cef0a87a80be118',
        oracle_setUnderlyingNFTPrice_pcryptopunks_9_: '0xbdbf98a6d30929bbda019ba6d8c239588f5b5e979d9b5c4cc0db0f4aafe8f572',
        oracle_setUnderlyingNFTPrice_pcryptopunks_100_: '0xfeec0d0d877193b9c8528baad02fb97c7f496dfe35450c46af6a2c601f190c83',
        oracle_setUnderlyingNFTPrice_pcryptopunks_101_: '0x9d4268be8df1af13e6b3990021a5d17bb5a43e56f761a5916fe6f7fd12bc47bf',
        oracle_setUnderlyingNFTPrice_pcryptopunks_102_: '0x976b50490932fb4778dd6c85a40d2f148b10fd4887b8c37e66d0450e0cc31520',
        oracle_setUnderlyingNFTPrice_pcryptopunks_103_: '0xd9b23833cc4af460455aa7671066db620943473dba8257af156e498e27775b1b',
        oracle_setUnderlyingNFTPrice_pcryptopunks_104_: '0xe1ba607bb254a438646961949a30bb7be79648cdf1c2e78bcafeb8c535d172cc',
        unitroller__supportNFTMarket_perc721_: '0x4e51b7cc5663de4593965f4b1a9ada2df7fce3df19ba544653bfbfcbb205aabf',
        unitroller__supportNFTMarket_pcryptopunks_: '0x46bdcf052d760686466348d27292430f4efb6587f9c3f902bbc68a687a243317',
        unitroller__setNFTCollateralFactor_perc721_: '0xddb2b7e641274cb4add1a8a121b25c139517fa0bf78c1053b43015e8be267870',
        unitroller__setNFTCollateralFactor_pcryptopunks_: '0x48c9666a6e9143fd3ec24a1aedef33c98baacc8118f4b2513bda72d8d3b3cd97',
        sudoswapLSSVMRouterMock: '0xAbD36eA340DA6e2252c2eFDF30D6101F750e4120', // SudoswapLSSVMRouterMock
        sudoswapLSSVMPairMock_perc721: '0xC455beD08Ee08A8a314a004D102bC307C8d2BebB', // SudoswapLSSVMPairMock
        sudoswapLSSVMPairMock_pcryptopunks: '0xD1d10490e393daa470834e4D6682ad49Ead49280', // SudoswapLSSVMPairMock
        nftxVaultFactoryMock: '0xd1e118804c678A6EFaD4bdb9088cB0b331Bd80be', // NFTXVaultFactoryMock
        nftxMarketplaceZap: '0xBb1D2e4704A876754DF9e02738fc1749E68d33B0', // NFTXMarketplaceZapMock
        nftxVaultFactoryMock_setNFTAsset_42_cryptopunks_: '0x6d00635362654271718cd2f98c406163de293d59eac6dc7e936661872e56775d',
        nftxVaultFactoryMock_setNFTAsset_43_erc721_: '0x6861476288c11b43cb4dfad2a37c390cdd3e817a6e4ddf80efb079b8fd53a2cf',
        unitroller__setNFTLiquidationExchangePToken: '0x3ce2b3a99b01d2eadfbdc15848538b3a21a48a02f8b5d6286767cd6cda385e94',
        usdc_mint_nftxMarketplaceZap_: '0xd971f74d09e640ff02862f49382f4d4018ff8a6435bbe8496ff730a32353e1ee',
        usdc_mint_sudoswapLSSVMPairMock_pcryptopunks_: '0x321d3a5b4f246e92e45307310aecb9aaf5ce7ab1574dbff4ae9933e9dc89d8c2',
        usdc_mint_sudoswapLSSVMPairMock_perc721_: '0x49084479d1870520c4b44398d0e89fb200b99edb5d02ab3d508983659cf6e7cf',
        unitroller__setNFTXMarketplaceZapAddress: '0xe6e1571dde79a8e49a2ed22ba4650d668516434e39ed6da93c76b709746a4595',
        unitroller__setSudoswapPairRouterAddress: '0xbd1e993c4259fa0535057cecd059c0d56fbbcfe7638252a079176fba0fb61cab',
        unitroller__setNFTCollateralLiquidationBonusPBX: '0xade59d6f3bd6e79136314e40774483d6f3955f3e5072508252676de10b690ebf',
        unitroller__setNFTCollateralLiquidationIncentive: '0x72ee6864ce94dda0676e4f9b5fc3be8954d42f192fe88efeba2589949e58f757',
        unitroller__setNFTCollateralSeizeLiquidationFactor: '0x1c9d606e1da54d697c8f94d3f72c03319adba69b602f98a381546020f7cb6add',
        pcryptopunks__setNFTXVaultId: '0x1fa11cf98e5287177a870243f055c8c4105689befbb1f53ebb147939c116bb9f',
        perc721__setNFTXVaultId: '0x1e4fbea0bc331e5a755e6b65aa5eddf02801205e0fc1155edac56a31c0520465',
        pcryptopunks__setSudoswapLSSVMPairAddress: '0x593447454ff75b7e74e2c8816ae23f7dae2e9647c7e5730c53af0dfabb316b7b',
        perc721__setSudoswapLSSVMPairAddress: '0x9eec8c5518b2c62bd6208327c8a489addb79b65dc3668b71c85cfecb5928c322',
        pbx_mint_unitroller_: '0xdce6493435af92c37ac68d9cd2c27152b09401571f5d77efc535a82af1a43a27',
        cryptopunks_allInitialOwnersAssigned: '0x56e2521b9e86f1a32044941bc9db0b9102f802a1905564d3043708b4af827a6a',
        usdc_mint_owner_: '0xcb91005274d392f07572c382774b992e45bf0ae2af6fce5fd49ed9619d6b75c8',
        usdc_mint_maciej_: '0x094144338ab4dbdcda0d07a3cb9f1ce9c8f26222e1b9d211d9dfb19ab852993e',
        usdc_mint_michal_: '0x63e52490a1e2c9ec1224e97702aa4511f996231f985da5f0a5192f05af02ee32',
        dai_mint_owner_: '0xfc1e8af14f70a08adb4317eac31f5482dd941ca1f699261a817230e310109c1f',
        dai_mint_user1_: '0xedefdeb85bee2872875b2a5846f049e98d9ad176778af5e39457c44599ca69f1',
        dai_mint_maciej_: '0x3c6e1177d75ca07b4f48fc0303c9f64b7fba942fd25161f21eb7eee77ad0c071',
        dai_mint_michal_: '0x7f4f4e37e15d60ba45123dcb563865b0de35a985b1d3c5c85134ebe7e35b9519',
        wbtc_mint_owner_: '0x32a638b8ccf163941e6aeea9a964d6c2a5e123a962be6e5339da700fb1ed3e67',
        wbtc_mint_maciej_: '0xdf45373de134f0b793454d25d290d1dd92e93bc17f45cc0cc25fda7a18166975',
        wbtc_mint_michal_: '0x2067bf625d68d431401f9191b7f9a90e283eaad31d87b09bf7783bb19b84afd3',
        erc721_claim_0_: '0xd686292d810fa58a342e114d790bdae4fa62f50fdac3b4403818857132413a35',
        erc721_claim_1_: '0x895eb4b29a9086c82e04d0d15c1b7ce9c0ff096797cffc72ed70dd3bdb077b60',
        erc721_claim_2_: '0x9511e245a720f2c4af942a7747c75f8028e1936f0b565a52c45a43476ac4ae45',
        erc721_claim_3_: '0xc98150312bc473db27f8534cdcdd31b81f4a68bdd2438952b68e07682923f4e5',
        erc721_claim_4_: '0x044d9da3a2aa0af2d7827cbb456d9fc1ca31ff15cf52448dc9d4fc1499071264',
        erc721_claim_100_: '0x3b9abdaa0c25673811b7c271579a152b040fc2d684dca6421d9be45c33835fdc',
        erc721_claim_101_: '0x50a32d62afc444ee4c9148eb76551b94d9cfe9818bec4523d31830092c81f2f9',
        erc721_claim_102_: '0xe45c9e18473dade64ca914cf91f6385b8de64078c9ef6287d28a8302603953ef',
        erc721_claim_103_: '0x55b0837cf9ca6fd359f1629057e150f2911c40cfdb9823e1d4bfdef4eec67dd2',
        erc721_claim_104_: '0x912cb75a604790a5ec4421209cdd849d1b53f6f8fafcd6a00cafed8e2627302f',
        cryptopunks_getPunk_0_: '0x305e022146053d072694db7a66ba2d9eff6fbf2bd7ee33f9d1cd3788306ea259',
        cryptopunks_getPunk_1_: '0x31a531b9393c42c1a57b6c07c4131b5b7fad3f23b66d8bd65133b5d1de611d00',
        cryptopunks_getPunk_2_: '0x009f46e9074e4b63e4e31b31407cd24df82d075e59471382910a9a39013c395d',
        cryptopunks_getPunk_3_: '0x542f06eb79892161abef858f3ed1d08aa1c69039fc2e688518b5aa6cb55178c5',
        cryptopunks_getPunk_4_: '0xebfd29e86b962990b097403f79107063df794ac20b9b0df57018a247346f081d',
        cryptopunks_getPunk_100_: '0x3628064fb8de40ee4023960d4e25d9bf9c583f443ebdce857597ddc28ad3151f',
        cryptopunks_getPunk_101_: '0x2c6066038b93824853a7610f2c480535e5b53ff5bb0ba538359b96b84af17b92',
        cryptopunks_getPunk_102_: '0xb92dc9b0e6dd465e5c6f8c9c703724f0c6b1d8706104be5ee837f1c31f459b0d',
        cryptopunks_getPunk_103_: '0x5513ec9bbac28ec1df9c1bbb32d4e4878c92221ef12736b9ef6a6ffbd1c28a7e',
        cryptopunks_getPunk_104_: '0xf9b52858a4abacf77cb54ee0764ec770fddf035e5d5893a7e86052de261e4e79',
        cryptopunks_transferPunk_0_: '0x6f5e7633dce5591aa9c36978db6d1d93e3c1f3e05c6aec2e50f2bea4dda19452',
        cryptopunks_transferPunk_1_: '0x7274047a94f327d5831813d94eefddb0b427f28889bfaee9805c5c0c7ad2b16f',
        cryptopunks_transferPunk_2_: '0xd02b1c69c8f12128155acc528f399209a14ee98cb2c032bf36d2ff26c14087d4',
        cryptopunks_transferPunk_3_: '0xc75ba775a5665ab4d3af27742dedf878e983b99069f830b8f6d754a6c504446c',
        cryptopunks_transferPunk_4_: '0x3be97a6a77a6fbf4a945efb9e48ab07bdb51f9cfec6916e71d927ec79ad689a9',
        cryptopunks_transferPunk_100_: '0xca73cd520ababdf7b5d56e91a8bb070205b9de13a8ff223bb18c91771d037c81',
        cryptopunks_transferPunk_101_: '0xc6a9725a0d854e7bc04525320348fa77149463e0c768dfc61addd59dda8ff75f',
        cryptopunks_transferPunk_102_: '0xfb8202bbf7371ecf7c9b30d3ed0e5abbb90a7084ec9b1c7482884f8d39367fc3',
        cryptopunks_transferPunk_103_: '0xba076d5042cbe916979afea98e961714e7907494ed75854a4e9f255748bd0526',
        cryptopunks_transferPunk_104_: '0x6c48021df7d4a75b68e386af5953e926eb76b85b77cc8da02195dca23ad2e1ee',
        cryptopunks_getPunk_5_: '0x67e1792b2d7fbde8d5c390e1a25491f027c133bf99e5b0cfdcba47a2efec2f72',
        cryptopunks_getPunk_6_: '0x8ccdb34ee6a7e4082062762818c089159628ff613a83621ddfe91bd6b80ad82a',
        unitroller_enterMarkets: '0xf35f55b7d107f44a65dee17b6801cda9af3c532924eeae23839e6aa9f6813e7e',
        usdc_approve_pusdc_: '0xaf2f8ea44f3c8c6119a6ed98915f6f4a5b2a05945d6a1cc2b55179071f06b656',
        pusdc_mint: '0xb46f093329843ecfcd9c108161d8f341cd6b350802bb3e6b31ae37d995cf681a',
        dai_approve_pdai_: '0xa6f75656039dde0f32f3c8e6bc34c7c8dc89ee2cc2cd106ee17cf7806a47621d',
        pdai_mint: '0xab5cb5df0b9619b7602492b404c5ec223d6ec22857accac21c5cfc8d48e13bf2',
        wbtc_approve_pwbtc_: '0xf450699b995eef6d32f1c6ab90854bf9f2968e6482e490ddd6f2e78e3a385778',
        pwbtc_mint: '0x9f3beac9afa5ffb786000ef7c05642fa16d133f8d2251fd25f6b83f308ff332b',
        cryptopunks_transferPunk_5_: '0xc540c150d7d7406f3a161488dd22985d29be65f91b7b37029e4d75751b1d640a',
        cryptopunks_transferPunk_6_: '0x4ccdc03429ef516f19cda209aef50b2a2ee9e307be7cee3bea37296af63d759b',
        unitroller_connect_user1__enterNFTMarkets: '0x544851ab687387ef1ccc96a5207f884a84ec6e97d60a4357c11b66c1c44ee608',
        cryptopunks_connect_user1__offerPunkForSaleToAddress_5_: '0x0dc5138440459fc46eaa2ab0ad8c4b9faf26606cb4cbe5696df530ad676a29c7',
        pcryptopunks_connect_user1__mint_5_: '0xcccc143fa2f8f4d1a74b7174f7e65f7b593c61d21fa14305451faed806da2b33',
        pwbtc_connect_user1__borrow_90_: '0x122f9efa40b92f0e155e99eb3a0f3d4515ae0cae5a889360909e9d9168644521',
        oracle_setUnderlyingNFTPrice_pcryptopunks_5__2xx: '0x309baf8bac46d45ed1a5ad5368327eb7a4dba0be24985cece59897d83afd8214',
        pcryptopunks_liquidateCollateral_5_: '0x5c66134e1ea023dcf92ebf24c880430d25a0a9f643789112be870f693450590c',
        cryptopunks_connect_user1__offerPunkForSaleToAddress_6_: '0x0c4b7c9220641233aa276fc9209d7d2ac6e40b637af6072994e523ba3be12fc6',
        pcryptopunks_connect_user1__mint_6_: '0x207bf8d435763e16f20ac1392b5f645a1d75e1034b8e134742a93909dfe1134f',
        cryptopunks_connect_user1__getPunk_7_: '0x984d117636c4a73b923777ec938165b5c526e59f9bafcad963b21f6f7e9cfdeb',
        cryptopunks_connect_user1__offerPunkForSaleToAddress_7_: '0xde1a94a94630d4118ba5c40804cd2770ba996885f448e7da0eee5243a08333f6',
        pcryptopunks_connect_user1__mint_7_: '0x8bbcd9e7a820722a9b4f6cc4b1a5a0eaf4d517f6588689daca32451a37b4b06c',
        cryptopunks_connect_user1__getPunk_8_: '0x6e05c72658809bb27143c99995982fafbdf197b3761dbc7e5bb236e081f71043',
        cryptopunks_connect_user1__offerPunkForSaleToAddress_8_: '0x7eaece5849efa83e581153cad2942c18e4203b2a1bd34993eb3267505b3a2f17',
        pcryptopunks_connect_user1__mint_8_: '0x62c350ec51e8af314944f1c7e3d52cd450af758916eaf25eaa4edd84282bafa0',
        erc721_claim_10_: '0x4b98acde6d9e7032057880fc1b64254f5eb50aedc9ab9ce3255d3854361147b8',
        erc721_connect_user1__approve_10_: '0x7da41a9974eb51d031d870edeed63059d87b25fa77c72a671d83399b91685d1c',
        perc721_connect_user1__mint_10_: '0x90694a35c261ad0aac23e796b7390dfb120d89a431e905e953654f45031e7824',
        erc721_claim_11_: '0xcda06af18cb936407a82ba5de8d991041befafffbec95b5779e6b7928b16f496',
        erc721_connect_user1__approve_11_: '0x4afc53ab67e853e0af70a7617310c6db7e867ce834729466a1b924fbe31be02d',
        perc721_connect_user1__mint_11_: '0xbedbea05a86d110bc05ecb897467c3d9b8ddb94f591315652b1cf1b6662d48aa',
        erc721_claim_12_: '0x719e53f96c3663b4c532f064ca7008649e71bfb2ffee1f863769b4f89caa499d',
        erc721_connect_user1__approve_12_: '0x6ffde9af07e773da38bc87eb314ca151ab5b26d0592b863605a2bf8ec08f421f',
        perc721_connect_user1__mint_12_: '0x5e08b09f853225d0e7d9effec0291766db69704b280899e7bb4dab2400876950',
        oracle_setUnderlyingNFTPrice_pcryptopunks_6__2: '0xa2c621074cbbae9858a43e6b13aefb1e291f0d4b1e3214837c9615408ec99758',
        oracle_setUnderlyingNFTPrice_pcryptopunks_7__2: '0xa352b03cbed3dc2e3d602754fc5dd278eedc93915c44662391b7a0c25d6c29eb',
        oracle_setUnderlyingNFTPrice_pcryptopunks_8__2: '0x091aaa9cec00b15bae679731473cfc38b4ba31352898898ea3f9d3c42e474b85',
        oracle_setUnderlyingNFTPrice_perc721_10__2: '0x1e46f23c1e65b1fbd075b5e9ee2682c5539ad5de95b29a6d850985034753464c',
        oracle_setUnderlyingNFTPrice_perc721_11__2: '0x5819fa2daf195309013b862b78c59a342ebd6ef1eafaa27ff17b226c7bd6f2de',
        oracle_setUnderlyingNFTPrice_perc721_12__2: '0x27d7b5a4b7f483a18822acf4a5df36a572defc17e52c8b0a7a4663349f5a28bc',
        pwbtc_connect_user1__borrow_40__2: '0xfa9eaad368745352704bea36f1d9de671dde99490800433ed938b1440d76619d',
        oracle_setUnderlyingNFTPrice_pcryptopunks_6__3: '0x3ac82d412ae4c7ebab68ac04e8917b62f6fd2b732181b7727214ba6b9b8cb000',
        oracle_setUnderlyingNFTPrice_pcryptopunks_7__3: '0x8e29a2a1745d968299563d8cfa33e377ec06a21a5f663a28f369d8591b2a8e21',
        oracle_setUnderlyingNFTPrice_pcryptopunks_8__3: '0xca35414d5aba40331b1fe28a012c2c9a5133e15c7d1988e43c1445e0811cf708',
        oracle_setUnderlyingNFTPrice_perc721_10__3: '0x2891e1148b6b379cbb746ef70c210eac83f27f06061dfa5c1d6dcf729649f357',
        oracle_setUnderlyingNFTPrice_perc721_11__3: '0x6f44b4d7cacc365bdc0f598bed679db8a29d335e674f4be79e8f40508011b3e3',
        oracle_setUnderlyingNFTPrice_perc721_12__3: '0x54f1cd564b86cac1cc08b4ee0334fece950b4fb122b518ba07f4db381cb2ba4c',
        pdai__setReserveFactor: '0x4006fe4ed4ffa843bc9d1f307e0467920accbc575e979702f8420b70116b15b7',
        pwbtc__setReserveFactor: '0xa16a1f36278f226f97b2b8db61052b2f83262ccb0e571bbe6089b111345ffeec',
        pusdc__setReserveFactor: '0x5b24645099c9f09a360e61df38e4d636662499deddebb039a0901eee2fa0d686',
        pweth__setReserveFactor: '0xcd9135f3f3160dbe7b50c37286edeeb1005810be00a12dc823e6c569192a1bcc',
        unitroller__setCollateralFactor_pdai_: '0x120d039b8fd1acbc792be56ddf11c9f73ca6ad252d098b91b9e24564c6ce49fb',
        unitroller__setCollateralFactor_pwbtc_: '0x2e66085370c631d19d9da1cf65e4bb4dccf43017992ecc9867851fec0ed2de9b',
        unitroller__setCollateralFactor_pusdc_: '0x2b2258e5085c384c731ffea9206dcc9ea539cf4d6ebb63eb6c2a6523fab0ecb0',
        unitroller__setCollateralFactor_pweth_: '0x082985df89797027249d966e855100a0f449fd609f1d2d8764d0bb66dfb97595',
        ppbx__setReserveFactor: '0xf8bc722ae887b36dbdc9fa30a7aec1fa95d6da23c8933ac4c93fdf18a39e5832',
        unitroller__setCollateralFactor_ppbx_: '0x1a3942684fa2e295ec33a502777867b3b9fe556bdcebe4b692a03abf778311f1',
        peth__setReserveFactor: '0x7a0b867e5d1084a56e9259200396eb6c0bfeffa0440c3c9c77578ef071d26370',
        unitroller__setCollateralFactor_peth_: '0xa6aa288220576684d7e6456499d3f811c8790f082637399b76c83582c89674d5',
    }

    let deployer = new DeployerNFT(addresses3)
    await deployer.deploy()
}

async function main() {
    await deploy_NFT_TEST()
    // await test_deploy_script()
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })

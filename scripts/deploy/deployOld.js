const {ethers} = require("hardhat")
const {DeployerRegtest, DeployerNFT} = require("./deployer")
const {tokens} = require("../../test/utils/testHelpers")
const assert = require("assert")

// async function deploy1() {
//     const TestEnvAddresses = {
//         dai: '0x2Ec4c6fCdBF5F9beECeB1b51848fc2DB1f3a26af', // uniswap + aave
//         wbtc: '0x37022F97333df61A61595B7cf43b63205290f8Ee', // uniswap + aave
//         weth: '0x98a5F1520f7F7fb1e83Fe3398f9aBd151f8C65ed',
//         usdc: '0x5B8B635c2665791cf62fe429cB149EaB42A3cEd8', // uniswap + aave
//         pbx: '0x04A382E64E36D63Dc2bAA837aB5217620732c60A',
//
//         unitroller: '0x486e16c2C3E023Fc5faCb810637A58BC4169929b',
//         comptroller: '0xdFA75ABe5afDe9a483260b22987c349128E55E08',
//         unitroller__setPendingImplementation: '0x09001b65960f96aa8e7ffed9a7fc906f89db0bfcdbd0c16be21618cbba851d30',
//         comptroller__become: '0x0eaf78f86244de46d61b02a7a00cfb453d2be27103ee09e81d9e608e83a3d129',
//
//         jrmStableCoin: '0x5Ad5Ca57270a551eF6d93DA4b51D5b6e94ec84fB', // JumpRateModelV2
//         jrmEth: '0xE015070880A3B6C10E56372F880fa3948788f313', // JumpRateModelV2
//         jrmWbtc: '0xE52D7f65b0B35983ce0f582eB5b70F0909D20aA0', // JumpRateModelV2
//         jrmPbx: '0xB25B87b0652BC3A7e6597487c38E0F2Fc09FA6C5', // JumpRateModelV2
//
//         pdai_delegate: '0x4aa3aFd8858ee4D429e3bA040655438B8eA20c11', // PErc20Delegate
//         pdai: '0x5226f4d742e87Da8446a020314172f5C6b520008', // PErc20Delegator upgradeable
//         pwbtc_delegate: '0xC8f9e63626b9D11e412d4FD6447cCc6E0F0B1670', // PErc20Delegate
//         pwbtc: '0xCdDb32690d479bAce939eD8319D94abB190dC5e2', // PErc20Delegator upgradeable
//         ppbx_delegate: '0x309a6021ab0ED3605BeA5f84A30d4537924be976', // PErc20Delegate
//         ppbx: '0x0e22Bc9d3dbA30E67DC279F1201bE6540C85bB87', // PErc20Delegator upgradeable
//         pweth_delegate: '0x80AD8C3245964d15950e4c2136Cf433AfBA78929', // PErc20Delegate
//         pweth: '0x000Ab22510d15400852b6548B122b62BD65A362B', // PErc20Delegator upgradeable
//         pusdc_delegate: '0x494ad85C0841Fa2E5305d892C226A6633E460fa2', // PErc20Delegate
//         pusdc: '0x63cC5a066508b396ddDC5592e301F46d279DB25C', // PErc20Delegator upgradeable
//
//         peth: '0x2a97aDE05f844802a6DB2a40f547096b464CcF18',
//         maximillion: '0xF1f22B379d726402f71AeB26f28Daa233F541579',
//
//         oracle: '0x5C3936866d1F01850489a255c1e1FCf7C0040c9d', // RinkebyPriceOracle
//
//         pdai__setReserveFactor: '0xe0ed5e9bc18396e7049f02fe76a29b6e76d8a1ab44a36513ba41561c99575103',
//         pwbtc__setReserveFactor: '0x728d2abedf158c00382e0b58c327096368165f99dd56574cc6ce8f74ac3f150a',
//         ppbx__setReserveFactor: '0x7aa28f610e88d85568d67a1c9f9d9a69e45e3a15ee69df7c5cdc207f8f57f020',
//         pusdc__setReserveFactor: '0xd09c4561b52e3e3d48c777eac8fe39d2091136dcb49ca3d27331e21df9ea05c6',
//         pweth__setReserveFactor: '0xbcb028c849b2494fc41d0e3b965f421010d796820f9c1123905dcd924a0eac8d',
//         unitroller__setPBXToken: '0x9e404fc599c43b3fdcf7f7996ec8c2b4783e7e42765868c7c1089946aa545960',
//         unitroller__setPriceOracle: '0xa0183a5dfba789c342ff25141cb70f4bcc2c32943a7f74f839e96f0097d3833e',
//         unitroller__setLiquidationIncentive: '0xc9b3efcfc169bec0c44c165131a0f9a5263cfba4e54170210e73e8ac28557a90',
//         unitroller__setCloseFactor: '0xe19a878d9edf669aa749629e12078d87617e33ecd2d0920c8b63099ef27cc114',
//         unitroller__supportMarket_pdai_: '0xc33966c04c187f5d2c2b8da8e714eee20397250f75759add4122dbe4a003abae',
//         unitroller__supportMarket_pwbtc_: '0x8b4ad27b03049af45be7b0c292f441af60ee3232348acbe6afae396b90fe0347',
//         unitroller__supportMarket_ppbx_: '0x3074d3b953d80e4be5e0d5413221e99d98999e5f43ffaaff290c761c4f4880f2',
//         unitroller__supportMarket_pusdc_: '0x0f69c054f426a7572d148d093bdfab52916d40c149cee6b22702f606d5c5664e',
//         unitroller__supportMarket_pweth_: '0xcb35ab86aeecc9c2c363fe8fa9bffe762f8211ccdbb84d7788c7659274c9abaf',
//         unitroller__setCollateralFactor_pdai_: '0x9ac826952e1c9dbabc3212dcaa78e58d10586eb66c8dd288969a617c72fd00ef',
//         unitroller__setCollateralFactor_pwbtc_: '0xa6eb424d2d70d1575fff04ef05608bc9d167d7faab47c03bf59b6e5e56124f4f',
//         unitroller__setCollateralFactor_ppbx_: '0xe12738916783bd19fbd0d879b1bf317d5f40c02a33b42746c913bce96cd300e9',
//         unitroller__setCollateralFactor_pusdc_: '0xe886920dc5d12ef5eb88bf2ed7326c706edd36a92ab71315d1dea4426e686188',
//         unitroller__setCollateralFactor_pweth_: '0x1dd0a1a31e81142cd6159ce9bf54f9f96dd3ee05f315adace247fca47e901ca5',
//         peth__setReserveFactor: '0x4a11e6c0465858bb04b589b3c2cb4a3c1b9f64260e70b62ccc8726f70f04bec7',
//         unitroller__supportMarket_peth_: '0x3e12e1f73030359814bf05d659fcb177da974303a2a8e4a4ea45a17afc3a5975',
//         unitroller__setCollateralFactor_peth_: '0x4d2e062e65f2fad70cb9cde67208e3ad1aa0b1ae924350e6be126b3641b795da',
//     }
//
//     let deployer = new DeployerRinkeby(addresses)
//     await deployer.deploy()
// }
//
// async function deployRinkarby() {
//     const addresses = {
//         wbtc: '0x8909023C6323b61C9Ce6eB11049044e07E5b7F03',
//         weth: '0xc25784BEcEceb73109d7e822e857C1cF86df9160', // Erc20TokenMock
//         usdc: '0x8950258664ccDA7293521D1c95497657Fd4C483A',
//         usdc_initialize: '0xf2d15fcc97d08df4f06b19bce59f37569f646b7dfdf6fff5430f0a7ddc3116ed',
//         usdc_configureMinter: '0x2f577c2ebe5b2dc5ef647347d0f52709dc39e0845eb2c40f167d333e05ac1f10',
//         usdt: '0x233C58828A9433d76C5b221a99a936a3a45781B7',
//         pbx: '0x504A7c8a7d3bda9356654E00502cfaDE2A7eb386', // PBXTestTokenMintable
//
//         unitroller: '0x457759a605A2a0d3fb0BCf12805D2b332561C0B8',
//         comptroller: '0xBDA5C79f27C4B1Cf4A39635fD15A8c7aF09019B4',
//         unitroller__setPendingImplementation: '0x10f5248ec414b4f8c7154bafa94fb808f137fcb093fb0779293da2ce8fce5753',
//         comptroller__become: '0x8040e3743bc0f5d61f22330e3299e355a0db9260dfcdb18e9f70474aef683914',
//
//         jrmStableCoin: '0x66d67FA9a360a4e4962AFDB3C01BA6bb79a321F2', // JumpRateModelV2
//         jrmEth: '0x9fF57C3453F3ee81C0800bb9Fb37d981425C77Fd', // JumpRateModelV2
//         jrmWbtc: '0xCA378C7a339aab99e3fAcd94FfBFa168cAAC1B92', // JumpRateModelV2
//
//         pwbtc_delegate: '0x7651eB72cF08d52Cb109fF130e3C3E73B2Bd6Ef3', // PErc20Delegate
//         pwbtc: '0xE71AAE27D17938b689e57C032002C4e430840918', // PErc20Delegator upgradeable
//         pweth_delegate: '0x7c8D6b3C4f68A8361f88339ac6Bf0e1c116B5b6D', // PErc20Delegate
//         pweth: '0xd2C2dc7406E2Ac46F397FE77712B16Cd35475d16', // PErc20Delegator upgradeable
//         pusdc_delegate: '0x1C543E8821F18DD7ae783C8D91805B79aBE6D379', // PErc20Delegate
//         pusdc: '0xc97590451B6A77cf27c0C45B8A49864e0bEA5d4b', // PErc20Delegator upgradeable
//         pusdt_delegate: '0x3B7CdF22d95E4661D9e67934e562ecc69317d831', // PErc20Delegate
//         pusdt: '0xE497EE784de4d5D96f69A56905Dce44F84FD6512', // PErc20Delegator upgradeable
//
//         oracle: '0xaF99E97ffd37F2Cb953f99d58ad5D5Ce4Cfd48fc', // RinkarbyPriceOracle
//
//         pwbtc__setReserveFactor: '0x47a9335bfc377e6163ea70c3f65f554b72c917cdfd5ec605edd7966aa626692d',
//         pusdc__setReserveFactor: '0xcfaba8825d494ef6bdd48d0f8e33832f5fc87af12af789001a3f70baa4163eb2',
//         pweth__setReserveFactor: '0x5591dfc6521a821923c99224604ecffa1c479b77e6c56b92c8244ebcf887a8d1',
//         pusdt__setReserveFactor: '0x11fec887b1b3205b8ffbe70174f2c7448c2533576868d408aa189e2f9ad4b92d',
//
//         unitroller__setPBXToken: '0x62816a8cc5af3ab10b1b8c960119221d5a3b987dd0adb2982cb1e3eaa1d91f58',
//         unitroller__setPriceOracle: '0xbfb95bbd0f8543aad131592a022873d59b6e7a338a89fbe10ec9b2340c87c007',
//         unitroller__setLiquidationIncentive: '0x6b6ea0d9c144a387bef6ec2cd4b446e11aefd31248b251907efac9a9a8f9de48',
//         unitroller__setCloseFactor: '0x428244167e18f7fbe4426566024ca330f15c78f4cc1d8f70949de40e89b75065',
//
//         unitroller__supportMarket_pwbtc_: '0xa684dde3ad932f932f21203e5fdf750a39535f008f5c31bc865ab1b413fecbbf',
//         unitroller__supportMarket_pusdc_: '0x588ad2e2021b1297b5af6929613246d3fb0f81c748ee4b48fa801c592575bd83',
//         unitroller__supportMarket_pweth_: '0x63876ef6eaff0c40b31382ef66db3fb2ac0f4b8f177ab534c0fbf812a5fa44df',
//         unitroller__supportMarket_pusdt_: '0xeb0838e7444dd9dee4227f1c7524bc552c30e653b0ce117c38d15b5520539f2e',
//
//         unitroller__setCollateralFactor_pwbtc_: '0x7b832e51d64f76c47f29d5982e5adb00f784b9fae2b627e4ebd3b2a310f07a87',
//         unitroller__setCollateralFactor_pusdc_: '0x88169241a551b464d586160e25b5a021fe48c0e1527d8e74e783387994b35762',
//         unitroller__setCollateralFactor_pweth_: '0xec325da92b8d213ca629e64e7d4abf3217766634e4bb86845ff547e650cf182b',
//         unitroller__setCollateralFactor_pusdt_: '0xdbac53a70efdb096857abdd0782239ca18e8eb1d7377bfd217064ed689efb089',
//     }
//
//     let deployer = new DeployerRinkarby(addresses)
//     await deployer.deploy()
// }
//
// async function deployNFTEnv() {
//     let addresses1 = {
//         dai: '0xE34ceCa34FDfC2bBd7eEC3E5302D62e29494C9c5',
//         wbtc: '0xF31D9581aE5995D8BaC8905Add9EEe3945adDFa0',
//         pbx: '0xE333dA984A0999b4aC221147372b7C8857daF9D3', // PBXTokenMock
//         weth: '0x838a852003dBE05a5a6148a31443E458b2861de4',
//         usdc: '0x3F6F84Fa391841404c43779Ed0928158Bf805142',
//         usdc_initialize: '0xfc510975d13ae123008794481a792d4be810aa01300f3591e7c0d1c168bb9c1e',
//         usdc_configureMinter: '0x35a3897834122b35cfc4c9d8f3b5c9fe3f0a8dfd22b8c232d3fec3a46581c371',
//         erc721: '0x61183ACaaDcccbE55d2A5363F75D3648Fc24baf4', // ERC721ClaimableMock
//
//         unitroller: '0x528FF3DafDedCACB5CF3dB1DF27D0854314a7aE2',
//         comptroller_part1: '0x5B2dEfFf62dF8398Cf711A65bE8E4b6dB6725f0e',
//         comptroller_part2: '0x2ee9c791419Fb028746a66c33f191211e2C49E75',
//         unitroller__setPendingImplementations: '0x3be67ab7f0235c6fe3dbc799eedf2e4338f497ae6ae48d3d03e1b856c957a351',
//         comptroller_part1__become: '0x76dfca1c40ba8d58ecd1c7d7bfad9be4baf3399935ba17b05064d79461f2d2eb',
//         comptroller_part2__become: '0xf6b1b214b83bc1fd13c1e191e1d01fb5c911158f966c0f2476bb74c123640e93',
//
//         jrmStableCoin: '0x8b102ce73EE1746E8BbeFAF8c13C21669b6A6Ed5', // JumpRateModelV2
//         jrmEth: '0x172b8A7F552f4268Bf1bC1b2FA8333a8dbd113EA', // JumpRateModelV2
//         jrmWbtc: '0xBD9113D731425225508a7aBe5387bee84af3258c', // JumpRateModelV2
//         jrmPbx: '0x86768e56f4a29A127e53E210efA457C291798678', // JumpRateModelV2
//
//         pdai_delegate: '0x018adc09eD489E05605780ec66bbDe33372Cf87D', // PErc20Delegate
//         pdai: '0x3c8b2A856bb2e7014905D3D8240B4a0854996472', // PErc20Delegator upgradeable
//         pwbtc_delegate: '0x1531e58a5219c8BBB8cd32433b5CA980899539d5', // PErc20Delegate
//         pwbtc: '0x6d0e8741beC4BfA9a9B6D1467ebbF91F4AA593e5', // PErc20Delegator upgradeable
//         ppbx_delegate: '0x208e9e01c6Efd639857118f102A82d1eC3e00076', // PErc20Delegate
//         ppbx: '0x84b6Bc6bC40D550fd9eE3f21184F44393380D205', // PErc20Delegator upgradeable
//         pweth_delegate: '0xD1815294d79e0ae9bfd047f8bC9Ca832b40Eef9e', // PErc20Delegate
//         pweth: '0x094136e3084a814e160b5DB32fd86B6aa1B7A2A1', // PErc20Delegator upgradeable
//         pusdc_delegate: '0x11c7e438d269eb5CAa3137Bc4d725194621C6E67', // PErc20Delegate
//         pusdc: '0x1e5Eb4123B7ad5B65fD161161887Cba344dA4ce4', // PErc20Delegator upgradeable
//         perc721: '0xC1819de60316fa58DE9d8BFFB624a0221A231a8c', // PErc721Immutable
//
//         oracle: '0x96FF218ed47A9711aA8d2B319686693559EC90D0', // SimplePriceOracle
//         oracle_setUnderlyingPrice_pwbtc_: '0x80fb1d7f446c5c487e55eb2fe3423918d09e4c36910db192f9680a7c47c78bb6',
//         oracle_setUnderlyingPrice_ppbx_: '0xc9b999fc7267034668d6a2dc3eb0ae54c53dc86452b8612e8e8cf621a901ae09',
//         oracle_setUnderlyingPrice_pdai_: '0x0695b1f6b59e6c3d7afd10ef73574443634d28555ed5cab14d7d68259023dd7b',
//         oracle_setUnderlyingPrice_pusdc_: '0x7fa7ebb12c365f8fba84c9558177e2e61c951cceac82827a8a263bcd86bc100c',
//         oracle_setUnderlyingPrice_pweth_: '0x6829449dd433800aefd97fb39eaad64550de19dfce1c5217f2dc288d938d136a',
//
//         pdai__setReserveFactor: '0x06343e8cbe9c1a580beca5de11b4593ccce124123cfa864227b1814be45997a7',
//         pwbtc__setReserveFactor: '0xc060f777231684763693b4a44309471f72f135636aa009563c770a1a9290c1be',
//         ppbx__setReserveFactor: '0xae95dcd4af7877313ac1252e1fe188a4217111c7c4ad6d93fc563c9ba447954e',
//         pusdc__setReserveFactor: '0xe847376c503afd1b7c0a5a8b682700e10af3ff9a726b4314ecd579199aee12ba',
//         pweth__setReserveFactor: '0xeb214d99e2462209823cf40e58a9909b5c0c9d5732dd582bcce032cb502e85c0',
//
//         unitroller__setPBXToken: '0xdc6a4d303d29375f930965e3277ecdc528b1792ef3a19e168d79077b78355846',
//         unitroller__setPriceOracle: '0x61310ab2e631b9285a23111293138f3466e4e1650e5f7277fd672263863298fc',
//         unitroller__setLiquidationIncentive: '0x8c524d46a2b028e7f3daa3c274fa0e21459f0f6f11515940556781dbaef8bcf2',
//         unitroller__setCloseFactor: '0x77bab0752c063311a080836eb1b3c4c27499344e035d5549b44ed4803c12d93e',
//
//         unitroller__supportMarket_pdai_: '0xb784c6133f777e80785e8c99d983f6cb7c1160da6be9c8f460c9b614ec7a4a62',
//         unitroller__supportMarket_pwbtc_: '0x05e4006a99a6720f74aeeb0f41376e968d26a698e9faa55df27e806b495eaa3f',
//         unitroller__supportMarket_ppbx_: '0x0a223797d09446d94d230532a376dbc96729c01d5626aacb1c79c548fc728a8e',
//         unitroller__supportMarket_pusdc_: '0xaff8bc85adb587f1a4e713d22c4e942fabf77830ef3ad38e65b1ebf99df51dc6',
//         unitroller__supportMarket_pweth_: '0xf405f2216311c48220f089ff5fbfa6a50e9f142b67f717426424ee92d253f995',
//
//         unitroller__setCollateralFactor_pdai_: '0xb9637ad25ab67c747d9d238345ba096a8e5427ac5ab19be12da4f3c63f2b3a79',
//         unitroller__setCollateralFactor_pwbtc_: '0xc64f5d3ef1429ee0de8f57728506ad8c7c9e39b73180f07aa41b00acfd62e198',
//         unitroller__setCollateralFactor_ppbx_: '0x62ae4c7de80e8ae157550cbb8e47b1bcecbab5705914452e7361cdeabe86ba50',
//         unitroller__setCollateralFactor_pusdc_: '0x678b9f6d3f84654f0b50788c0d6afbe94913e03a75bd1c34b698d659199cd5e4',
//         unitroller__setCollateralFactor_pweth_: '0x62abea8f51fae3c2471cace7fe2da924f0d20abf5e4aab99c71b8b51ff6dab62',
//
//         oracle_setUnderlyingNFTPrice_perc721_0_: '0x0c22d139c4c50e67f17c383230b21845bbcb9f95dac532791be9545fc7da88d1',
//         oracle_setUnderlyingNFTPrice_perc721_1_: '0x1cbf620f56751b01fafbd75cc5aad18aa96ac90dc20ccafe7f4902b1c13f251a',
//         oracle_setUnderlyingNFTPrice_perc721_2_: '0x04a45a4deb97f0613d827acba34380ef72e0cacab2c1d215325e9524185ced4d',
//         oracle_setUnderlyingNFTPrice_perc721_3_: '0xc674fbb71e2da275b1d974b38750224bb6a6506247b57b2681f9123f50014734',
//         unitroller__supportNFTMarket_perc721_: '0xc4cb77e838a78748bb11263792aa22736766cbb76ccfc3c6c131af21b7384c48',
//         unitroller__setNFTCollateralFactor_perc721_: '0x19274a39c43225a1f76c24cc0bd60f657acc586176f4e2b84c565f2d82156cf8',
//     }
//
//     let addresses = {
//         dai: '0xd1E525a0BC5A7e14d2C78481423D0cD8ED3F50b1',
//         wbtc: '0x85026e7248984fA12C4575dB3088B09494928686',
//         pbx: '0x616A74014a3eF2a48963b02420bD51009c943430', // PBXTokenMock
//         weth: '0xBE217F1F183fB1644b68Edd65cE0D60c36F43443',
//         usdc: '0x3D365Dd481A5AD7391C7dad63f5D61B62524754B',
//         usdc_initialize: '0x545ecd344ee9e81cf7b1e88d0c4cb5a73988de50e3b2e3f748f8157e67d0cd45',
//         usdc_configureMinter: '0x5d1426985bf8ca78ad967a4e731b98501432d0da36fc734904f38abb98f97df5',
//         erc721: '0xB2bDB097320455694837075C36F6DA9161D54e7f', // ERC721ClaimableMock
//         unitroller: '0xaFC4eB756443CF2dEf5f84036F4539C534F35fB0',
//
//         comptroller_part1: '0x9A710F7b11Da8e87aeB24347C45ff8016687784a',
//         comptroller_part2: '0x691a7438bBE84c1C0b05cb8D7945bFC4eaF49e00',
//         unitroller__setPendingImplementations: '0x45d4eac7b5239e9f9c16bd1ae434244c3c84db2ad8b46c60aea65ceb325b5bdd',
//         comptroller_part1__become: '0x3e9d06561bd5a88c26c7ce0cc2f0c929bca3d19bab191b4aec8a68c6a82d570d',
//         comptroller_part2__become: '0xbe6480050e34b8ce1b14f9bb6a568c95552aaa7648e40079530539444f0d5deb',
//
//         jrmStableCoin: '0xf6e93F809aB5eD3724AE2F99d804Da5f15A14c6b', // JumpRateModelV2
//         jrmEth: '0xdA330e83Cd40Df371169063d99b03A182b169c9b', // JumpRateModelV2
//         jrmWbtc: '0xB67F3D29aE8b957f36E2a1955DF0A60c898eacD1', // JumpRateModelV2
//         jrmPbx: '0x17EFfd250f59E433F596B72a31531adDB78C2778', // JumpRateModelV2
//         pdai_delegate: '0x57653B55558B9389b1cc7172304FbE1feBC88a6c', // PErc20Delegate
//         pdai: '0xeFa153B3Bb99b9F30C0e6594A51bc72d7343a22b', // PErc20Delegator upgradeable
//         pwbtc_delegate: '0x67804679Cf7A9538F2575929452206dDC75a91cC', // PErc20Delegate
//         pwbtc: '0xb66970DaBD837318ddC870a97eF0cdE1FCA42a49', // PErc20Delegator upgradeable
//         ppbx_delegate: '0x5d811c3aa4D44521c13278538BaF9b7A852134A3', // PErc20Delegate
//         ppbx: '0x03bC77dB09939D56A51fD2Fd8126baAdC4152C4f', // PErc20Delegator upgradeable
//         pweth_delegate: '0xe7a8Df8E9169c770adc89222fC08702A222b6220', // PErc20Delegate
//         pweth: '0x8E42878BEA4E408De358AE34C200b1D39039621e', // PErc20Delegator upgradeable
//         pusdc_delegate: '0xf782344a031a022d886E23d4b6F18040C35c360b', // PErc20Delegate
//         pusdc: '0xa764Fc061B8859E6B9dc7605debe4a6Fc147e6D9', // PErc20Delegator upgradeable
//         perc721: '0x4A4471f0ed318f3bBC235a044499Cc83ce60B80f', // PErc721Immutable
//         oracle: '0x3259209f5a2d8E587efA79Eb7d98f6Dcaf2B198E', // SimplePriceOracle
//         oracle_setUnderlyingPrice_pwbtc_: '0xf8116e3df3f780f18822a1c131aa640dd95779544effb7efbd821781097479af',
//         oracle_setUnderlyingPrice_ppbx_: '0x8fcfe844c5e34accd213fbf05b0f883341cc25a73a391ece55f48664e2c4bdf2',
//         oracle_setUnderlyingPrice_pdai_: '0xf0ef81e2bde379012f4c5cea15f9c80a4046255184d039143d03da63c6c31b5c',
//         oracle_setUnderlyingPrice_pusdc_: '0xed56475ccf34babc088905e844ab9aefc6aa18404b26ce5eb7a0a84bc8dac6ef',
//         oracle_setUnderlyingPrice_pweth_: '0xe4fbf1b4d3e54d6c11cbcaec92b400dba5218a621c14389624488f78889c3c9a',
//         pdai__setReserveFactor: '0x7c5d9c72754373826dc6ff9d1f8ec181731f62bc206822411a95850f91a168eb',
//         pwbtc__setReserveFactor: '0xe634391e206dc3b6700ff6c2e88989102d2924022599353ffdbcb464a226fdf6',
//         ppbx__setReserveFactor: '0x008dc9d49e1d42521c60bc68e275c5544f10cc0c1ad18a02bcb5dd148a69e269',
//         pusdc__setReserveFactor: '0x602e10f4e6c492448d2a59b738e68f6cf3def5192a97b4c44a8473cb0fa80f11',
//         pweth__setReserveFactor: '0x1b938da7d941e8d349ffee15bdc1a7f991e21704f2b9f613b0caefe16016b50f',
//         unitroller__setPBXToken: '0xf39b721da89b3f9273a6a379b8d299f343bac7d8e038a67198fa5a57c68cc915',
//         unitroller__setPriceOracle: '0xfb56bac898b695b197212ae2faf267c586e67d410b62c606349c0186db22cc71',
//         unitroller__setLiquidationIncentive: '0xe94c7e1f4dde479cbbc64b99980243093f615ec688c666b66f58e7330356d423',
//         unitroller__setCloseFactor: '0x6a4c3d665b142c36cee19c05cd305969708a24800c04aa9b867b3b4f20c88e4c',
//         unitroller__supportMarket_pdai_: '0x687e9dd8a69fe97320b82c427ebfd9e3e67c5c915b9e2d87443e1f36ea1185b8',
//         unitroller__supportMarket_pwbtc_: '0x7b328d5ae1d7f7d92e966dd9535b38a826f076cd2ac488f7f6c3aa8861f4d3f5',
//         unitroller__supportMarket_ppbx_: '0xefeccfc1511e0621cf6a41e0297c28892c27a95638fa635dc228344bc18e3c2a',
//         unitroller__supportMarket_pusdc_: '0xf837b84657182ca350a166bb32750609ed2956f3a4eac5aecd349f4912ec1bdd',
//         unitroller__supportMarket_pweth_: '0x68469b4cca72722edbc8a7e1bd8e8690d149739bad657572137453e7a9c1c3f7',
//         unitroller__setCollateralFactor_pdai_: '0x0abca2200f18dd98acd68ac286013958df81e463e6908966a5f13f14134eb305',
//         unitroller__setCollateralFactor_pwbtc_: '0xcc212fbe788a4c77e3190140054e0b93f98ec47633346edc75e40eece09752f7',
//         unitroller__setCollateralFactor_ppbx_: '0x41be5f22b4c1c537b2087630774dd04e692879e288778625a32b23a408b18c8a',
//         unitroller__setCollateralFactor_pusdc_: '0x5b21a7f619286d2df9a4ccaf9be69dcd9d33f458ec151a30a1f34e7b3d2ca414',
//         unitroller__setCollateralFactor_pweth_: '0xe9e4437ba5768e44d43a80f2fd091f860c21c103a36276c46cfd407510712ca7',
//         oracle_setUnderlyingNFTPrice_perc721_0_: '0xdd56a03b6ddd1574b5ab1a6e05d1773a75677d2954bfe6fa0a85a03811b1e671',
//         oracle_setUnderlyingNFTPrice_perc721_1_: '0x3fb099e4785015bb76bd9735ef1796b67243b8aac7a6d003c40cce48ee744be6',
//         oracle_setUnderlyingNFTPrice_perc721_2_: '0x1fc7826293ed31a84265febe2b55e9e1bf2ff92ac10b957b0ef7e53aff1bcf1c',
//         oracle_setUnderlyingNFTPrice_perc721_3_: '0x0f470a3c0fd7274a684576469a624b48f43b2db2277466d6178acaa467126faa',
//         unitroller__supportNFTMarket_perc721_: '0x5a575144eca30c6a91df8142d737e581002457ecafcdfef97dbdbfad3a7ad572',
//         unitroller__setNFTCollateralFactor_perc721_: '0xfee48547263439c3051fa6694f0f436ccae31d6815631745463efb1e77c5d9b6',
//         pbx_mint_unitroller_: '0x84cbf75138e43b6990ce2a2b90881666e5e0ff83a7fbe05c7036806ec901ec87',
//         unitroller__emitMissedEvents: '0xb59d29515d746f293528c379610aef90bdf933df2258fafb45abf7bd221bb6c6',
//
//         cryptopunks: '0x5DE66382b1Eb3574b1e754b5c67Fd75788Eca6dE', // CryptoPunksMarketMock
//         pcryptopunks: '0xB54df32d2b783Bab647Ad8177f103F4603C64Bf4', // PCryptoPunksImmutable
//         oracle_setUnderlyingNFTPrice_pcryptopunks_0_: '0x1525fa52f9a3610e7d83cb80bbc08b68de1315b66ab72109b116cae145468f37',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_1_: '0xd8520d6422f8bbc11fcd4dc1ce0ba12eea9ba8dcf297d92b4d1ce233e14c363c',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_2_: '0x3bd9a4f5744f080ce759d08d9a53d842453a7c9aaa8f2a9c1c123389a08e9157',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_3_: '0xc3478d68c9aac38749efdefff5c4431ab881c8fb906860e119d2c12ef62571a0',
//         unitroller__supportNFTMarket_pcryptopunks_: '0xa5f19274aa08fb7b1168e0a7028689dd660f5c08c6fb47be987d978b41c9cb0f',
//         unitroller__setNFTCollateralFactor_pcryptopunks_: '0x05efb51b58b184b44d3958226e41d8c6d4aad99701fa2572b2663c394ebe5911',
//         cryptopunks_allInitialOwnersAssigned: '0x0822960d8dd78e1eb2c37e3e1b4fe8d50b80d23efdb895103dda84400e69b9be',
//
//         erc721_2: '0xEF3bC4B50Dee5B3b2b452fc2567dF071D841AbD4', // ERC721ClaimableMock
//         perc721_2_delegate: '0xa2317DB60dFA09B19b1CfF7E50b4828b53cc4216', // PErc721Delegate
//         perc721_2: '0xbB26FefcD3491c95564EA5CB61c124855B5b5843', // PNFTTokenDelegator upgradeable
//         perc721_2__setImplementation: '0xa06ff77b2c2b58093253d1a20fa30e8d65901f2f9fbd1d88f7e0b5abd2ce04cd',
//         oracle_setUnderlyingNFTPrice_perc721_2_0_: '0x762d2f213cf086535e99e0e583b022d197fd155bc9a3641402debfb080cf7dfa',
//         oracle_setUnderlyingNFTPrice_perc721_2_1_: '0xa2ddbd67ff057e217c2a8b812fecb39d7163d09974d5a9109637af5948b83a53',
//         oracle_setUnderlyingNFTPrice_perc721_2_2_: '0xe7c115b9379adc4b48962af0b5565d0ca7cc85deca4aff2c562026219888b543',
//         oracle_setUnderlyingNFTPrice_perc721_2_3_: '0xd1546032e4151cb62785d924c53ebd0baf9e2704ccd6da7196ac5c433edcf6d6',
//         unitroller__supportNFTMarket_perc721_2_: '0x65f69a20802ca2be55f4c2cf215fd33f9f5070c9657edd5b4f446d0f0840998d',
//         unitroller__setNFTCollateralFactor_perc721_2_: '0x108d1beba74303ef9893be31fbe2cf17754db3715479c0bddedd98e798e912f4',
//
//         erc721_3: '0x2cf836557Cfc5658d8Fe7aEBA9880f2D84C7BA5e', // ERC721ClaimableMock
//         perc721_3_delegate: '0x336eA5603f36C7D1178EE1c24F9E242F96E7a6f8', // PErc721Delegate
//         perc721_3: '0x558c0c293D95608c16A63EC796Caec5b92c85305', // PNFTTokenDelegator upgradeable
//         oracle_setUnderlyingNFTPrice_perc721_3_0_: '0xb263caaa505b953ff6c69b5c21e6cf582dec5338e4aa523814700bbd5a05a856',
//         oracle_setUnderlyingNFTPrice_perc721_3_1_: '0x3691277b94e7ada73ef7b769518193668748ce1626237855f65a0d2630d220e2',
//         oracle_setUnderlyingNFTPrice_perc721_3_2_: '0x6f3f2b7e9e4f4981b8ab6e7d44da0df7808f956cc054e74183a9221b19484d68',
//         oracle_setUnderlyingNFTPrice_perc721_3_3_: '0x9b8e8188f66adb6b04673df555b4fb246ff13dc78fda2a90a498d788a40e357a',
//         unitroller__supportNFTMarket_perc721_3_: '0xdc77b8bef21bac6d2a9b0ca6ce31811c20a606a18daabf1ed8b9249ad9efcd55',
//         unitroller__setNFTCollateralFactor_perc721_3_: '0x543e72ec8f5123ebf0fd0ae2a908b84c865bb0e24cc42ef2c019cbc682dad71d',
//
//         oracle_setUnderlyingNFTPrice_perc721_4_: '0x224b8f168ce4983d8415bcdb0b605ab66fe773f3bd48942b342b5641df5ea871',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_4_: '0x5603a85b2d2c0a5032d74da38d95dd486cf4b900f02dea08b4ee0583f03166e3',
//         oracle_setUnderlyingNFTPrice_perc721_2_4_: '0xe6c14ff0055fde5e2b523defd5f4f17d623e4a2d648f557fdfac36c78814ee23',
//         oracle_setUnderlyingNFTPrice_perc721_3_4_: '0xed1afce86c49b12bf8b9e9241e267af8a5bfbdfe68f8b293b6a80521ed64a181',
//     }
//
//     let deployer = new DeployerNFT(addresses)
//     await deployer.deploy()
//
//     const addr = "0x085cE2bF391016c0981DB049E96D2aAF2dF26365"
//     // await deployer.contracts.dai.mint(addr, '10000000000000000000')
//     // await deployer.contracts.usdc.mint(addr, '10000000')
//     // await deployer.contracts.erc721.claim(addr, 4)
//     // await deployer.contracts.erc721_2.claim(addr, 4)
//     // await deployer.contracts.cryptopunks.getPunk(4)
//     await deployer.contracts.cryptopunks.transferPunk(addr, 4)
// }
//
// async function deployNEW_NFTEnv() {
//     let addresses = {
//         dai: '0xed2285b025Fa73dCDcAFCAbFe5C78fa3cE661938',
//         wbtc: '0x6251E6F068d0def9F5EBfb2502e2D4064464b366',
//         pbx: '0x161D6B2954F15B87b78274ef9a4f9E5f5D262e25',
//         weth: '0x6ae41674f04e61E3987fb5a3871FC802e1e32d6b',
//         usdc: '0x3fE481BEdB70E5850137CDbAE19f0708dc419A40',
//         usdc_initialize: '0xb4374b1b6177a167f2426c5ed0cdb29b286a46e9f5be12abde13e412ea33664d',
//         usdc_configureMinter: '0x3db06e762d5c59b3003f09f816e25d742278341713aee3ca8d157308dba779a3',
//         erc721: '0xA03fd68631d8ED0396CB0eF0A1eA64b026ca9412',
//         erc721_2: '0x2741dD9EebE6137C2367bEDEB0Ba271f4b1eb3FD',
//         erc721_3: '0x4f4b8c53Eb107bF5B966785b02D36c45007265Fd',
//         cryptopunks: '0x6c041e8ABC399fE9ceD86034C108a1230e3a7973',
//         unitroller: '0x64DeB764EBd529d3F281b9435f9007fA760C504e',
//
//         comptroller_part1: '0x6660835AFd44782c63cC8E5E1d5d2A09CC97566d',
//         comptroller_part2: '0xE99FffBE7525CDBD800B5bEe2F117604fa0830A5',
//         unitroller__setPendingImplementations: '0x6115ecb71d031eaad08d8ad16e2ac3a83cc208e4e556d47112b94facfa294e1c',
//         comptroller_part1__become: '0x239158e3e52f148e1e5022c07d6cfa6d32400a6e7aae789b6282e07734c2806e',
//         comptroller_part2__become: '0x400d6e068a14282a89d09d8cc709b9c34c1b63e056199be27b3132056c3cb801',
//
//         jrmStableCoin: '0xe4b808d97da41608150D77eeE5f7CA6dEd3f612C',
//         jrmEth: '0xb3Aca515aeAE14E00915CbDd895279E171951efa',
//         jrmWbtc: '0x19A0e836bE52849aFDEB010F8c427BcFF6a20521',
//         jrmPbx: '0xea0C2Bfd456090a8c4dFAd71DD05F0176edaF631',
//         pdai_delegate: '0xE18718244c0a5fCc35112713E28cA67F6cA3E441',
//         pdai: '0x112E3342ABFd1d89c350cAcA026f6023Af7afF6E',
//         pwbtc_delegate: '0xb3aee9dd4CEcd103D741c1541160632F1b5f4142',
//         pwbtc: '0x2C84451aa8c0a7399b13eFBE464F19C6b9782aE3',
//         ppbx_delegate: '0xA99E9dA0378a02ddC49ACFeBEd33b77D8DBf2309',
//         ppbx: '0x2158eC1ff58bec31A192fb4F44B14D6269D07Ea7',
//         pweth_delegate: '0x03b0965d1e5356d70F9EA660fF077Bd3B6b5E4DB',
//         pweth: '0xA929003ce844167e16d03bf9d52AABE417F27df2',
//         pusdc_delegate: '0x5BE6c288bF889aD8755f29D23CcDFE11595C6D3d',
//         pusdc: '0xaDebd8a23D3d72Af2B3D3d82CDd04c5106e226F6',
//         perc721: '0x38863819Ed7e632DdE9C5D7B20AD542859EEf9B8',
//         perc721_2_delegate: '0x6e2807cc22742dd42C9bbbb290867870339e9B2c',
//         perc721_2: '0xf02e2f6F041b833255296694Bc1B9e62cB7eF72A',
//         perc721_3_delegate: '0x8ac52Cc270646dDF04AEaDC419A853823AD0E1d9',
//         perc721_3: '0x4b44eee6202d25017F66dc1F3781532130e2b736',
//         pcryptopunks: '0x58BD160bBC8DDEfAA4415D9069fCef637aAdD8a7',
//         oracle: '0x1be82722b9752c7e3b806297Ff77EAE5e3849d08',
//         oracle_setUnderlyingPrice_pwbtc_: '0xff90030d1311939e1e340307df4c0e0265689c9b98acf1495a9f911a5ec71563',
//         oracle_setUnderlyingPrice_ppbx_: '0xfcc4761a8d98888cbe101b7754ac7fa37e5c721369f9dc928f26de7b0d98bdca',
//         oracle_setUnderlyingPrice_pdai_: '0xe0fbee4e56291db9dc6cec52d8c91bb6d1c24f715e066eefe0ba15cea7dbeb67',
//         oracle_setUnderlyingPrice_pusdc_: '0x2572ea880114074bbab9bb1994b9f5e7273198ec55ddfb82a5ca35c3eda5d87a',
//         oracle_setUnderlyingPrice_pweth_: '0x52221c6c7f90d0a8cf873b8d33f46dd264ac1eda20f3caccb68c98ae35a9e9a1',
//         pdai__setReserveFactor: '0x6c07aac881d0b19a69adbfc038c83953900821d881cc40543daa4e6143dbf364',
//         pwbtc__setReserveFactor: '0x189bf5d053ee3e3ca200e18f6036bc9e46f9d9c57dbc9e205406144ae53fd599',
//         ppbx__setReserveFactor: '0x0bb2daf2a259168d2f31f46eb63f141a4c8f4ee78b98deb8505365d716bc9df5',
//         pusdc__setReserveFactor: '0x5fd82b261b75b158b466e7557c29df22dac9be4df683a364179bd3759be06531',
//         pweth__setReserveFactor: '0x6229412062bf426dbf20d76c828aec8fc49ec77dd1825deb743312a2bb2be8c5',
//         unitroller__setPBXToken: '0x65dc60cfa2567ca38e901ec493ef2475f151dadf6476bb2ef35ad6b6c1247492',
//         unitroller__setPriceOracle: '0x4dc63141a5aeaf3c61b0d11d36ef489e529a0edcd3aa87464cf3f1b60a37d6f1',
//         unitroller__setLiquidationIncentive: '0x522362640457358e2b6e7ca9dc64d244aabf84ae315a6b8be3794815025af465',
//         unitroller__setCloseFactor: '0xb91309b88332224713feecf3bb7026079120c0d041377ee7525668511738d80d',
//         unitroller__supportMarket_pdai_: '0xb70d4280ebd098298500a0341a01f4a05909abbd67dec0bcc66db0bf0b5cbc0d',
//         unitroller__supportMarket_pwbtc_: '0x3dad5afa62b72f839e7a586ba2d5469567e90706d8522752d5cd1a3293d7b40c',
//         unitroller__supportMarket_ppbx_: '0xb6de3f5be0a33cc523798c329cb9b51f6894e9cfde4a020a581d5efc3ecdae26',
//         unitroller__supportMarket_pusdc_: '0x8c29c7012c4e26413085cc06575863e63cadcf4289c9f2f62d08e5dd7ec4797b',
//         unitroller__supportMarket_pweth_: '0x8e3f1e65d1d506e0244d30a43c53e37a819e38a19c270e1300f165b50b00a8a1',
//         unitroller__setCollateralFactor_pdai_: '0xbb0c30abf73e77cb6a93c7b5b7fd213a000403543627820a078af87acd271ba1',
//         unitroller__setCollateralFactor_pwbtc_: '0x8ec1830984476dd040ac2bc9119b85eebf9dfb4300f441ac74feb8c5c0b747a5',
//         unitroller__setCollateralFactor_ppbx_: '0x1f338abb1a9f7c62d333d54d384d40971078e932e8b355b133b866342946777e',
//         unitroller__setCollateralFactor_pusdc_: '0xc07e4477a75f69f26ea12284c4c961a7462d7e720953f475020ff7fc0325185d',
//         unitroller__setCollateralFactor_pweth_: '0xafc973838d7422c7d12e74417ed7f680e4491f11103ff89e295d5deb5ba016b4',
//         oracle_setUnderlyingNFTPrice_perc721_0_: '0xb2b8da222ede8b7e90b667d83f581323f3c64b0059985bc3c7fa639305aa53f6',
//         oracle_setUnderlyingNFTPrice_perc721_1_: '0x70d54d9895f0a6ff85ad6c3dfd4cbe5a8042e737d1fd72e1ee771ea51b0322ec',
//         oracle_setUnderlyingNFTPrice_perc721_2_: '0x747dc4bf3751114b31f88c928da4814ed21af9c4f2e84a840efff70cd46394f4',
//         oracle_setUnderlyingNFTPrice_perc721_3_: '0x61a7aa6f0bc26cf5d5d7eb5b8af03400ba0016e6e55176f1e909366c25f3cbdd',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_0_: '0x4a3ae69a6c9a01ea69b00ad9457d526fb1bf4da6241ebac4015807b9180d0999',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_1_: '0xf77bcd05cc0318846a12865fd11ce91156285154dd48d71642122496eda8331f',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_2_: '0xddb2889105412ffe01e3efc1c6a1edf95b8ca1d7ef729c96acac85961031d0fb',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_3_: '0x467c0946e6335563830cc98a3e046808147922297d0be5aea8b6734a215724be',
//         oracle_setUnderlyingNFTPrice_perc721_2_0_: '0x9eb08b9523d0832413c7c7a7033a250a97c86653767f68901b6294ae202cfd65',
//         oracle_setUnderlyingNFTPrice_perc721_2_1_: '0x1e64f8a358a7efababf993af4f7fe8088f5990c09fde5b84148b13a65ddcce4d',
//         oracle_setUnderlyingNFTPrice_perc721_2_2_: '0x8b67dadc1a8f35377867bd7b7a2d342b95455a7ce92039bca5b3dc091d7a390a',
//         oracle_setUnderlyingNFTPrice_perc721_2_3_: '0xa827b516194c663869b41d12482658657ceea36f82443181a5604a5b078cd7a0',
//         oracle_setUnderlyingNFTPrice_perc721_3_0_: '0x68e50607d512f9a08d421ea5754cf7e14bd91bf9cc3e61c6c1bdcd532431aadb',
//         oracle_setUnderlyingNFTPrice_perc721_3_1_: '0xaa9cae2c22fb60a47112d808697d80c3cd42db9a23b22ad09ff7e7514cfabb1e',
//         oracle_setUnderlyingNFTPrice_perc721_3_2_: '0x5ca093c600c9419ecb4c8bd1e4e90f3eabdbd0bbcd13e059127b9bc3a8a043b3',
//         oracle_setUnderlyingNFTPrice_perc721_3_3_: '0xadb3e0ecbaff0ee31c6c5c36e82e51c543ea3a3995c6810abb72a757c17534ce',
//         unitroller__supportNFTMarket_perc721_: '0x7121be88018e7f7b57611d30bcb531d7618dd2f5e3fa4cf41913ff1e06ea1dce',
//         unitroller__supportNFTMarket_perc721_2_: '0x17a4e10d28fdca0babe2fa5e0e30b1859d615e44633d5da4ebadebc7260e7f59',
//         unitroller__supportNFTMarket_perc721_3_: '0x87ddd05bb5d1166b9427f3cfd6d88c3566bf563f67c4be1dd74382c0b8416887',
//         unitroller__supportNFTMarket_pcryptopunks_: '0x6b8253c2fe5dacbb61e50bff6d05579c80d373ae25e43b50c2a0cc41cf7e0a69',
//         unitroller__setNFTCollateralFactor_perc721_: '0xaa13d4ad9662e77f6acb7176572513828059e831bae2eeb8552e9dfde61c5f16',
//         unitroller__setNFTCollateralFactor_perc721_2_: '0x67b4b626af8b1cd8eb0e0ae8961c5e81a7b3a89181d22d477512c6194f8a6982',
//         unitroller__setNFTCollateralFactor_perc721_3_: '0x98d508520946222cf9039b7fa28233d139b3633cf0f7b1147232c37ef618da3a',
//         unitroller__setNFTCollateralFactor_pcryptopunks_: '0xc24d24efe00044244e703a7f6642b8616a6cfa15a9b9fb98aa2e96a9319511a5',
//         pbx_mint_unitroller_: '0x7141fb0c825c9a95cc065a4d3487eab863ead0ea33d9ec4905ea2a0103a8bc8b',
//         cryptopunks_allInitialOwnersAssigned: '0xcbe6817e7abc21e2732b3a1a435715621838a5eb54b25a90ece0f8827569e697',
//         nftxVaultFactoryMock: '0x35F0dc914d35d4C089F96408c2Ea8ffc26D9416d', // NFTXVaultFactoryMock
//         nftxMarketplaceZap: '0xd9547caea066482D42efD63Ce9C563d24e4c68df', // NFTXMarketplaceZapMock
//         nftxVaultFactoryMock_setNFTAsset_42_cryptopunks_: '0x1fe9f57e292a74b5a6ec442394db8c40bfc0e78c066abd99fe0c113dc09c242d',
//         nftxVaultFactoryMock_setNFTAsset_43_erc721_: '0xf381ba27090387b1d3cdebd0dd51b8b7b943488964c038f58a375c30b574ff67',
//         nftxVaultFactoryMock_setNFTAsset_44_erc721_2_: '0xd749caa4a0e4714abe07564e1cf69d51d6f95f1eae73c8da40da4d2af79136f7',
//         nftxVaultFactoryMock_setNFTAsset_45_erc721_3_: '0x51b8c8f776f6d63af615d10f9ded58b6cc1153d80e814bfb414acdfcbd3cb9e1',
//         unitroller__setNFTLiquidationExchangePToken: '0x708665303ad00415efd10c9e1b09092339b28425e11d148615ea7c1a21432b55',
//         usdc_mint_nftxMarketplaceZap_: '0x3edfddceceeb3b898ba678c2cc6a872c54a7c0cf945b19e8a28ca1f5e6bb53c5',
//         unitroller__setNFTXMarketplaceZapAddress: '0x062d5c66c967ec282db241f0080e60ae1176222abcdbcb09089ba4fec9447ac6',
//         pcryptopunks__setNFTXVaultId: '0x79822f995557fb2d28bf0bd4f7fec046b617ba6c3c5fe0ae670e63f2ced1cfa3',
//         perc721__setNFTXVaultId: '0xa6dfaba89880c1211dd3546f8cb83a36c75c6eff26dacf5e7b4bce6335e20dd4',
//         perc721_2__setNFTXVaultId: '0x44dd9bf3855e599f55ee1ac634f547e7511a7a0596ca419e128776711168161d',
//         perc721_3__setNFTXVaultId: '0x9161d9d8e57fde1f7538f28b1da6656b97257fbdac357b3cb1609720c294a4c2',
//         cryptopunks_getPunk_0_: '0xc67b22da6aa2bfab922f240124a38a734f62b04f9e18b7ca7cdb481a4386396f',
//         cryptopunks_offerPunkForSaleToAddress_0_pcryptopunks_: '0x552e693a2d01d779b7ae7b8048bdb2386f209019f465692b1a93979fd1b0875e',
//         pcryptopunks_mint_0_: '0xa15fa60cdd4586ccbd54068134f4aa19751bc971bfc8938f5bf3dcfb7f5d8356',
//         unitroller_enterNFTMarkets_pcryptopunks_: '0xf8853bb8b6edff01629d5b3938dc8b601e4009d732ff00535783e566bf35ae62',
//         cryptopunks_getPunk_1_: '0xc1f5a4431e174d749668a762c438a9565abf32838e13e1600f01670037b50469',
//         cryptopunks_offerPunkForSaleToAddress_1_pcryptopunks_: '0xb417f27a197c654ea0dcb71930a8869dc7eea666ef38cee8d485d648120bbc80',
//         pcryptopunks_mint_1_: '0x3c0a102952bb8eda057619fc8f5289ccb70b0f4a9eeced6faae7533b623529a0',
//         erc721_claim_0_: '0x7f2e3b04e851b877c4877e895ae8867e1177d2ec34751818e2eec4a6aa293c74',
//         erc721_approve_perc721_0_: '0x8958e8b2cb328ebb647871cfb58e8fe5fd9b48d8871520ffbef794766a72427a',
//         perc721_mint_0_: '0xae95a1f79a31caf595ddaf3b2b7f173f0454758e6e53a061f3dd7e41b7e08cd6',
//         unitroller_enterNFTMarkets_perc721_: '0xeffff21f480e2538e3c481c5b59846c9a8d6ef8bc1c00c631e7f3c8e8e93b2f3',
//         unitroller_enterMarkets_pdai_: '0x8abad5c5a67d76c785cb325089a17e5e32fb90e56d197c648a6b7d9936b9888e',
//         dai_mint: '0x5e77ff12900d5dd861f622357da27e2f38b3c3cb82df632759fb0fd827b30e7d',
//         dai_approve: '0x1f61217fb2be77833a426804b2e249da7170190538f7a2f35a0cc975e4898f95',
//         pdai_mint: '0x60546da6a6d30273292073888e2b187bffedeeb6766607b9f4010c293f9f931b',
//         usdc_mint: '0x406a754f2b6871018b465f04027718e03db5c2ed4a37023c8ffe937f8730876d',
//         usdc_approve: '0x802593788c4fc6a20748aea94b1d8a9e0af37928a86e06517128cfd505b363da',
//         pusdc_mint: '0x3121db5bbcde795a542eafa521bbb6ab3958bea901376782c71b6fe15d85d95e',
//         unitroller_enterMarkets_pusdc_: '0xc128fd9ce2c1c6bcb1e6dc516ec0bb082c983e89f60a89576290f003d9b4a4d3',
//         pcryptopunks_transferFrom_owner_user1_0_: '0x070c39a1fbe61530287ee6338107a98f839701b604328f2832acf3d0674f7b87',
//         oracle_setUnderlyingNFTPrice_perc721_4_: '0xa68a84d2c036b82abc7bdbfad013ce7157ceabb4b87e995f7487780894a884b9',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_4_: '0x027032f49451827d1f4692e912ec62914d0f2ca72ec50e03a707dd666818579e',
//         oracle_setUnderlyingNFTPrice_perc721_2_4_: '0xa46fc3cfadeb6a6e0ff35090e7b24bb57960581826962a6e79bc2866464a6350',
//         oracle_setUnderlyingNFTPrice_perc721_3_4_: '0xd27f455e07be853f151703bcebf154705049dbe8a52d311aad0e11bb3bb75bf7',
//
//         erc721_4: '0x71A700BFC4e3F2265150368829329cf1038BE554', // ERC721ClaimableMock
//         perc721_4_delegate: '0xc803e8420c426280d11dC38cF0B4378772C3644E', // PErc721Delegate
//         perc721_4: '0xe2b6bF5bD27C5B80E76a0Eb2DcD923d6422E92dd', // PNFTTokenDelegator upgradeable
//         oracle_setUnderlyingNFTPrice_perc721_4_0_: '0xac1744f61453f40b06fa07c39dac943d460a7ad0376540c934455fbd7d69a959',
//         oracle_setUnderlyingNFTPrice_perc721_4_1_: '0x34ab5f0045dc6b84064f1ec314cc91eedaa831053f6f5fe7898017908a387725',
//         oracle_setUnderlyingNFTPrice_perc721_4_2_: '0xaa2e0a1b6dbeb6ce6294b545b293f56bdc0f99136b15542e3592890189c98353',
//         oracle_setUnderlyingNFTPrice_perc721_4_3_: '0x938824b74bab9bafd546d508cc9bdbf828e109d3d4a40ec1f9bab6debdfdbe22',
//         oracle_setUnderlyingNFTPrice_perc721_4_4_: '0x035e3939e68f378646c614286849819db4414076ba6d3a27f9eb76e640e8892b',
//         unitroller__supportNFTMarket_perc721_4_: '0x7175c6f13f772ab5581cf9cb96a1ae5ce3b77c63964bc1666e765653055c197e',
//         unitroller__setNFTCollateralFactor_perc721_4_: '0xe4dab67a5973db08458f57f7c61f3393da29119e793ed96c2b5b194835775e27',
//         nftxVaultFactoryMock_setNFTAsset_46_erc721_4_: '0xc379f7ab0754a9ea14c617325144154d2ef513105d39ec11d42eacfec86198fd',
//         perc721_4__setNFTXVaultId: '0x4d53f1c3cbc8aaf19f82bd5ce7788b3269d9d781abc5e106e4c8a281755e23f8',
//         erc721_4_claim_0_: '0x7c1b4f9bad7a2c177dd3ac96d310e180102d400d3714d859738beba86e376032',
//         erc721_4_claim_1_: '0xab0db3d931c1702036dc75c8ca17a24ebd8fcca30a7e7d1be5fad0e9f8f8ddf4',
//         erc721_4_claim_2_: '0xe4f5f68269a8734707db09480aa7189a443814b2ea22661be7d72e0d158a0ee4',
//
//         erc721_claim_200_: '0x3ab96aed6913cbc5b9504d961a6133b28273b94a5fe24575dd9a9e099f0837ce',
//         erc721_claim_201_: '0xe355da99217f3e7457e86331795d0855781df6ba9e0e5d2c58085fe647339f6b',
//         erc721_claim_202_: '0x876bf094f2a769f810b750dd797f8f82776d1a716c17911212e68b10def70d06',
//         oracle_setUnderlyingNFTPrice_perc721_200_: '0x3ae030b2916572e4c24d69cc409aaccdff896c0081d5d8874728d1d9a16ad526',
//         oracle_setUnderlyingNFTPrice_perc721_201_: '0x5c96a6376434c7a1e92752010ac3ba36f0b37b0f2ceb71c547b307aba87d2a39',
//         oracle_setUnderlyingNFTPrice_perc721_202_: '0xca29136a5282ad10f8fb2e72147c285c73bc623a24cababf3de17186168232f3',
//         erc721_2_claim_200_: '0xf25f05d1a638336554c6e2ebd57b4d99e3bef351b2147967a03a51ab8052fb1f',
//         erc721_2_claim_201_: '0xea8a5e80ebf9740330188fff173da3084151e2deb67eae147e209fdba19ad933',
//         erc721_2_claim_202_: '0x26447ceb3b2346e284b28df7b7675ed9b8f3a2534eee68a57c62c69267afa9ef',
//         oracle_setUnderlyingNFTPrice_perc721_2_200_: '0x3931e210f90fc874ee75972db4380cb49c5c71608e96a1d810e6bd3ac3ea5b7e',
//         oracle_setUnderlyingNFTPrice_perc721_2_201_: '0xf84d969d4e8ac005b449fbc962f4267e4674e0ebb68a1893a2858c9644f14822',
//         oracle_setUnderlyingNFTPrice_perc721_2_202_: '0xa981e667f260de21039ec154e638cc43ce08ddb1b65193c0832b34610679318c',
//         erc721_3_claim_200_: '0x19d93d1a7a280413723569cc8d169b3c19177df2a99f96bdf2c4d8ccc1a3511b',
//         erc721_3_claim_201_: '0xd3e5283507cc7c1751a92d27f19c5f26e5a07eb3d97fbbe566ef8f89fe05b619',
//         erc721_3_claim_202_: '0xac973069a38829cd6824a8bcbb2935e01f0361bcdcf3f65fbc6762b4172c8c98',
//         oracle_setUnderlyingNFTPrice_perc721_3_200_: '0x68f1b23d73a2a93f8c67c3575d73add0abab2812c41add4cc27f90991658c010',
//         oracle_setUnderlyingNFTPrice_perc721_3_201_: '0xe31426b47913d7d72ebb9c87a53ea39c6ca443aaec1c5c4030b0f2dac4d20aee',
//         oracle_setUnderlyingNFTPrice_perc721_3_202_: '0xc1255725fd4a435adef1bd5148acd8ffc8a37ee0588c7c43e10d38fc72e1e26a',
//         erc721_4_claim_200_: '0x0c03e721412ef33023812afc3bf6a1e5b39b347ec2a7410b581c6ab85f1607ae',
//         erc721_4_claim_201_: '0xb71f1dabbd11c8b14639399c320c80626508a2b64cc84ad2037958a9e180ca1c',
//         erc721_4_claim_202_: '0xa73ab5f54d948a71380394eb79aeaf6ad8c256d90463f10afc670aa30da37e94',
//         oracle_setUnderlyingNFTPrice_perc721_4_200_: '0x71f077a421fdaa9e6ecbb1ebbbc26cdab8b72073b0b1005b058f9131a0acd4a7',
//         oracle_setUnderlyingNFTPrice_perc721_4_201_: '0x72999bd7698d3cc3b09a2ac663470f4c43589b763bdeaa4e344a375a42f1a4d4',
//         oracle_setUnderlyingNFTPrice_perc721_4_202_: '0x00d537249b9b7fe6f50a008f0f2b7caa446de0a9d6b81e1a7a42b24d6a8d8797',
//         unitroller__setNFTCollateralLiquidationBonusPBX: '0xce58dd3e96290d6aafee34fe2821da9421ce80836ecb64333114a4c5b4d6fe4a',
//
//         peth: '0xb8a1e7E0581F860F19716B1bfD6a4D4De17BcBc8',
//         maximillion: '0x06DC2905976aF2007828Ed2BF5BAdFF560141B30',
//         oracle_setUnderlyingPrice_peth_: '0xc9dff39a82733e1974bf6fa7eb065eb7eac72b7ee65a2cdab25f27aad5f6a708',
//         peth__setReserveFactor: '0x6ebe404df5b26acd2b97e616c1af27eab9203d099136935d4ef079875e3c9bfb',
//         unitroller__supportMarket_peth_: '0xe169e3e8ce519c0567f5a4d75ba9e6b1f941f82c458cf77d320e5c04bc069d14',
//         unitroller__setCollateralFactor_peth_: '0x75d68829b2cf8e9aba150a65ae343be3e5a2f39a17de31e719ead7a97ce02fae',
//
//         erc721_claim_300_: '0x07e809d6817e1c8bbe0c5c72ad3e756e52ac3e0917ae79eb2bfcf687760e1df3',
//         erc721_claim_301_: '0xc72a4a37b2d5077a8e16bde45ac1b413527a920d826dd06aebe971acea3036c8',
//         oracle_setUnderlyingNFTPrice_perc721_300_: '0x2d6cbeb4222c3af0b8c0843d98c581bacf0d8b45001a56bb9125cf8c1efa0f61',
//         oracle_setUnderlyingNFTPrice_perc721_301_: '0xa9487d18396356ce1a01043eeea96f600e429e384b3fa54a922f438248bf3944',
//         oracle_setUnderlyingNFTPrice_perc721_302_: '0x8f64b827cd22734b5f324c5f1766f1df4aa33d3d25255abc9f51f1a3f070d031',
//         erc721_2_claim_300_: '0x2fd3fd3acac60f297c4c7d9f67d2752be5c202e0540a948633be7ec11ca754b4',
//         erc721_2_claim_302_: '0x3cdaac4761ba67cafb76178085380021ab70d2cb9ce29332c57bb0dc9d7cbed2',
//         oracle_setUnderlyingNFTPrice_perc721_2_300_: '0x5bc5b88869182ce91a8b131f3d71f7f92d98e5a6c2090fc6e8493009b5b8de23',
//         oracle_setUnderlyingNFTPrice_perc721_2_301_: '0x86ae011bd0d38b7c3761de3973625a73d8beb6551113089908a60da5fff31730',
//         oracle_setUnderlyingNFTPrice_perc721_2_302_: '0xd62223c39c161411b74df769a295ebc4de1c144dfe31d19211547ea5c61ba84c',
//         erc721_3_claim_300_: '0xf95ef7f2e46b33d93dee143cc9dc55e98a80a1d34a7f8b1b7e891040d442d608',
//         erc721_3_claim_302_: '0xcb2c3c7106991669185b6e7ec5da7b8ac582a0f6853a6e5c8ec1740f94edcc25',
//         oracle_setUnderlyingNFTPrice_perc721_3_300_: '0xba01aaf5b2b0fb3762491982e27d65eaa4011750a0ddaaa89adb4e19b17d2913',
//         oracle_setUnderlyingNFTPrice_perc721_3_301_: '0xd341cd7c3d14b063c343876baaecdb3c603fe82b299e65e55b7594b8dedb6cd5',
//         oracle_setUnderlyingNFTPrice_perc721_3_302_: '0x540fd737f2796d66138154b5a6f051bc1dca3f94d42ba662cff83037dd723458',
//         erc721_4_claim_301_: '0x71bf0abe22e99c490766382629d6d9a958566428c2e3a8dd09c80cdbbb762914',
//         erc721_4_claim_302_: '0xade6a1f5d16e42a9a239ab1fe92e0e6e77ce9e064b2f76810e804982a8e9a4b6',
//         oracle_setUnderlyingNFTPrice_perc721_4_300_: '0x9954376fa52df99a2d901f8158b1c346dce74a5adfe78c083fe4e23959c7ad99',
//         oracle_setUnderlyingNFTPrice_perc721_4_301_: '0x6c1b8f161f41ec88bb13a548e54b7256db579ec4aeceb27d9dde4fac58817dce',
//         oracle_setUnderlyingNFTPrice_perc721_4_302_: '0x7921851c1444e8de7f0c2a0367fbbe873da3def472ee17836249ead1e32432f6',
//         dai_mint_owner_237567: '0xcbf8757224f0a36fabd1eb31ea17ee72d6f4a718bf356a0ff2191b53bffc86a5',
//         usdc_mint_owner_123124: '0x2ae9f03a66f2433b92c7da30f9cfe0c40d4e21eff71bf7778a5d432ce4448f24',
//         wbtc_mint_owner_123124: '0x42e3d3db61f64717d3038a6a9df8cf61c7032aa42757bcde5acd62c4d0ad1355',
//         pbx_mint_owner_123124: '0x6793092cd8497fef21b245ea9541b743b2043f26b1ebef2bdcbc834abf9af2d9',
//         usdc_mint_owner3_123124: '0x64174fc850c3a08da23755d9410d9fd0197e67d387337751d2d442d2a676094b',
//
//         erc721_new: '0xe43952e294fc5079DCCDFc07Ae04B79e648f0231', // ERC721ClaimableMock new impl
//         perc721_new_delegate: '0x955e084434a08D1B6D3c4D9455037D06B77ffFF5', // PErc721Delegate new impl
//         perc721_new: '0x8356E38f5dA2EDe62817Cbde4784EAd381E1b6AC', // PNFTTokenDelegator upgradeable
//         oracle_setUnderlyingNFTPrice_perc721_new_0_: '0xcdcbac30f56a11cd6817137f38f14fdb0499e7f868c180b1d49b8b11ff042df2',
//         oracle_setUnderlyingNFTPrice_perc721_new_1_: '0x6d2bfca949a532d997c96e5496af1a4e696c53ad636cc84f8535d324a11e9c0c',
//         oracle_setUnderlyingNFTPrice_perc721_new_2_: '0xb9a8d2b61f4f0ae939b10c9eef749299ebffcd88f5297c589c194c6ef04130f3',
//         oracle_setUnderlyingNFTPrice_perc721_new_3_: '0xfb8cb3f8b0a1f8e209c1898d12855c31c895532066ca2a8e1614f57eee981b16',
//         oracle_setUnderlyingNFTPrice_perc721_new_4_: '0xa908518e23a5efac076235e78bb64c9c2d6c05ba6efa380568bc57280256539a',
//         oracle_setUnderlyingNFTPrice_perc721_new_100_: '0x63258dc2939d149b785b17c81371ccc9b654fcd3414025f9dab963f87224d362',
//         oracle_setUnderlyingNFTPrice_perc721_new_101_: '0xc17f3edbdc24262ec5e3c5cffa694e38d91494d30617a68b0b9a508a97f9b248',
//         oracle_setUnderlyingNFTPrice_perc721_new_102_: '0xa07188833e910a3f7f413f85daddc9d3ed911e74f8bc5193fd9527e8a399e740',
//         oracle_setUnderlyingNFTPrice_perc721_new_103_: '0x1dd1970a424fc06873d361c630538c26a0b3332cc4889e176bd7e0c29279d2a4',
//         oracle_setUnderlyingNFTPrice_perc721_new_104_: '0x55bd066c5264464bc53a373266f44054fe1153ba63ae3d51af4f8bfa455fba5e',
//         unitroller__supportNFTMarket_perc721_new_: '0x4efe1dd70dd626654c6657a600f55e41fa2348c457ae432a6a64d510a376f0c5',
//         nftxVaultFactoryMock_setNFTAsset_47_erc721_new_: '0x589a8f488ac0af7c72bbac4d75cc0a29986f911ea14ca2a2cd296556a5793222',
//         perc721_new__setNFTXVaultId: '0x0fc5dbac55ac4bea9ba2c6929588baa64c9130de3765539d7e81e73c36c946cd',
//         unitroller__setNFTCollateralFactor_perc721_new_: '0xf0de5155d2510aa09e8546e328a2f33d0e9c3696686c0a4e85038caadd0de97a',
//         erc721_new_claim_0_: '0xe6ed88baadafa974ef4865d61328f15d24a8ae3a2083f0fbe8697f10993de401',
//         erc721_new_claim_1_: '0xcd10e148b819d3cb3fa3546d9287d8bad911c0385e21dae293270366b723bc2c',
//         erc721_new_claim_2_: '0x35f3ba9e3fb2bed51114adefefe117110ec2c2481a0f7ce398c36d303fc7230d',
//         erc721_new_claim_3_: 'done',
//         erc721_new_claim_4_: '0x207796785d5c82ca1003bb165a684d196aab1f60d7a3a5b48d48dd22357a3a8c',
//         erc721_new_claim_100_: 'done',
//         erc721_new_claim_101_: 'done',
//         erc721_new_claim_102_: 'done',
//         erc721_new_claim_103_: 'done',
//         erc721_new_claim_104_: 'done',
//     }
//
//
//     let deployer = new DeployerNFT(addresses)
//     await deployer.deploy()
// }
//
// async function deployGoerliDemoEnvInternal() {
//     let addressesNew = {
//         pbx: '0x7923bB0d406311eae3DdAc869fbAfE7a483608C4', // PBXTestTokenMintable
//         wbtc: '0x2511cBfcb3a4581C128dD6e0196a618f25E1a10B',
//         usdc: '0x06698e5d51bd05Eb3551a7Cf9DcA881aB069A9Ba',
//         usdc_initialize: '0xbf91ae4e35a81765f780cfb26696c5cdfd1897db53824c932122c02012c537f6',
//         usdc_configureMinter: '0xb8b3ce829724f65a648dfe8117010b2248cf7bf04db72be8390285931a1905d1',
//         link: '0x6E3c9208bA7D4e6950DC540a483976774Cf00D77', // ERC20TokenMock
//         unitroller: '0xf6A4bAa0Ce3f33985caE4650b521201095529fA8',
//         comptroller_part1: '0x592E96aa4d26F50bE8980b9618068dAb3503E76B',
//         comptroller_part2: '0x9Ce1c1f3582b7B7E9CBEA93F20126718c3F31a08',
//         unitroller__setPendingImplementations: '0xb759283b5c317415c000a9861a9ccd5c7d3f5bbc9a231419fd59695aa04e2772',
//         comptroller_part1__become: '0xcb6993a61fe342e4d67a3a856a0dd9184274cf4b2124af76460762ac190adb73',
//         comptroller_part2__become: '0xb033e606d3dcedd213d828015d1753ede293f35444c106fb45c2035471e3fc0c',
//         jrmStableCoin: '0xaeC6fe60D2E63ed198E87B108185C208C06151eC', // JumpRateModelV2
//         jrmEth: '0xef9A6011fd5cDcCD782094494C0394bd5BF18f4A', // JumpRateModelV2
//         jrmWbtc: '0x5F16Ead1F2a945AE3D25cCa296ca57528Ab4bDf8', // JumpRateModelV2
//         jrmLink: '0xBaf5bfb0072Df4bAF28867bF5401BfC304770154', // JumpRateModelV2
//         pwbtc_delegate: '0xAA97b9F6751c623bB6Ec1437fe33f787fE858e16', // PErc20Delegate
//         pwbtc: '0xbd56D58077D573240811aF117d73726f5fD561D5', // PErc20Delegator upgradeable
//         pusdc_delegate: '0x62604E90161fDCEeeB4147c0D7cF61903A526875', // PErc20Delegate
//         pusdc: '0x851De5d6EBF9b48B278c48D17Bf9B9d375BcC106', // PErc20Delegator upgradeable
//         plink_delegate: '0xf12e620882Ca0D28BeC74b3a39AFFc21D786c357', // PErc20Delegate
//         plink: '0xa08906C1F0390945C8e2D3021C3712662eF55Be7', // PErc20Delegator upgradeable
//         peth: '0x9517c419f5b9A9C7e876B066543d36d798c23fDD',
//         maximillion: '0xC23Ab08Af4f1121346c1d12443bdABB65A3e0d0F',
//         oracle: '0x70e1a210ac6bBEB54173E4F00b63699Dab22829d', // GoerliPriceOracle
//         pwbtc__setReserveFactor: '0x71cb083cb7d0069cc0871d50b159746297281eca2c6be8b296ef30a213c735ff',
//         plink__setReserveFactor: '0xab7510fae60b989aba0679b8664ebbf6964cf6f9e71337429ecf9eadc837cd09',
//         pusdc__setReserveFactor: '0xc684a47e4e84b56619b3bcf643ce801daa1da16b092835597f77de204391000a',
//         unitroller__setPBXToken: '0xd7ebb5f9b6df514f18fee89d7a9e8daf76b6475bbfe875a23619d82f3fc1cb2b',
//         unitroller__setPriceOracle: '0xb36beea6c88e8ef50233d73b64debf28b0af0d16c4caf896e10710f9a91f115f',
//         unitroller__setLiquidationIncentive: '0xbdf0774ae6f3ef08975f5c63ddcde00701659c4e4e1609e1477ce8aa8f86aeb8',
//         unitroller__setCloseFactor: '0xdfe6555c9f36417d7aab200c9fcbeaf767e3a868ac69fe9bdad49777534671c1',
//         unitroller__supportMarket_pwbtc_: '0x38b7d0d4d0e5d5d088a334585821837f6b8ff6ef6c7f6cf1d9879648b89e2cdd',
//         unitroller__supportMarket_pusdc_: '0x683b49eab58d2abd6343896571d468a8f5ad85bb1ca1760ccddcc97af7cdb93d',
//         unitroller__supportMarket_plink_: '0xea2f21f610a8374eb9b8206663b7b0023d34abfda515371934b7366aadda86ab',
//         unitroller__setCollateralFactor_pwbtc_: '0xdbccbfa4ef73a0c48c3a75425183911cc0df8a691c5640d1d34e7183a30c9abb',
//         unitroller__setCollateralFactor_plink_: '0x299a361d414eadc682568724353b9dd6df6ee75d72e319ce58e67013908f3ffb',
//         unitroller__setCollateralFactor_pusdc_: '0x060bf16621fe4cdcb6713f7e0c0c9fe4c62af2e5332b30a6f93fe37b15fe5164',
//         peth__setReserveFactor: '0xabddeb601b3811e9f857e099b394651bdbbbb8bcd6e0b086af83fab50f3db46a',
//         unitroller__supportMarket_peth_: '0x44b7518b3d2121959b0748a560f4990b31d79a6972e9ddd1dc93412a0ca46895',
//         unitroller__setCollateralFactor_peth_: '0xb2df0788cfdfad21884f1dcb474981f7117f447a96f759bd750ad901b4de6eb0',
//         pbx_mint_unitroller_: '0x9da941ab8526b5a272a3bedfc8a106bc18cd0397ad9427afd0aa068f4e2d2b44',
//         wbtc_mint_owner_: '0x26817533314d300d610aba2b4cc9ebbc119d22e95e94ab23ed72fc98fdc922b1',
//         usdc_mint_owner_: '0x54cc5fa32c5046832d55ee78614b5b4dfd8757b4e4566e5bd4b823333a603967',
//         link_mint_owner_: '0x622cec4907f32cb31dc94fd68512fb66f7de7574c06e904157e5f05192e94471',
//         wbtc_mint_maciej_: '0x2f8f2b8b2f4a7d644783af2694f78badd3f07d55de340f0fbe5d40f7a4b6c8bb',
//         usdc_mint_maciej_: '0x328f0ac15fadf4c80234bde38b95d74f4a7480662e3a386cf47b18b15d18c01b',
//         link_mint_maciej_: '0x2445bdb732188d3dc42da2fe7589b4f3cd75cc39f8806f6649ba3fe865b4677b',
//         usdc_mint_owner_2: '0x40fa8b352b7632b2fdb4f8b8cd7ed60363ce48a8b7b656e9c86cc2ded4384d3f',
//         // OH NO
//         pbx_transferOwnership_simon_: '0x667edc182c123bb78a59a3d50f07874054e16494250944e52913d83f7337de65',
//         wbtc_transferOwnership_simon_: '0xaa370922f02e1b80057e7bf359e998eb697a6308d34a0d114a3ec0b03e9a0ada',
//         usdc_transferOwnership_simon_: '0x8921b84aa94dcdfdbd2eb65c799ded18fb29c5846a12cd909fa6c2b9d94584fd',
//     }
//
//
//     let deployer = new DeployerDemoEnvGoerli(addressesNew)
//     await deployer.deploy()
// }
//
// async function deployGoerliDemoEnvPublic() {
//     let addressesPublic = {
//         pbx: '0xbFb5750abb97c7799e43787a88337571A8a5e6aa', // PBXTestTokenMintable
//         wbtc: '0x348AF93fa489a2CdA7B3D75B8D17DC1f3cE0dDe7',
//         usdc: '0x4EA2749E7220C885D278d93217dBFBa7c094eDA5',
//         usdc_initialize: '0xbebdced9928e74f45ae8e1c16df90839c40a515344442de052c5cd0655641601',
//         usdc_configureMinter: '0x1fdd383ad47bdb5e203d84bbf417a8a9c0826d29a2d96e886ad596699cf490d4',
//         link: '0x4CE552207d863b39cB07CB33Fa6EC8D158044167', // ERC20TokenMock
//
//         unitroller: '0x7051a3e2B79fb0a2a4BD6ae5DeC67811aCBfEAFC',
//         comptroller_part1: '0x8830a99EB043F136A6B8b2057b7084eb05e9a8A7',
//         comptroller_part2: '0x85f04189D73785Ef935969b78AD2A9A3A3529F17',
//         unitroller__setPendingImplementations: '0xbc6df75917f4298d3e21c16e2d666af0636ad063001107b3e9ed6f9c55b2589e',
//         comptroller_part1__become: '0x020bc87f0a4617ef9662ea7439e54898a07ce02e1dce51cb99e5b7ff661f25dd',
//         comptroller_part2__become: '0x4dc2d3cd4ac0f23b279d5acbf84bcbec203bcbfb36a47ebcd39e5cbc59fbd889',
//
//         jrmStableCoin: '0x2Ee5aBA2D64660Ee3ffc19D62Aa9c948e6905e6A', // JumpRateModelV2
//         jrmEth: '0x75C6F9611236E759DE50E259ed3c84aBf2d6345B', // JumpRateModelV2
//         jrmWbtc: '0x6C59C4D46b1Dd71dFA34efc3181b8f72A29E3bC4', // JumpRateModelV2
//         jrmLink: '0x45185F0907982b82942cc3014D2C8f1c20e87D54', // JumpRateModelV2
//
//         pwbtc_delegate: '0x0F0a60Ae1F10B9E8377525D07bCd958c9ff1E791', // PErc20Delegate
//         pwbtc: '0x2F69629AaD341E97A275293F7BcfC8Ed5DA37BA0', // PErc20Delegator upgradeable
//         pusdc_delegate: '0x92d58E6f67FC28Bd765b7D8E5c2de6777e30fcbd', // PErc20Delegate
//         pusdc: '0xaD470Ec9EB0b5089f1DA27700a03CDB51A1BF965', // PErc20Delegator upgradeable
//         plink_delegate: '0xa8e912773F3d07eBA0704Be1992946652421FB0E', // PErc20Delegate
//         plink: '0x5756D09708A227DFfbe26AF43f3b69a047111190', // PErc20Delegator upgradeable
//         peth: '0x9997cC006b12D9Cf9cF157086c7b49e65A88ED0F',
//
//         maximillion: '0x17bFB9Ab5B9289e67B52b0186FA0113c1A96e64b',
//         oracle: '0xEf47d801a2C15897867CB83bF755D2acc772063A', // GoerliPriceOracle
//
//         pwbtc__setReserveFactor: '0x4f1e04807e98633557315c74b0276d93e8cf4f84588fcfcaeef101f291f00aae',
//         plink__setReserveFactor: '0x8d1a9dc00e59e3e615c4de6bd4177211892febb8f2b3d35a58dbcf9509c20b64',
//         pusdc__setReserveFactor: '0x79a91d1fe4822aeba31687f4010c8b76b242d23f5a078a4711daac63d46992e1',
//         unitroller__setPBXToken: '0xce168779efad07f7ec34fd3135b0d76bad11480366b60cf264bea37617655c72',
//         unitroller__setPriceOracle: '0x590b6ebee7b8745118bfe5154e3577fcb24cacae3938f429328fc4e449d9b990',
//         unitroller__setLiquidationIncentive: '0x4647a7241fef0f58ff2c22b1777f60be0348f1613f8a40b0f6e1c60df6dc28ac',
//         unitroller__setCloseFactor: '0x91793dd6c6a16c9c726ef88184b2d91d251c6b4f28b34b258fbbb6b7a0937cd7',
//         unitroller__supportMarket_pwbtc_: '0xd8648e9bdf6aab70fcb65ae7578442f0a19e90ae5204da84b96dd0ce0366b12c',
//         unitroller__supportMarket_pusdc_: '0x347e660d67d849f68ca96e23cf3d620bf2ba60d3aa4ccadc2d87c3e3324436b3',
//         unitroller__supportMarket_plink_: '0xb9b561c64261218764b1518f01c4ea7378fa5486a3dec49f8258fa0a386e21f9',
//         unitroller__setCollateralFactor_pwbtc_: '0x3ed5199c30ee97da8cc02d4cfbc3b752c06ed760c703bb9893170d627263e80a',
//         unitroller__setCollateralFactor_plink_: '0xe5dc5320e2f1a5e090668823e95f48f4ef5339cedba01f837f17fd67bc57dba7',
//         unitroller__setCollateralFactor_pusdc_: '0xfd61119ea280f87e85daf72c9ebe7099960e4f12c583630715f6196d7b58a5ba',
//         peth__setReserveFactor: '0x0e7ebfbdcf468bb9412ab4012b3bc018b385044fbbf31d5b43e7e6648332be90',
//         unitroller__supportMarket_peth_: '0xe51f84e11065c440eccfdc8573f01dd3542f52a56e3e6dbc3efc01976a672bdb',
//         unitroller__setCollateralFactor_peth_: '0x3144ee5048ceb02cd2dc0ad0d7cd71dad2ef3ff4b5a0b0f059631d5376fabc43',
//
//         pbx_mint_unitroller_: '0x7bcbaa5f1cf257371d5cd22f50cd584581163a869e6e8cfd04d3902dd67d0814',
//         wbtc_mint_owner_: '0xccf735424ca20afc1be3f5b270719d9e2044d0a0dbde5cb2c6daae9190cfa831',
//         usdc_mint_owner_: '0x84349e9c6e590eaee60a3f0b3d1ee934d97c87041b190e2f033d8ae3ccc39ae2',
//         link_mint_owner_: '0x74564a7e3acf9c5c1d6993e529efc10f2985734d5e20c5a6a8bba91cc280dd02',
//         wbtc_mint_simon_: '0x694c0aa4d651fe847f8845a7a36b13b51ef5badd2722ef2f14b62bed845a7901',
//         usdc_mint_simon_: '0x8c34346890aa2eb51c8236d70a1915ad7ff951e89a23ba9a78da64705519f60d',
//         link_mint_simon_: '0x909820cb676a4cfb4da04ed621fd1c1f2abc1f32bcb403bbc94cf59b24d3735c',
//         pbx_transferOwnership_simon_: '0x130f1d4c0bb0f3641490b6bdfbc732471f5881a19fab2d51d9a3ab6230a20d41',
//         wbtc_transferOwnership_simon_: '0x11f69812f7ce322f3f050a5aec7d310c52385d881493bd63e449a114ee318917',
//         usdc_transferOwnership_simon_: '0xb76f07129f04ee203978bbce928e6ac024945e8c51546b6abefe99ef09f7f47e',
//         link_transferOwnership_simon_: '0xf836ff9080bffd69dcb50363b2d03bdc2c6e9796d1d1d17c9a5384763c453f64',
//         unitroller__setPendingAdmin_simon_: '0x938f2c02c558a3cc22b35a3a02d426950943568c72c5eb980f674a326215d111',
//         pwbtc__setPendingAdmin_simon_: '0x3fa2311c850a7bd04a01a8017fcbfe12bc8cfc0ed5314ce5bd2a7a95e4aeced5',
//         pusdc__setPendingAdmin_simon_: '0x0c8a9745eb0c468dfcbd4c94ba6c49416b10ac85aff5f5ca319b886f6483a933',
//         plink__setPendingAdmin_simon_: '0x0cbe6b69b84182ad83563564ad82c0e06a4f80dc3b4d8759d357282b270ceec6',
//         peth__setPendingAdmin_simon_: '0x184320b6a464e5d7ecdf590527f4114924dfb4d06993e0fde6cf075f15cd1b83',
//     }
//
//
//     let deployer = new DeployerDemoEnvGoerli(addressesPublic)
//     await deployer.deploy()
// }
//
// async function deployGoerliDemoEnvPublicNoNFT() {
//     let addressesPublic = {
//         pbx: '0x2D3cBE0811d2F6AA85dcF8BA9FDF076ea7C5EEC7', // PBXTestTokenMintable
//         wbtc: '0x66D73c50eC538b13AdaFA699A107123ae69bfe16',
//         usdc: '0x9b4C71f39E8859403A2184F609B8579f6B594025',
//         usdc_initialize: '0x78553fe3acf0c53f89cdcb3f17b5f8b4a9b441d2c74601e6d6e9ecd48a8af68d',
//         usdc_configureMinter: '0x6b28ef5ba9d8a96ce0996e398529ae24f39d26845f4c64195eb3468a7ba8506a',
//         link: '0x2479dF0d707DE5aD2e800267bB6A137D3d04747D', // ERC20TokenMock
//         unitroller: '0xaA5e6e91Ba77802aF04907b33614Ae9a4d9F803e',
//         comptroller_part1: '0xf964ee1953a45A68A6762c28Ca9e29E9FD38B5A9',
//         comptroller_part2: '0x4785fE9a2BF499b2Ad0C3795e6ae722eE12D22da',
//         unitroller__setPendingImplementations: '0xcb08fc0ea5ac55e8570f020dc889e5a0bce83553dbf967f47a8133905088c5f1',
//         comptroller_part1__become: '0x188d55de21998d31087a9d6289ec348760d865447f411a6b1b9e240d59c7fb06',
//         comptroller_part2__become: '0xf4a0d5673eb3c6d587a3fe281d8e2f06c3c2af8cbfcd4294e1b5f3e02111a93c',
//         jrmStableCoin: '0x78cBef98aEda193B781FFc3b28d8E8e238B99d33', // JumpRateModelV2
//         jrmEth: '0x2Edf4099A88f63fEC9c39E96ECa5d0dcD504B589', // JumpRateModelV2
//         jrmWbtc: '0x3D2a71722d74B5290DB7f98e6707dE02C8811f34', // JumpRateModelV2
//         jrmLink: '0xd8Ef0fC63B734D6Cf8f802470837De5991624bc0', // JumpRateModelV2
//         pwbtc_delegate: '0xb87E015fA6611aD8ec302872cEa8849b32fA11D7', // PErc20Delegate
//         pwbtc: '0xdDc55B054b3cCDB7a37E72b95193C8d6Ee1055b1', // PErc20Delegator upgradeable
//         pusdc_delegate: '0xeD90D1f53605390A486BD2aAFe306936754383d7', // PErc20Delegate
//         pusdc: '0x2dEC21E3f46a34337EF61c4c0dB799F46A257018', // PErc20Delegator upgradeable
//         plink_delegate: '0x7205829aeBe176801395F975f8C91ca6CE5d9c29', // PErc20Delegate
//         plink: '0x4B16a597aca60F26A33a80cef2f75dB1B31C4059', // PErc20Delegator upgradeable
//         peth: '0xB4f15260A897062441632FeA025583C7740B1198',
//         maximillion: '0xa745fF510DBE4DC1A1f5fcD6f8b3D78DC7E8BD6c',
//         oracle: '0xed6EbE8E2f6C7b391085bd9dcC63102984A5563a', // GoerliPriceOracle
//         pwbtc__setReserveFactor: '0x14ee0b43df9d84aa94c0918b19722fbf22d7949b7c9a237e3ec86b2c8e9e1dfc',
//         plink__setReserveFactor: '0x30a1c9744c17cc6f135d787a422c6b77e60042fe87189c4540e87b81bc14c9fd',
//         pusdc__setReserveFactor: '0x96961330804b1709742f5743cb2206e52e3fb13652f991020e19c25795dd6035',
//         unitroller__setPBXToken: '0x23edf15e5aada4afdae7747c73785b9e18c3bcb417fb42c63cdaa4593fb7c6cb',
//         unitroller__setPriceOracle: '0x506cee32facd1974086f00fe9374f231cd46b11858391fd431d4bf2779798c43',
//         unitroller__setLiquidationIncentive: '0xd6c21f34745b298be1d9d7c527fdd779cc0826c5066b25f4a94952f397990eda',
//         unitroller__setCloseFactor: '0x94a5ad343b7c590e01ad500125607eb60e552bbb1e85d19c6aa385c96e5c8f15',
//         unitroller__supportMarket_pwbtc_: '0xd5ce0230544fe4aa3e78c1b89767d5d7809cc31c6c64d461a37eea3c99d01ef9',
//         unitroller__supportMarket_pusdc_: '0x1d1428bef21a2bc684d9a2ea49ac53fbd89874f02a32712937e62067db0c3ee8',
//         unitroller__supportMarket_plink_: '0xfbcc1c3a25ad887952d0274e41f59cee37cb0e00241129efbb7f1118260eda99',
//         unitroller__setCollateralFactor_pwbtc_: '0x86cbb9eb9ac5cbd5a4f7e909bc8b5d1e01b585e7e6727c26d24839ffd7b03f00',
//         unitroller__setCollateralFactor_plink_: '0x7018e323707df351feccd029b4657eaf6e95c90592a41d1005ddcdcca8bbd645',
//         unitroller__setCollateralFactor_pusdc_: '0x51ee9adf6e3624457d82d28eca1fde87b542c94075461c8612d5cfccf764b58b',
//         unitroller__supportMarket_peth_: '0x1e7eb0df355a30befe0fb5f1892921a1f5fdafad56decd7917e4a6cade96008e',
//         unitroller__setCollateralFactor_peth_: '0x0eac67db657f610dc3549235717c3a3d870e3f743689c14471a9e87dca9927f9',
//         pbx_mint_unitroller_: '0x940f76e7bc35f6e2f097c5ed7118b58eb300496903e6bd9129d2e28eb4cdcdad',
//         peth__setReserveFactor: '0x4400787b429293fb844a50b24f5c8b118e9087cb1ca1a92a71522c14ee39a8a4',
//         pbx_transferOwnership_simon_: '0x9f10f2e9089411c715e31aaa4fae8686042e1c7570756f0074d15fe272005ac6',
//         wbtc_transferOwnership_simon_: '0x5730c24cfe7f53804b59c6d3251708e4c05951e1f8f88c90d81aa8addd4055f7',
//         usdc_configureMinter_simon_: '0xbdb2fe94c8fca6ae0decfc76b32fd80c0ee75110758be9dff1bde05134daa279',
//         link_transferOwnership_simon_: '0x6aafd1cce43f9cb34a832fdfbf5773ce3e4b40556ea3201f4cc76117d14819f0',
//         unitroller__setPendingAdmin_simon_: '0x54b66bd358a9cbe86a47c93953327f203ff4fa897ff8abcfc796f3da967e9299',
//         pwbtc__setPendingAdmin_simon_: '0x82decf851d94d53cf74cd6adeb8faa7a8911f463c17ac010da231f41da9ce318',
//         pusdc__setPendingAdmin_simon_: '0xa2e293d5d67b1302f7b7cdefec8f463ad9d5683adc66c6241cf1afb6d1a11f74',
//         plink__setPendingAdmin_simon_: '0x38272148ade2704f79c9d22b3fc864e604d50ff613dbc41ae542b92b91052e60',
//         peth__setPendingAdmin_simon_: '0x38c71464c586dff0405d3ac7a63c7966bd6858cbabb82363238d586762ac2aa9',
//     }
//
//
//     let deployer = new DeployerDemoEnvGoerli(addressesPublic)
//     await deployer.deploy()
// }


// async function deploy_NFT_DEMO() {
//     // MUMBAI
//     let addresses = {
//         pbx: '0xedAcA3DdfcecfA782B649F27d815Fc0Cb628CAde',
//         usdc: '0x77da34e6A163b3eCbBB243Aa7b7720Cc3ef8Bc59',
//         dai: '0xd262c03042f16317DFd5856f67E9B9eFf669deE0',
//         wbtc: '0x53E88FC09be3C528B1103bedE7976dE473F49095',
//         weth: '0xf765C73624F7A8C658B7D8d488385E77Ef87A1DF',
//         usdc_initialize: '0x0a0f2445b877b86f5ca1f06fd7ee572b4ecdaf9862c372587e98535997aebe49',
//         usdc_configureMinter: '0x574630b7b78b8181a94eb9953fd7739f74ab4ec326ea263076748f8eb5dfe9bd',
//         erc721: '0xe5E736c2CBDed97Eb6352d1B5AF609A6FDB8F7Ec',
//         cryptopunks: '0xDb3C6afDCF8cB4ADCffe813AA72fee2D19Db9C93',
//         unitroller: '0xAAa92f5436Bc6500e2D3F4A0e83Ea6dD13295044',
//         comptroller_part1: '0x9E7C0d9Fa82078234734013A6488c64C36f95F7f',
//         comptroller_part2: '0x549c223039c6197Ba2051f63EA34d535Bc26C6cF',
//         unitroller__setPendingImplementations: '0x2e26cef415df84c3d516c084f2bfb35ed2a728e52354827002bb7641743b8daf',
//         comptroller_part1__become: '0x9e63f7ae33367dc8085cd7c6a152fe1f56df371332ee6fa91496e16b9fcc6e01',
//         comptroller_part2__become: '0x62f1712e78e2f155470adc1ef43c473ab07d3c838da332dbf1fc7ce99a2c125d',
//         jrmStableCoin: '0x2c008807F007Cfb0C116E5612c24729E5793Ad9D',
//         jrmEth: '0xD87A2Eac47D52bCF4Ebe7De7948bf4d7B377a0CB',
//         jrmWbtc: '0x45E24c26EBfEF5984aA6e4AF2CB3f340f2bB48fB',
//         jrmPbx: '0x86D7eC88964494B43E56353a1f5f103E4ef9A558',
//         pusdc_delegate: '0xfCA9ba8F0F985A7Ab9E5CFA32Fc13e496a8F0887',
//         pusdc: '0x0743A04052C1e6118D0cAe54746aF30327F9ede5',
//         pdai_delegate: '0x219A2Cae209E922fb4168b8e4059F876Ba3FD4F0', // PErc20Delegate
//         pdai: '0xF5F25603001106183F53Dc47d5Cf6D57128B2Ee5', // PErc20Delegator upgradeable
//         pwbtc_delegate: '0xa11346aF5E9f272F5dad27ff448aC11418243dCD', // PErc20Delegate
//         pwbtc: '0xe64A910510263Be5D0ED7DD1e59E0c60B35b3631', // PErc20Delegator upgradeable
//         pweth_delegate: '0x8909023C6323b61C9Ce6eB11049044e07E5b7F03', // PErc20Delegate
//         pweth: '0xc25784BEcEceb73109d7e822e857C1cF86df9160', // PErc20Delegator upgradeable
//         perc721_delegate: '0x692a57344Bdb30BC6d4d6f55f4ADF3e0e48f3830',
//         perc721: '0x492f6A311939A2701C24c313944454302Bf4A959',
//         pcryptopunks: '0xcC76034dF7611aC8255016fa161cb8493884ACc8',
//         peth: '0x53337BFFe5Be0c0faa42A203c04bfEf23D4E40ef',
//         maximillion: '0x4cD01D853Cb5FCc48E57730F704E4d7c7FE3ED02',
//         oracle: '0x7c2ac7E7D50f8770c73D25b5B31A8b2f2C8fd926',
//         oracle_setUnderlyingPrice_pusdc_: '0x3fbff57fe87a7003f9d0e0a908ac84da67fd17a0e843a4fa83b401a1dd4f1649',
//         oracle_setUnderlyingPrice_pwbtc_: '0x7511f012ce5e7f29e55b18cc57e22f2bd937c5ec77f8e47b5428189eea9f8058',
//         oracle_setUnderlyingPrice_pdai_: '0xe56c953c8000dca0e9487236be0f778533b95c3c991a5785eb12859345e52c42',
//         oracle_setUnderlyingPrice_pweth_: '0x72d3fb1d7afc7b168ae4606ab50cbc0ab9b9b1e5d72e526b85b1606187d74311',
//         pdai__setReserveFactor: '0xd43db374891a065b60d4bfc27b6984e14f508f840a739bdd502196e93e030b19',
//         pwbtc__setReserveFactor: '0x47ce3038c1840ec8e02f5496cc3d5000d60a82721dc24dd6d8c6614e2399514e',
//         pweth__setReserveFactor: '0x0f945b08306b8a1b2b5b474c7f5bd9bfa6f3bdf95a49ab28f1c0fe756bdfe10b',
//         unitroller__supportMarket_pdai_: '0x0725c67a8fe39e1fa079a8d2416d325f30918a0c677fd1509a61b1ce772fcc84',
//         unitroller__supportMarket_pwbtc_: '0xf9bd7d352707d9d1f2fa5346fabc5247980120fe4d08f80139b90c00097bd0a5',
//         unitroller__supportMarket_pweth_: '0xba47b64b808f05d169ebe50aa8edf6debc15911816100864ae3506360dc285bf',
//         unitroller__setCollateralFactor_pdai_: '0xbe3c267870e79de311710b0176a4e2e5517d7f4ababdd9e18e7168710579fbcd',
//         unitroller__setCollateralFactor_pwbtc_: '0x3479acf05b1381c0cc6495c5e7cf9814ecc975266136230b6698836299c2720b',
//         unitroller__setCollateralFactor_pweth_: '0xca9445173a476d809917f1e45bc49dbdfb755b762bf8336226236999426c4d3b',
//         pusdc__setReserveFactor: '0x7a592047657647cc36576026ea8e9ad1b58285765bd588073f10bef1940b3f39',
//         unitroller__setPBXToken: '0xb3c0c374ce1d601a104563cfd91f08305743674c6db0ff7774919ea69521a7fe',
//         unitroller__setPriceOracle: '0xd3af74588a59c8add2f6af0804306b956d77be57e3e32246ecda313baa3273f2',
//         unitroller__setLiquidationIncentive: '0xbf57459cf0743b8577269cfae0d4e5b71078e87e8d6c68457cdd7cb0d6ef62c9',
//         unitroller__setCloseFactor: '0xe6fe4798f4ef1ca7184241096925996fb008098a089a14a9009da4b7d7a75af2',
//         unitroller__supportMarket_pusdc_: '0x68017ca7d4069fbb54f2cb5677fb320817cefbab9dbfb383f689a24a1896c07e',
//         unitroller__setCollateralFactor_pusdc_: '0x454f858c3239715a77e2842ac2ee91a4fdfe103a9718c2b4d6abbcdfdefe582e',
//         oracle_setUnderlyingPrice_peth_: '0x6498f4e2a7bc19e08a3256b196c05bf9c12ec5602f4a3e5d8e9b5824b73897d6',
//         peth__setReserveFactor: '0x96ebed7dacd9fc74debc0d3ec1e81ca8e46989d657f01d4cf3d23c44c2fc3caf',
//         unitroller__supportMarket_peth_: '0x317a34cd2ec27f863ae76ffec5070e9958b0c0b56483cca49b51a8d3264d26bb',
//         unitroller__setCollateralFactor_peth_: '0x683444a9c847cad844975d3ccdf7eb4eea5b0ca0228e0c7c6f08f5db7e03cfc6',
//         oracle_setUnderlyingNFTPrice_perc721_0_: '0xe7e0a8ed63e63cba9a036274c54fec0ffe7a721045174884cd8d69d79a47fb31',
//         oracle_setUnderlyingNFTPrice_perc721_1_: '0xe5dbfd71971fadd3ed62c541c829fa6a33d7890500b77a3029ff0b36667e22b2',
//         oracle_setUnderlyingNFTPrice_perc721_2_: '0xd0ee3791718699ef23a4fbdbc9da59f97e7d93a6f24da3ff004ae21f2482ffaa',
//         oracle_setUnderlyingNFTPrice_perc721_3_: '0x61097b0ae6a99a7687de6e391994ddddd6fe46c8f2ee7ef7a384e35b6b37f8aa',
//         oracle_setUnderlyingNFTPrice_perc721_4_: '0x64b73f23d7f4fe9a8738ec0170d691ce1cd4726f61a3a8b7951b51b07b142ea4',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_0_: '0x797c2c4fef8824442cbc6d1b723cf7d0af277f16032dd5f5e4af836543e3e4f8',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_1_: '0xf097482810352cd6e50d9e4843e0215c18b2ea34c47a8b78bef5af2f2d4d9b91',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_2_: '0xba5bdf999a3c25323c98e9ec2ce67ecc444075f18d750f7a470ba6791ebe601c',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_3_: '0xf3a83a27504a2e9bc7e4a7cf7b15b3f866ecf3e6e042b65dae2d9d467955a772',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_4_: '0x848f631af2147d06d498c5d18c4d5e0377c80ee2f54e380abeb2180d0bc85418',
//         unitroller__supportNFTMarket_perc721_: '0xb379987cb62945910c0ed0648a964ba1a16d4dc966475b6a1924cbc1c941a432',
//         unitroller__supportNFTMarket_pcryptopunks_: '0xbf960e8291695681fb36132afb41bfd1ec6626f6de30ce18508e9caaa2534e1c',
//         unitroller__setNFTCollateralFactor_perc721_: '0x21d1d194732c996027bb1abeabfc6dc40c30e61228f424fd3ae145b28f92d69d',
//         unitroller__setNFTCollateralFactor_pcryptopunks_: '0x4f2eb8a51ee291541671bd90e5e5a8383ba42e401e823556cdf42414ee40c356',
//         nftxVaultFactoryMock: '0x442B6c5623258ae3C22233CA9857Eb261D53136c',
//         nftxMarketplaceZap: '0x5D537c85D32bb7aE72e0B9A03c3000B6d0978Ac3',
//         nftxVaultFactoryMock_setNFTAsset_42_cryptopunks_: '0x1864c19d568b3e63737d430e9f49b32ef467302b7af2a7a598bda8257e763164',
//         nftxVaultFactoryMock_setNFTAsset_43_erc721_: '0xd81fcdbfe1d38d63daf121f4a7fc26456686af0ad5bf5fc95801647ee981074b',
//         unitroller__setNFTLiquidationExchangePToken: '0xb5ed465655af043ec3e16ca6b0714d15994c4273f05925abfec4b041e9312aa2',
//         usdc_mint_nftxMarketplaceZap_: '0xe40f2553a6746ed357429e1efdd3d198422c0851586cf4bbeb7a3249b407d1c4',
//         unitroller__setNFTXMarketplaceZapAddress: '0xa370d7237d43abc93e8299441dfbf8537226574591294cafaa1e09c7e23997cc',
//         unitroller__setNFTCollateralLiquidationBonusPBX: '0x8a9038d6cfa0d34e41c961b68b6bff944466ab8fae601974a1d3a853931da1d8',
//         unitroller__setNFTCollateralLiquidationIncentive: '0x95215cdf930b64abbe21764e8e113a5440eb5d0b8c828dcc2e8c377a729d2034',
//         pcryptopunks__setNFTXVaultId: '0x9e027d5930f61e8f0c9ced719db1629ea219916160cf9afcf60e6f0f6d4a205f',
//         perc721__setNFTXVaultId: '0x297a8cf26115a522596e62322c89137058513040ab191971515d7f75729ef837',
//         pbx_mint_unitroller_: '0x1bd259432c5ef2e91a58314bfa118c82959a4d479141a36c4f02c87089a3908b',
//         cryptopunks_allInitialOwnersAssigned: '0x23d34ec052287feb998ed14268b56fb9dbf55b7ce48fb7dfc03b55f10e1b174e',
//         oracle_setUnderlyingNFTPrice_perc721_5_: '0x07a9fc70c18daff6fc10ca369f42153f90ce8f959522abe07ac0f5550df6286b',
//         oracle_setUnderlyingNFTPrice_perc721_6_: '0x428b059a9094256336a01280a471c4a044bba6b60c4698fa1981357a40d4db48',
//         oracle_setUnderlyingNFTPrice_perc721_7_: '0xcb19628ec9bed8611facd3209c7f711d08153dcf12c8ea23780aefb5f25ea75d',
//         oracle_setUnderlyingNFTPrice_perc721_8_: '0x27c163ddae7bf183e6bb343f66d613588fe1f01011dd8e40d877804cffd9d2c9',
//         oracle_setUnderlyingNFTPrice_perc721_9_: '0x364e7eea98776c95bcbd02839e05c8e42dba74dbed8bd2a080a7404359bb23fe',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_5_: '0x4c10a38fa8d6f94b60dbdfb285a1230286cd76bf9660aa8e60b2054a77be2564',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_6_: '0x6c8b486b7a6d043372150aa60f5704e4938884c64e313b682e9c80ebe900ed38',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_7_: '0x67465c627c51db5e21e00c6287c2f1ba68d5565ec1e519084f2ef83c76c20343',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_8_: '0xfed93a548b852e68d2174f4f3aff01de99b66fa206ada6d558fea2ed796a939a',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_9_: '0x63629d55760ac7139abe9551c45da8dddbe8e2766b2a62754cd76f8e95cd9054',
//         usdc_mint_owner_: '0xa9a7a07c9728668347b4f37ad6e496df55f9fc24c58f3cce2d7f71f47fed1ce9',
//         usdc_mint_maciej_: '0x087c9f7b87d60679018b3553fb1175e0c5013b188fe1aac4c430a52f7403637c',
//         erc721_claim_0_: '0x74d7f90b00937d67c5de6666e45613fe218c65372d9f48d7a478de740aa9f230',
//         erc721_claim_1_: '0xb062002380cb84fb1de5e9b65544da06aeb2a6ce93d4de3330e1d9f79e6fca50',
//         erc721_claim_2_: '0xf332ab2563bc9ec2e394eb29231631b279ee315128b8d7dabf9eb4b5ffb2a639',
//         erc721_claim_3_: '0xd8cad625b427db3f222097d142d427eeee495b67977d8f973cc0cf2234f6fc80',
//         erc721_claim_4_: '0x3b5ffa64a8035b0db6b650db627724901b0cfa35bbac7d86bea32a4076d964fb',
//         cryptopunks_getPunk_0_: '0xbf0a61c81814ab3fea83de3af6a934030fe7e7055a25cd0f0ccf1ef45713c6e7',
//         cryptopunks_getPunk_1_: '0x0d358e6a30eda89df08e6056c8df4268e608a0570d3361ed5a5472f1df5f109c',
//         cryptopunks_getPunk_2_: '0x7cb5359df830e5a4c097ff2c6925587cf09775aa4321b22957f790585a0cdb28',
//         cryptopunks_getPunk_3_: '0xf65dde02b3e87d6893f48164f55fc27ea2843e03a3fbf530ecd775e47bcd4449',
//         cryptopunks_getPunk_4_: '0xc27c5da5c20107c29eee88a10a8321f411b5f48d47c5bf3d0f7895392fce614b',
//         cryptopunks_transferPunk_0_: '0xf60433bcdd46f0c265045d61fc37a800aa613a1991e3072fd98a4cbd1af23e33',
//         cryptopunks_transferPunk_1_: '0xe56cf60cbf534d648172c28eec2f31c57a7047e19c27ac8947fcd7c13d4e4b82',
//         cryptopunks_transferPunk_2_: '0x0fae2df58c43e979830306f413b683a44a9b6863263a64eafe6b0ae955236569',
//         cryptopunks_transferPunk_3_: '0x6b4c2691ba2eb044b1e85c7130cb2c5f700371661b5955e927467b013fa31564',
//         cryptopunks_transferPunk_4_: '0x4da916b86676c891dff15290ce5cb7b7e838b71d9aaf4c5699495ef4d0a41f94',
//         cryptopunks_getPunk_5_: '0xf93d3b89ca4987796f1a5a9e3603737f9a5391d9a55c11848c37651b43dc23ae',
//         cryptopunks_getPunk_6_: '0x6896610430f8b0eb19282e423f8d6e7040f7da1168abe7b12760d2bd94e51551',
//         dai_mint_owner_: '0xc04bec0c48033834fc70c7a6c71a3ee7aea5cb60ed1fdee73591ee399f3ecc0f',
//         dai_mint_maciej_: '0x2100a3eb91efae808bf29f6901b29f79d8acc29bda78d22f786eeebdf4125ce8',
//         wbtc_mint_owner_: '0xed8d0664cbcc63068712987a9575d9ebcc2ed4b57e118d96b07e803ddae33d46',
//         wbtc_mint_maciej_: '0x0161421196adc838bf53f426b41ae496226eb50b8b67aed9ce3b537efc6ad116',
//         unitroller_enterMarkets: '0xa78956e38cb94c1637fdba91b1027e98d12998f2cc74f390acdffa8d97b35503',
//         usdc_approve_pusdc_: '0x6a99b8e1bd9a4a50429cd23ffa4e636706f466270523e6313659551d12ef1505',
//         pusdc_mint: '0x2ab18df657cdbde35790d71b1da4a90d4282131c1f041a611503fc3d3eb0168f',
//         dai_approve_pdai_: '0x9629b5493c0d203eae5f4561d93f2c62ec3ceaa251e1a52cb59bd349e54e5a0e',
//         pdai_mint: '0x03d390852b9cd65faeaa68cecbb07c4131a92865ac22f7f430e6e0947ebe27e9',
//         wbtc_approve_pwbtc_: '0x01604431f22dddacca30813213443267386a70c4fcc81ab2b57923866b880773',
//         pwbtc_mint: '0x6b4f6fc6cdcf26ac3d3164f1108e21ff219422503ca9ac6adc466674f50fe5ec',
//         unitroller_connect_user1__enterNFTMarkets: '0xa403b808dbe90f2c53caec3bca31c67a80b6eb71440715c442a4e25e48cc492b',
//         cryptopunks_transferPunk_5_: '0xb56dc49d7a7a4a8c048bc2018ed39ceba4efb22ce04141d8adf4f46a235afba5',
//         cryptopunks_transferPunk_6_: '0x26300c10202a547bd906cbe0fe213e646d5238a7934fdebcfb5d5811c994e119',
//         cryptopunks_connect_user1__offerPunkForSaleToAddress_5_: '0x85e6e86e4509a41633662cc73dcbb8af0150ce23042554ce5b844308390a3de0',
//         pcryptopunks_connect_user1__mint_5_: '0x3002f81ad51e6b61ba49ab673d4d1e2676a4985e38e049213900a1b45928280d',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_5__2: '0x30e1393d2e4b8cf7beafe8e17e609998ff6ae9085578bd9eefa1fd153254b14e',
//         pcryptopunks_liquidateCollateral_5_: '0xdc9df25c7f98632491d54c94bc3c9fe430caffb06d808b8681c846406f489e05',
//         dai_mint_user1_: '0xe068f8dbda663cec61ae819fe3e72d08e2b22b5b6b0e158a6919a93054b09b67',
//         cryptopunks_connect_user1__offerPunkForSaleToAddress_6_: '0x50e7cfd33eaf7d7d9c8f0a4941df9e96d35efaf18b9559b065589044097491d2',
//         pcryptopunks_connect_user1__mint_6_: '0x921b3c67f6ec4bfb116f13c90feb48917a9301ed7120a27560d334b103fc60c7',
//         cryptopunks_connect_user1__getPunk_7_: '0x0b029afa8aecd2aa6c8a67cfb8b011520629782c3b5b208722d8f2e95908d2b4',
//         cryptopunks_connect_user1__offerPunkForSaleToAddress_7_: '0x115be44fa476efec870fe4f090dc8f36d95d2e47c230e66afc18094c0f8193c1',
//         pcryptopunks_connect_user1__mint_7_: '0x41b421cbf68a6121d5952369ecceb229b26785e7eafd9f15d3c84ff399306d69',
//         cryptopunks_connect_user1__getPunk_8_: '0x9dcfa93c3e37a4f1c2febe0fbd68adcbc6fa0d780bff480043ada385f0746c2a',
//         cryptopunks_connect_user1__offerPunkForSaleToAddress_8_: '0xe3a02a3843bb96e374de3a672a6aeaf50db813cd6f01da9009c539da3776f55b',
//         pcryptopunks_connect_user1__mint_8_: '0x8814294a1ccf93ab1e889a497cd580d4b4e30908386dbe3e61ffbe92fa63bb5d',
//         erc721_claim_10_: '0x0376cc36672404139a5a42da40f814c43544debd5dac2d33b6c268141f43f2b6',
//         erc721_connect_user1__approve_10_: '0xf825fbca461ac7d01831d86fbbc7477ce174cf75a835248bad22f557a423ced7',
//         erc721_claim_11_: '0x9affc53128730d13c08ddde64c7bf085ac0f9c3647bd88262f680c250e353ed2',
//         oracle_setUnderlyingNFTPrice_perc721_10_: '0xc57c66a724228b9bd4bb63fd310ba1c12ae816bb48a7f14868e00b53225b2e6c',
//         oracle_setUnderlyingNFTPrice_perc721_11_: '0xdae20c37c57b5e6d2d5cc997435353f0e2a8c969435a5761b4d912f2c049ce9f',
//         oracle_setUnderlyingNFTPrice_perc721_12_: '0xed7dc89b708e3ebd191199f0c79f81951f6aec544f8cf3ed6ff8f6fb2d85677d',
//         perc721_connect_user1__mint_10_: '0xbb394329cd18f8989a8590172623769f4fe5d76780c056eb7fc905332ecc1d89',
//         erc721_connect_user1__approve_11_: '0x7891b9fb9441b52a3c498bff1d5c36cb4a5c55a5c6db7f0c8dcc8985112bbb3a',
//         perc721_connect_user1__mint_11_: '0x14b2a96ee5b5d9d426516e978c4bcedf1b2721814fb1f98509f69e1c370ee5b8',
//         erc721_claim_12_: '0x0b79f48f969364857f8454b68469a9e16a8b4e66e3adf4541a7ffa3d2ce4b827',
//         erc721_connect_user1__approve_12_: '0x887a4ff2d4994d8b602f5d20da13c877497207dc0982dbedb91ee247a3f135dc',
//         perc721_connect_user1__mint_12_: '0xa7cd7f3ff462672c641f4ca85b2c7627a8ba9a1762dc73b0feb5f1f891b644ef',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_6__2: '0x9aba3637bd6e344b30692bf0e6d46e55069880e1b0281b5d130468dd33cd43d9',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_7__2: '0xcc69264ac07476644b7754e3a920b9a1faaf7df15aced4d07877ca9ffd310387',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_8__2: '0xd35bc00fcd9c1b1978529b353dd73af4858453358b86ce6c81d9d75e152a44bf',
//         oracle_setUnderlyingNFTPrice_perc721_10__2: '0xd524cd27277d280712c0d548e20f25842a9a5f32a0e5ce9c803a31132bd28c93',
//         oracle_setUnderlyingNFTPrice_perc721_11__2: '0xa84946e8cb3b8c7b70cda01bbaa85b3ac3c64a8de7d4e11894c4efdf1f99a83f',
//         oracle_setUnderlyingNFTPrice_perc721_12__2: '0xca392039a4bd012c92755833cb20c46080cf6d360c4c2d233aa5e05f1f1e122d',
//         oracle_setUnderlyingNFTPrice_perc721_100_: '0xc6c820a7257f71293887e1bd49fc5a4552a8aba1638059697860e94ce91d9c20',
//         oracle_setUnderlyingNFTPrice_perc721_101_: '0xbd3470006ae43dc109b9df42f4ae5400884b9f6da920f95b446d078062f73d50',
//         oracle_setUnderlyingNFTPrice_perc721_102_: '0xd179d8d7dbfe278a9ae6c7fd50d2897dcb1d8935d3866589cbe4810792c397c0',
//         oracle_setUnderlyingNFTPrice_perc721_103_: '0x15a553456da0a4fa50f0d5dc9a2d32280752866818131a4ab227ebb9bb7413fa',
//         oracle_setUnderlyingNFTPrice_perc721_104_: '0xcf22c97e9db2171dac8cb566adae07fe7fe7d28bc8273efcbb5ffcab6650279b',
//         usdc_mint_michal_: '0x93d1950793929f75ac13feb6b656c5b7b0f8f3eb6f246e633aea39582b40eac3',
//         dai_mint_michal_: '0x5b7db6eae8c6db4f9358b23c2737667a5c7b10971418fa1eb59898a38cb4494c',
//         wbtc_mint_michal_: '0xbfbf0e2b03cb168f5a0ec5b09779158f11eadfe2565cb6916f635fdfca2e4108',
//         erc721_claim_100_: '0x2a996a0674b4317ec3da3f39c4f9b915c67de4184ecaba3a5891dd7ed05ba38c',
//         erc721_claim_101_: '0xf43454d44e8ff0c4c53c637c141a556c9e4565e4231f8e2e55b73713fbc6582a',
//         erc721_claim_102_: '0x424cfc35fd5c4d6724541dc61ff5788f11d86644a927f0c3a14c5a7b3619810e',
//         erc721_claim_103_: '0x312be4b64f96e99c2eeb315ab7a07f1e8e29fdd7caf756aecea531b860139553',
//         erc721_claim_104_: '0x463238085d2359490c6580d19b25800b9cd1dede88331e7ab4d3304a00c8acdc',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_100_: '0xc41e7b6d7515b77c362110b1b03d433ed4724ed00df430ce324507db82e98c66',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_101_: '0x6779ffa414c11c1faeabc4f62a79c3a1dc7e52d386e415e21891baa7dc3b8e10',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_102_: '0x75a5a255612b452fbcd9893f8af1b610920a2d538f315489b25e7465c8ea54fe',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_103_: '0x4dc3c919f8f9f3244c9dbf5666649d379bcfd1b1b21fb0ef78e09317a0c596c8',
//         oracle_setUnderlyingNFTPrice_pcryptopunks_104_: '0x53c79e510de43f403ce409141777f76d87e3b440709d79d81d6a59da129ed9ad',
//         cryptopunks_getPunk_100_: '0xa1a3e0f1206cf11ce491d539fd447b03ce0f7690d3cbfc82f68f459ccc363c7f',
//         cryptopunks_getPunk_101_: '0x72ba71f2ea20ebb7ad0a37d2d86a9221dfd4a602290e1f90939ed09c52abb759',
//         cryptopunks_getPunk_102_: 'done',
//         cryptopunks_getPunk_103_: '0x274822f1b38fe6d4658fd47eadf8d5e26716c7785b612d6742d1baffa319b42d',
//         cryptopunks_getPunk_104_: '0x936a101110b448a1fa21b714cf13da5613c5bf91316c4ba78adb08f3a1080271',
//         cryptopunks_transferPunk_100_: '0xfe2fd535c8a17b44808bae6754cd001f5eda9ad74c4af0dba2f81b3968d4dab2',
//         cryptopunks_transferPunk_101_: '0x924adeda3c93915de6d4a068b4e6fff04f64a960e98b7a19dc87bc9f3bb79638',
//         cryptopunks_transferPunk_102_: '0xad00d62c70480d83e83cc5bcf492b9325bbde3b2ee03f666d5cbc4d838e8f0c1',
//         cryptopunks_transferPunk_103_: '0xfa13a2919c289994f3b588b1945f80630222564c210dec1d6d546cea61038d40',
//         cryptopunks_transferPunk_104_: '0xe9a01f1646814bc0ae550f2b0d13412a7199a0ade1c605b6d7dae3f496ed65b1',
//
//
//     }
//
//     let deployer = new DeployerNFT(addresses)
//     await deployer.deploy()
// }

module.exports = {
}

// sudoswap ERC721Mock_NEW <-> ETH pair: 0xcCCE21A9ac5ce7fF585bb3C04EA7D0dDd6a088A8

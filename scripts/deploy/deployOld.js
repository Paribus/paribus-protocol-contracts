const {ethers} = require("hardhat")
const {DeployerRegtest, DeployerRinkeby, DeployerRinkarby, DeployerNFT} = require("./deployer")
const {tokens} = require("../../test/utils/testHelpers")
const assert = require("assert")

// NFT TODO move old addresses

async function deploy1() {
    const TestEnvAddresses = {
        dai: '0x2Ec4c6fCdBF5F9beECeB1b51848fc2DB1f3a26af', // uniswap + aave
        wbtc: '0x37022F97333df61A61595B7cf43b63205290f8Ee', // uniswap + aave
        weth: '0x98a5F1520f7F7fb1e83Fe3398f9aBd151f8C65ed',
        usdc: '0x5B8B635c2665791cf62fe429cB149EaB42A3cEd8', // uniswap + aave
        pbx: '0x04A382E64E36D63Dc2bAA837aB5217620732c60A',

        unitroller: '0x486e16c2C3E023Fc5faCb810637A58BC4169929b',
        comptroller: '0xdFA75ABe5afDe9a483260b22987c349128E55E08',
        unitroller__setPendingImplementation: '0x09001b65960f96aa8e7ffed9a7fc906f89db0bfcdbd0c16be21618cbba851d30',
        comptroller__become: '0x0eaf78f86244de46d61b02a7a00cfb453d2be27103ee09e81d9e608e83a3d129',

        jrmStableCoin: '0x5Ad5Ca57270a551eF6d93DA4b51D5b6e94ec84fB', // JumpRateModelV2
        jrmEth: '0xE015070880A3B6C10E56372F880fa3948788f313', // JumpRateModelV2
        jrmWbtc: '0xE52D7f65b0B35983ce0f582eB5b70F0909D20aA0', // JumpRateModelV2
        jrmPbx: '0xB25B87b0652BC3A7e6597487c38E0F2Fc09FA6C5', // JumpRateModelV2

        pdai_delegate: '0x4aa3aFd8858ee4D429e3bA040655438B8eA20c11', // PErc20Delegate
        pdai: '0x5226f4d742e87Da8446a020314172f5C6b520008', // PErc20Delegator upgradeable
        pwbtc_delegate: '0xC8f9e63626b9D11e412d4FD6447cCc6E0F0B1670', // PErc20Delegate
        pwbtc: '0xCdDb32690d479bAce939eD8319D94abB190dC5e2', // PErc20Delegator upgradeable
        ppbx_delegate: '0x309a6021ab0ED3605BeA5f84A30d4537924be976', // PErc20Delegate
        ppbx: '0x0e22Bc9d3dbA30E67DC279F1201bE6540C85bB87', // PErc20Delegator upgradeable
        pweth_delegate: '0x80AD8C3245964d15950e4c2136Cf433AfBA78929', // PErc20Delegate
        pweth: '0x000Ab22510d15400852b6548B122b62BD65A362B', // PErc20Delegator upgradeable
        pusdc_delegate: '0x494ad85C0841Fa2E5305d892C226A6633E460fa2', // PErc20Delegate
        pusdc: '0x63cC5a066508b396ddDC5592e301F46d279DB25C', // PErc20Delegator upgradeable

        peth: '0x2a97aDE05f844802a6DB2a40f547096b464CcF18',
        maximillion: '0xF1f22B379d726402f71AeB26f28Daa233F541579',

        oracle: '0x5C3936866d1F01850489a255c1e1FCf7C0040c9d', // RinkebyPriceOracle

        pdai__setReserveFactor: '0xe0ed5e9bc18396e7049f02fe76a29b6e76d8a1ab44a36513ba41561c99575103',
        pwbtc__setReserveFactor: '0x728d2abedf158c00382e0b58c327096368165f99dd56574cc6ce8f74ac3f150a',
        ppbx__setReserveFactor: '0x7aa28f610e88d85568d67a1c9f9d9a69e45e3a15ee69df7c5cdc207f8f57f020',
        pusdc__setReserveFactor: '0xd09c4561b52e3e3d48c777eac8fe39d2091136dcb49ca3d27331e21df9ea05c6',
        pweth__setReserveFactor: '0xbcb028c849b2494fc41d0e3b965f421010d796820f9c1123905dcd924a0eac8d',
        unitroller__setPBXToken: '0x9e404fc599c43b3fdcf7f7996ec8c2b4783e7e42765868c7c1089946aa545960',
        unitroller__setPriceOracle: '0xa0183a5dfba789c342ff25141cb70f4bcc2c32943a7f74f839e96f0097d3833e',
        unitroller__setLiquidationIncentive: '0xc9b3efcfc169bec0c44c165131a0f9a5263cfba4e54170210e73e8ac28557a90',
        unitroller__setCloseFactor: '0xe19a878d9edf669aa749629e12078d87617e33ecd2d0920c8b63099ef27cc114',
        unitroller__supportMarket_pdai_: '0xc33966c04c187f5d2c2b8da8e714eee20397250f75759add4122dbe4a003abae',
        unitroller__supportMarket_pwbtc_: '0x8b4ad27b03049af45be7b0c292f441af60ee3232348acbe6afae396b90fe0347',
        unitroller__supportMarket_ppbx_: '0x3074d3b953d80e4be5e0d5413221e99d98999e5f43ffaaff290c761c4f4880f2',
        unitroller__supportMarket_pusdc_: '0x0f69c054f426a7572d148d093bdfab52916d40c149cee6b22702f606d5c5664e',
        unitroller__supportMarket_pweth_: '0xcb35ab86aeecc9c2c363fe8fa9bffe762f8211ccdbb84d7788c7659274c9abaf',
        unitroller__setCollateralFactor_pdai_: '0x9ac826952e1c9dbabc3212dcaa78e58d10586eb66c8dd288969a617c72fd00ef',
        unitroller__setCollateralFactor_pwbtc_: '0xa6eb424d2d70d1575fff04ef05608bc9d167d7faab47c03bf59b6e5e56124f4f',
        unitroller__setCollateralFactor_ppbx_: '0xe12738916783bd19fbd0d879b1bf317d5f40c02a33b42746c913bce96cd300e9',
        unitroller__setCollateralFactor_pusdc_: '0xe886920dc5d12ef5eb88bf2ed7326c706edd36a92ab71315d1dea4426e686188',
        unitroller__setCollateralFactor_pweth_: '0x1dd0a1a31e81142cd6159ce9bf54f9f96dd3ee05f315adace247fca47e901ca5',
        peth__setReserveFactor: '0x4a11e6c0465858bb04b589b3c2cb4a3c1b9f64260e70b62ccc8726f70f04bec7',
        unitroller__supportMarket_peth_: '0x3e12e1f73030359814bf05d659fcb177da974303a2a8e4a4ea45a17afc3a5975',
        unitroller__setCollateralFactor_peth_: '0x4d2e062e65f2fad70cb9cde67208e3ad1aa0b1ae924350e6be126b3641b795da',
    }

    let deployer = new DeployerRinkeby(addresses)
    await deployer.deploy()
}

async function deployRinkarby() {
    const addresses = {
        wbtc: '0x8909023C6323b61C9Ce6eB11049044e07E5b7F03',
        weth: '0xc25784BEcEceb73109d7e822e857C1cF86df9160', // Erc20TokenMock
        usdc: '0x8950258664ccDA7293521D1c95497657Fd4C483A',
        usdc_initialize: '0xf2d15fcc97d08df4f06b19bce59f37569f646b7dfdf6fff5430f0a7ddc3116ed',
        usdc_configureMinter: '0x2f577c2ebe5b2dc5ef647347d0f52709dc39e0845eb2c40f167d333e05ac1f10',
        usdt: '0x233C58828A9433d76C5b221a99a936a3a45781B7',
        pbx: '0x504A7c8a7d3bda9356654E00502cfaDE2A7eb386', // PBXTestTokenMintable

        unitroller: '0x457759a605A2a0d3fb0BCf12805D2b332561C0B8',
        comptroller: '0xBDA5C79f27C4B1Cf4A39635fD15A8c7aF09019B4',
        unitroller__setPendingImplementation: '0x10f5248ec414b4f8c7154bafa94fb808f137fcb093fb0779293da2ce8fce5753',
        comptroller__become: '0x8040e3743bc0f5d61f22330e3299e355a0db9260dfcdb18e9f70474aef683914',

        jrmStableCoin: '0x66d67FA9a360a4e4962AFDB3C01BA6bb79a321F2', // JumpRateModelV2
        jrmEth: '0x9fF57C3453F3ee81C0800bb9Fb37d981425C77Fd', // JumpRateModelV2
        jrmWbtc: '0xCA378C7a339aab99e3fAcd94FfBFa168cAAC1B92', // JumpRateModelV2

        pwbtc_delegate: '0x7651eB72cF08d52Cb109fF130e3C3E73B2Bd6Ef3', // PErc20Delegate
        pwbtc: '0xE71AAE27D17938b689e57C032002C4e430840918', // PErc20Delegator upgradeable
        pweth_delegate: '0x7c8D6b3C4f68A8361f88339ac6Bf0e1c116B5b6D', // PErc20Delegate
        pweth: '0xd2C2dc7406E2Ac46F397FE77712B16Cd35475d16', // PErc20Delegator upgradeable
        pusdc_delegate: '0x1C543E8821F18DD7ae783C8D91805B79aBE6D379', // PErc20Delegate
        pusdc: '0xc97590451B6A77cf27c0C45B8A49864e0bEA5d4b', // PErc20Delegator upgradeable
        pusdt_delegate: '0x3B7CdF22d95E4661D9e67934e562ecc69317d831', // PErc20Delegate
        pusdt: '0xE497EE784de4d5D96f69A56905Dce44F84FD6512', // PErc20Delegator upgradeable

        oracle: '0xaF99E97ffd37F2Cb953f99d58ad5D5Ce4Cfd48fc', // RinkarbyPriceOracle

        pwbtc__setReserveFactor: '0x47a9335bfc377e6163ea70c3f65f554b72c917cdfd5ec605edd7966aa626692d',
        pusdc__setReserveFactor: '0xcfaba8825d494ef6bdd48d0f8e33832f5fc87af12af789001a3f70baa4163eb2',
        pweth__setReserveFactor: '0x5591dfc6521a821923c99224604ecffa1c479b77e6c56b92c8244ebcf887a8d1',
        pusdt__setReserveFactor: '0x11fec887b1b3205b8ffbe70174f2c7448c2533576868d408aa189e2f9ad4b92d',

        unitroller__setPBXToken: '0x62816a8cc5af3ab10b1b8c960119221d5a3b987dd0adb2982cb1e3eaa1d91f58',
        unitroller__setPriceOracle: '0xbfb95bbd0f8543aad131592a022873d59b6e7a338a89fbe10ec9b2340c87c007',
        unitroller__setLiquidationIncentive: '0x6b6ea0d9c144a387bef6ec2cd4b446e11aefd31248b251907efac9a9a8f9de48',
        unitroller__setCloseFactor: '0x428244167e18f7fbe4426566024ca330f15c78f4cc1d8f70949de40e89b75065',

        unitroller__supportMarket_pwbtc_: '0xa684dde3ad932f932f21203e5fdf750a39535f008f5c31bc865ab1b413fecbbf',
        unitroller__supportMarket_pusdc_: '0x588ad2e2021b1297b5af6929613246d3fb0f81c748ee4b48fa801c592575bd83',
        unitroller__supportMarket_pweth_: '0x63876ef6eaff0c40b31382ef66db3fb2ac0f4b8f177ab534c0fbf812a5fa44df',
        unitroller__supportMarket_pusdt_: '0xeb0838e7444dd9dee4227f1c7524bc552c30e653b0ce117c38d15b5520539f2e',

        unitroller__setCollateralFactor_pwbtc_: '0x7b832e51d64f76c47f29d5982e5adb00f784b9fae2b627e4ebd3b2a310f07a87',
        unitroller__setCollateralFactor_pusdc_: '0x88169241a551b464d586160e25b5a021fe48c0e1527d8e74e783387994b35762',
        unitroller__setCollateralFactor_pweth_: '0xec325da92b8d213ca629e64e7d4abf3217766634e4bb86845ff547e650cf182b',
        unitroller__setCollateralFactor_pusdt_: '0xdbac53a70efdb096857abdd0782239ca18e8eb1d7377bfd217064ed689efb089',
    }

    let deployer = new DeployerRinkarby(addresses)
    await deployer.deploy()
}

async function deployNFTEnv() {
    let addresses1 = {
        dai: '0xE34ceCa34FDfC2bBd7eEC3E5302D62e29494C9c5',
        wbtc: '0xF31D9581aE5995D8BaC8905Add9EEe3945adDFa0',
        pbx: '0xE333dA984A0999b4aC221147372b7C8857daF9D3', // PBXTokenMock
        weth: '0x838a852003dBE05a5a6148a31443E458b2861de4',
        usdc: '0x3F6F84Fa391841404c43779Ed0928158Bf805142',
        usdc_initialize: '0xfc510975d13ae123008794481a792d4be810aa01300f3591e7c0d1c168bb9c1e',
        usdc_configureMinter: '0x35a3897834122b35cfc4c9d8f3b5c9fe3f0a8dfd22b8c232d3fec3a46581c371',
        erc721: '0x61183ACaaDcccbE55d2A5363F75D3648Fc24baf4', // ERC721ClaimableMock

        unitroller: '0x528FF3DafDedCACB5CF3dB1DF27D0854314a7aE2',
        comptroller_part1: '0x5B2dEfFf62dF8398Cf711A65bE8E4b6dB6725f0e',
        comptroller_part2: '0x2ee9c791419Fb028746a66c33f191211e2C49E75',
        unitroller__setPendingImplementations: '0x3be67ab7f0235c6fe3dbc799eedf2e4338f497ae6ae48d3d03e1b856c957a351',
        comptroller_part1__become: '0x76dfca1c40ba8d58ecd1c7d7bfad9be4baf3399935ba17b05064d79461f2d2eb',
        comptroller_part2__become: '0xf6b1b214b83bc1fd13c1e191e1d01fb5c911158f966c0f2476bb74c123640e93',

        jrmStableCoin: '0x8b102ce73EE1746E8BbeFAF8c13C21669b6A6Ed5', // JumpRateModelV2
        jrmEth: '0x172b8A7F552f4268Bf1bC1b2FA8333a8dbd113EA', // JumpRateModelV2
        jrmWbtc: '0xBD9113D731425225508a7aBe5387bee84af3258c', // JumpRateModelV2
        jrmPbx: '0x86768e56f4a29A127e53E210efA457C291798678', // JumpRateModelV2

        pdai_delegate: '0x018adc09eD489E05605780ec66bbDe33372Cf87D', // PErc20Delegate
        pdai: '0x3c8b2A856bb2e7014905D3D8240B4a0854996472', // PErc20Delegator upgradeable
        pwbtc_delegate: '0x1531e58a5219c8BBB8cd32433b5CA980899539d5', // PErc20Delegate
        pwbtc: '0x6d0e8741beC4BfA9a9B6D1467ebbF91F4AA593e5', // PErc20Delegator upgradeable
        ppbx_delegate: '0x208e9e01c6Efd639857118f102A82d1eC3e00076', // PErc20Delegate
        ppbx: '0x84b6Bc6bC40D550fd9eE3f21184F44393380D205', // PErc20Delegator upgradeable
        pweth_delegate: '0xD1815294d79e0ae9bfd047f8bC9Ca832b40Eef9e', // PErc20Delegate
        pweth: '0x094136e3084a814e160b5DB32fd86B6aa1B7A2A1', // PErc20Delegator upgradeable
        pusdc_delegate: '0x11c7e438d269eb5CAa3137Bc4d725194621C6E67', // PErc20Delegate
        pusdc: '0x1e5Eb4123B7ad5B65fD161161887Cba344dA4ce4', // PErc20Delegator upgradeable
        perc721: '0xC1819de60316fa58DE9d8BFFB624a0221A231a8c', // PErc721Immutable

        oracle: '0x96FF218ed47A9711aA8d2B319686693559EC90D0', // SimplePriceOracle
        oracle_setUnderlyingPrice_pwbtc_: '0x80fb1d7f446c5c487e55eb2fe3423918d09e4c36910db192f9680a7c47c78bb6',
        oracle_setUnderlyingPrice_ppbx_: '0xc9b999fc7267034668d6a2dc3eb0ae54c53dc86452b8612e8e8cf621a901ae09',
        oracle_setUnderlyingPrice_pdai_: '0x0695b1f6b59e6c3d7afd10ef73574443634d28555ed5cab14d7d68259023dd7b',
        oracle_setUnderlyingPrice_pusdc_: '0x7fa7ebb12c365f8fba84c9558177e2e61c951cceac82827a8a263bcd86bc100c',
        oracle_setUnderlyingPrice_pweth_: '0x6829449dd433800aefd97fb39eaad64550de19dfce1c5217f2dc288d938d136a',

        pdai__setReserveFactor: '0x06343e8cbe9c1a580beca5de11b4593ccce124123cfa864227b1814be45997a7',
        pwbtc__setReserveFactor: '0xc060f777231684763693b4a44309471f72f135636aa009563c770a1a9290c1be',
        ppbx__setReserveFactor: '0xae95dcd4af7877313ac1252e1fe188a4217111c7c4ad6d93fc563c9ba447954e',
        pusdc__setReserveFactor: '0xe847376c503afd1b7c0a5a8b682700e10af3ff9a726b4314ecd579199aee12ba',
        pweth__setReserveFactor: '0xeb214d99e2462209823cf40e58a9909b5c0c9d5732dd582bcce032cb502e85c0',

        unitroller__setPBXToken: '0xdc6a4d303d29375f930965e3277ecdc528b1792ef3a19e168d79077b78355846',
        unitroller__setPriceOracle: '0x61310ab2e631b9285a23111293138f3466e4e1650e5f7277fd672263863298fc',
        unitroller__setLiquidationIncentive: '0x8c524d46a2b028e7f3daa3c274fa0e21459f0f6f11515940556781dbaef8bcf2',
        unitroller__setCloseFactor: '0x77bab0752c063311a080836eb1b3c4c27499344e035d5549b44ed4803c12d93e',

        unitroller__supportMarket_pdai_: '0xb784c6133f777e80785e8c99d983f6cb7c1160da6be9c8f460c9b614ec7a4a62',
        unitroller__supportMarket_pwbtc_: '0x05e4006a99a6720f74aeeb0f41376e968d26a698e9faa55df27e806b495eaa3f',
        unitroller__supportMarket_ppbx_: '0x0a223797d09446d94d230532a376dbc96729c01d5626aacb1c79c548fc728a8e',
        unitroller__supportMarket_pusdc_: '0xaff8bc85adb587f1a4e713d22c4e942fabf77830ef3ad38e65b1ebf99df51dc6',
        unitroller__supportMarket_pweth_: '0xf405f2216311c48220f089ff5fbfa6a50e9f142b67f717426424ee92d253f995',

        unitroller__setCollateralFactor_pdai_: '0xb9637ad25ab67c747d9d238345ba096a8e5427ac5ab19be12da4f3c63f2b3a79',
        unitroller__setCollateralFactor_pwbtc_: '0xc64f5d3ef1429ee0de8f57728506ad8c7c9e39b73180f07aa41b00acfd62e198',
        unitroller__setCollateralFactor_ppbx_: '0x62ae4c7de80e8ae157550cbb8e47b1bcecbab5705914452e7361cdeabe86ba50',
        unitroller__setCollateralFactor_pusdc_: '0x678b9f6d3f84654f0b50788c0d6afbe94913e03a75bd1c34b698d659199cd5e4',
        unitroller__setCollateralFactor_pweth_: '0x62abea8f51fae3c2471cace7fe2da924f0d20abf5e4aab99c71b8b51ff6dab62',

        oracle_setUnderlyingNFTPrice_perc721_0_: '0x0c22d139c4c50e67f17c383230b21845bbcb9f95dac532791be9545fc7da88d1',
        oracle_setUnderlyingNFTPrice_perc721_1_: '0x1cbf620f56751b01fafbd75cc5aad18aa96ac90dc20ccafe7f4902b1c13f251a',
        oracle_setUnderlyingNFTPrice_perc721_2_: '0x04a45a4deb97f0613d827acba34380ef72e0cacab2c1d215325e9524185ced4d',
        oracle_setUnderlyingNFTPrice_perc721_3_: '0xc674fbb71e2da275b1d974b38750224bb6a6506247b57b2681f9123f50014734',
        unitroller__supportNFTMarket_perc721_: '0xc4cb77e838a78748bb11263792aa22736766cbb76ccfc3c6c131af21b7384c48',
        unitroller__setNFTCollateralFactor_perc721_: '0x19274a39c43225a1f76c24cc0bd60f657acc586176f4e2b84c565f2d82156cf8',
    }

    let addresses = {
        dai: '0xd1E525a0BC5A7e14d2C78481423D0cD8ED3F50b1',
        wbtc: '0x85026e7248984fA12C4575dB3088B09494928686',
        pbx: '0x616A74014a3eF2a48963b02420bD51009c943430', // PBXTokenMock
        weth: '0xBE217F1F183fB1644b68Edd65cE0D60c36F43443',
        usdc: '0x3D365Dd481A5AD7391C7dad63f5D61B62524754B',
        usdc_initialize: '0x545ecd344ee9e81cf7b1e88d0c4cb5a73988de50e3b2e3f748f8157e67d0cd45',
        usdc_configureMinter: '0x5d1426985bf8ca78ad967a4e731b98501432d0da36fc734904f38abb98f97df5',
        erc721: '0xB2bDB097320455694837075C36F6DA9161D54e7f', // ERC721ClaimableMock
        unitroller: '0xaFC4eB756443CF2dEf5f84036F4539C534F35fB0',

        comptroller_part1: '0x9A710F7b11Da8e87aeB24347C45ff8016687784a',
        comptroller_part2: '0x691a7438bBE84c1C0b05cb8D7945bFC4eaF49e00',
        unitroller__setPendingImplementations: '0x45d4eac7b5239e9f9c16bd1ae434244c3c84db2ad8b46c60aea65ceb325b5bdd',
        comptroller_part1__become: '0x3e9d06561bd5a88c26c7ce0cc2f0c929bca3d19bab191b4aec8a68c6a82d570d',
        comptroller_part2__become: '0xbe6480050e34b8ce1b14f9bb6a568c95552aaa7648e40079530539444f0d5deb',

        jrmStableCoin: '0xf6e93F809aB5eD3724AE2F99d804Da5f15A14c6b', // JumpRateModelV2
        jrmEth: '0xdA330e83Cd40Df371169063d99b03A182b169c9b', // JumpRateModelV2
        jrmWbtc: '0xB67F3D29aE8b957f36E2a1955DF0A60c898eacD1', // JumpRateModelV2
        jrmPbx: '0x17EFfd250f59E433F596B72a31531adDB78C2778', // JumpRateModelV2
        pdai_delegate: '0x57653B55558B9389b1cc7172304FbE1feBC88a6c', // PErc20Delegate
        pdai: '0xeFa153B3Bb99b9F30C0e6594A51bc72d7343a22b', // PErc20Delegator upgradeable
        pwbtc_delegate: '0x67804679Cf7A9538F2575929452206dDC75a91cC', // PErc20Delegate
        pwbtc: '0xb66970DaBD837318ddC870a97eF0cdE1FCA42a49', // PErc20Delegator upgradeable
        ppbx_delegate: '0x5d811c3aa4D44521c13278538BaF9b7A852134A3', // PErc20Delegate
        ppbx: '0x03bC77dB09939D56A51fD2Fd8126baAdC4152C4f', // PErc20Delegator upgradeable
        pweth_delegate: '0xe7a8Df8E9169c770adc89222fC08702A222b6220', // PErc20Delegate
        pweth: '0x8E42878BEA4E408De358AE34C200b1D39039621e', // PErc20Delegator upgradeable
        pusdc_delegate: '0xf782344a031a022d886E23d4b6F18040C35c360b', // PErc20Delegate
        pusdc: '0xa764Fc061B8859E6B9dc7605debe4a6Fc147e6D9', // PErc20Delegator upgradeable
        perc721: '0x4A4471f0ed318f3bBC235a044499Cc83ce60B80f', // PErc721Immutable
        oracle: '0x3259209f5a2d8E587efA79Eb7d98f6Dcaf2B198E', // SimplePriceOracle
        oracle_setUnderlyingPrice_pwbtc_: '0xf8116e3df3f780f18822a1c131aa640dd95779544effb7efbd821781097479af',
        oracle_setUnderlyingPrice_ppbx_: '0x8fcfe844c5e34accd213fbf05b0f883341cc25a73a391ece55f48664e2c4bdf2',
        oracle_setUnderlyingPrice_pdai_: '0xf0ef81e2bde379012f4c5cea15f9c80a4046255184d039143d03da63c6c31b5c',
        oracle_setUnderlyingPrice_pusdc_: '0xed56475ccf34babc088905e844ab9aefc6aa18404b26ce5eb7a0a84bc8dac6ef',
        oracle_setUnderlyingPrice_pweth_: '0xe4fbf1b4d3e54d6c11cbcaec92b400dba5218a621c14389624488f78889c3c9a',
        pdai__setReserveFactor: '0x7c5d9c72754373826dc6ff9d1f8ec181731f62bc206822411a95850f91a168eb',
        pwbtc__setReserveFactor: '0xe634391e206dc3b6700ff6c2e88989102d2924022599353ffdbcb464a226fdf6',
        ppbx__setReserveFactor: '0x008dc9d49e1d42521c60bc68e275c5544f10cc0c1ad18a02bcb5dd148a69e269',
        pusdc__setReserveFactor: '0x602e10f4e6c492448d2a59b738e68f6cf3def5192a97b4c44a8473cb0fa80f11',
        pweth__setReserveFactor: '0x1b938da7d941e8d349ffee15bdc1a7f991e21704f2b9f613b0caefe16016b50f',
        unitroller__setPBXToken: '0xf39b721da89b3f9273a6a379b8d299f343bac7d8e038a67198fa5a57c68cc915',
        unitroller__setPriceOracle: '0xfb56bac898b695b197212ae2faf267c586e67d410b62c606349c0186db22cc71',
        unitroller__setLiquidationIncentive: '0xe94c7e1f4dde479cbbc64b99980243093f615ec688c666b66f58e7330356d423',
        unitroller__setCloseFactor: '0x6a4c3d665b142c36cee19c05cd305969708a24800c04aa9b867b3b4f20c88e4c',
        unitroller__supportMarket_pdai_: '0x687e9dd8a69fe97320b82c427ebfd9e3e67c5c915b9e2d87443e1f36ea1185b8',
        unitroller__supportMarket_pwbtc_: '0x7b328d5ae1d7f7d92e966dd9535b38a826f076cd2ac488f7f6c3aa8861f4d3f5',
        unitroller__supportMarket_ppbx_: '0xefeccfc1511e0621cf6a41e0297c28892c27a95638fa635dc228344bc18e3c2a',
        unitroller__supportMarket_pusdc_: '0xf837b84657182ca350a166bb32750609ed2956f3a4eac5aecd349f4912ec1bdd',
        unitroller__supportMarket_pweth_: '0x68469b4cca72722edbc8a7e1bd8e8690d149739bad657572137453e7a9c1c3f7',
        unitroller__setCollateralFactor_pdai_: '0x0abca2200f18dd98acd68ac286013958df81e463e6908966a5f13f14134eb305',
        unitroller__setCollateralFactor_pwbtc_: '0xcc212fbe788a4c77e3190140054e0b93f98ec47633346edc75e40eece09752f7',
        unitroller__setCollateralFactor_ppbx_: '0x41be5f22b4c1c537b2087630774dd04e692879e288778625a32b23a408b18c8a',
        unitroller__setCollateralFactor_pusdc_: '0x5b21a7f619286d2df9a4ccaf9be69dcd9d33f458ec151a30a1f34e7b3d2ca414',
        unitroller__setCollateralFactor_pweth_: '0xe9e4437ba5768e44d43a80f2fd091f860c21c103a36276c46cfd407510712ca7',
        oracle_setUnderlyingNFTPrice_perc721_0_: '0xdd56a03b6ddd1574b5ab1a6e05d1773a75677d2954bfe6fa0a85a03811b1e671',
        oracle_setUnderlyingNFTPrice_perc721_1_: '0x3fb099e4785015bb76bd9735ef1796b67243b8aac7a6d003c40cce48ee744be6',
        oracle_setUnderlyingNFTPrice_perc721_2_: '0x1fc7826293ed31a84265febe2b55e9e1bf2ff92ac10b957b0ef7e53aff1bcf1c',
        oracle_setUnderlyingNFTPrice_perc721_3_: '0x0f470a3c0fd7274a684576469a624b48f43b2db2277466d6178acaa467126faa',
        unitroller__supportNFTMarket_perc721_: '0x5a575144eca30c6a91df8142d737e581002457ecafcdfef97dbdbfad3a7ad572',
        unitroller__setNFTCollateralFactor_perc721_: '0xfee48547263439c3051fa6694f0f436ccae31d6815631745463efb1e77c5d9b6',
        pbx_mint_unitroller_: '0x84cbf75138e43b6990ce2a2b90881666e5e0ff83a7fbe05c7036806ec901ec87',
        unitroller__emitMissedEvents: '0xb59d29515d746f293528c379610aef90bdf933df2258fafb45abf7bd221bb6c6',

        cryptopunks: '0x5DE66382b1Eb3574b1e754b5c67Fd75788Eca6dE', // CryptoPunksMarketMock
        pcryptopunks: '0xB54df32d2b783Bab647Ad8177f103F4603C64Bf4', // PCryptoPunksImmutable
        oracle_setUnderlyingNFTPrice_pcryptopunks_0_: '0x1525fa52f9a3610e7d83cb80bbc08b68de1315b66ab72109b116cae145468f37',
        oracle_setUnderlyingNFTPrice_pcryptopunks_1_: '0xd8520d6422f8bbc11fcd4dc1ce0ba12eea9ba8dcf297d92b4d1ce233e14c363c',
        oracle_setUnderlyingNFTPrice_pcryptopunks_2_: '0x3bd9a4f5744f080ce759d08d9a53d842453a7c9aaa8f2a9c1c123389a08e9157',
        oracle_setUnderlyingNFTPrice_pcryptopunks_3_: '0xc3478d68c9aac38749efdefff5c4431ab881c8fb906860e119d2c12ef62571a0',
        unitroller__supportNFTMarket_pcryptopunks_: '0xa5f19274aa08fb7b1168e0a7028689dd660f5c08c6fb47be987d978b41c9cb0f',
        unitroller__setNFTCollateralFactor_pcryptopunks_: '0x05efb51b58b184b44d3958226e41d8c6d4aad99701fa2572b2663c394ebe5911',
        cryptopunks_allInitialOwnersAssigned: '0x0822960d8dd78e1eb2c37e3e1b4fe8d50b80d23efdb895103dda84400e69b9be',

        erc721_2: '0xEF3bC4B50Dee5B3b2b452fc2567dF071D841AbD4', // ERC721ClaimableMock
        perc721_2_delegate: '0xa2317DB60dFA09B19b1CfF7E50b4828b53cc4216', // PErc721Delegate
        perc721_2: '0xbB26FefcD3491c95564EA5CB61c124855B5b5843', // PNFTTokenDelegator upgradeable
        perc721_2__setImplementation: '0xa06ff77b2c2b58093253d1a20fa30e8d65901f2f9fbd1d88f7e0b5abd2ce04cd',
        oracle_setUnderlyingNFTPrice_perc721_2_0_: '0x762d2f213cf086535e99e0e583b022d197fd155bc9a3641402debfb080cf7dfa',
        oracle_setUnderlyingNFTPrice_perc721_2_1_: '0xa2ddbd67ff057e217c2a8b812fecb39d7163d09974d5a9109637af5948b83a53',
        oracle_setUnderlyingNFTPrice_perc721_2_2_: '0xe7c115b9379adc4b48962af0b5565d0ca7cc85deca4aff2c562026219888b543',
        oracle_setUnderlyingNFTPrice_perc721_2_3_: '0xd1546032e4151cb62785d924c53ebd0baf9e2704ccd6da7196ac5c433edcf6d6',
        unitroller__supportNFTMarket_perc721_2_: '0x65f69a20802ca2be55f4c2cf215fd33f9f5070c9657edd5b4f446d0f0840998d',
        unitroller__setNFTCollateralFactor_perc721_2_: '0x108d1beba74303ef9893be31fbe2cf17754db3715479c0bddedd98e798e912f4',

        erc721_3: '0x2cf836557Cfc5658d8Fe7aEBA9880f2D84C7BA5e', // ERC721ClaimableMock
        perc721_3_delegate: '0x336eA5603f36C7D1178EE1c24F9E242F96E7a6f8', // PErc721Delegate
        perc721_3: '0x558c0c293D95608c16A63EC796Caec5b92c85305', // PNFTTokenDelegator upgradeable
        oracle_setUnderlyingNFTPrice_perc721_3_0_: '0xb263caaa505b953ff6c69b5c21e6cf582dec5338e4aa523814700bbd5a05a856',
        oracle_setUnderlyingNFTPrice_perc721_3_1_: '0x3691277b94e7ada73ef7b769518193668748ce1626237855f65a0d2630d220e2',
        oracle_setUnderlyingNFTPrice_perc721_3_2_: '0x6f3f2b7e9e4f4981b8ab6e7d44da0df7808f956cc054e74183a9221b19484d68',
        oracle_setUnderlyingNFTPrice_perc721_3_3_: '0x9b8e8188f66adb6b04673df555b4fb246ff13dc78fda2a90a498d788a40e357a',
        unitroller__supportNFTMarket_perc721_3_: '0xdc77b8bef21bac6d2a9b0ca6ce31811c20a606a18daabf1ed8b9249ad9efcd55',
        unitroller__setNFTCollateralFactor_perc721_3_: '0x543e72ec8f5123ebf0fd0ae2a908b84c865bb0e24cc42ef2c019cbc682dad71d',

        oracle_setUnderlyingNFTPrice_perc721_4_: '0x224b8f168ce4983d8415bcdb0b605ab66fe773f3bd48942b342b5641df5ea871',
        oracle_setUnderlyingNFTPrice_pcryptopunks_4_: '0x5603a85b2d2c0a5032d74da38d95dd486cf4b900f02dea08b4ee0583f03166e3',
        oracle_setUnderlyingNFTPrice_perc721_2_4_: '0xe6c14ff0055fde5e2b523defd5f4f17d623e4a2d648f557fdfac36c78814ee23',
        oracle_setUnderlyingNFTPrice_perc721_3_4_: '0xed1afce86c49b12bf8b9e9241e267af8a5bfbdfe68f8b293b6a80521ed64a181',
    }

    let deployer = new DeployerNFT(addresses)
    await deployer.deploy()

    const addr = "0x085cE2bF391016c0981DB049E96D2aAF2dF26365"
    // await deployer.contracts.dai.mint(addr, '10000000000000000000')
    // await deployer.contracts.usdc.mint(addr, '10000000')
    // await deployer.contracts.erc721.claim(addr, 4)
    // await deployer.contracts.erc721_2.claim(addr, 4)
    // await deployer.contracts.cryptopunks.getPunk(4)
    await deployer.contracts.cryptopunks.transferPunk(addr, 4)
}

async function deployNEW_NFTEnv() {
    let addresses = {
        dai: '0xed2285b025Fa73dCDcAFCAbFe5C78fa3cE661938',
        wbtc: '0x6251E6F068d0def9F5EBfb2502e2D4064464b366',
        pbx: '0x161D6B2954F15B87b78274ef9a4f9E5f5D262e25',
        weth: '0x6ae41674f04e61E3987fb5a3871FC802e1e32d6b',
        usdc: '0x3fE481BEdB70E5850137CDbAE19f0708dc419A40',
        usdc_initialize: '0xb4374b1b6177a167f2426c5ed0cdb29b286a46e9f5be12abde13e412ea33664d',
        usdc_configureMinter: '0x3db06e762d5c59b3003f09f816e25d742278341713aee3ca8d157308dba779a3',
        erc721: '0xA03fd68631d8ED0396CB0eF0A1eA64b026ca9412',
        erc721_2: '0x2741dD9EebE6137C2367bEDEB0Ba271f4b1eb3FD',
        erc721_3: '0x4f4b8c53Eb107bF5B966785b02D36c45007265Fd',
        cryptopunks: '0x6c041e8ABC399fE9ceD86034C108a1230e3a7973',
        unitroller: '0x64DeB764EBd529d3F281b9435f9007fA760C504e',
        comptroller_part1: '0x0588F516AA2275156beeC67a18cFBf9f991018ca',
        comptroller_part2: '0xCaDBE6eF57b49895Ade9Aa51746F08eef7FC8023',
        unitroller__setPendingImplementations: '0x0436fa6e9730fcea0aac9e808be445b03a3fb040c129439eedcd938b63f16312',
        comptroller_part1__become: '0x5b85debbad0f281fbb2447299e0d4c88e0f198879dde1632352bdc401cf42702',
        comptroller_part2__become: '0xe46f0ba9cb4b42cc3038c07af8c452d39a1027a0d57b9662f50cea4c40ed8186',
        jrmStableCoin: '0xe4b808d97da41608150D77eeE5f7CA6dEd3f612C',
        jrmEth: '0xb3Aca515aeAE14E00915CbDd895279E171951efa',
        jrmWbtc: '0x19A0e836bE52849aFDEB010F8c427BcFF6a20521',
        jrmPbx: '0xea0C2Bfd456090a8c4dFAd71DD05F0176edaF631',
        pdai_delegate: '0xE18718244c0a5fCc35112713E28cA67F6cA3E441',
        pdai: '0x112E3342ABFd1d89c350cAcA026f6023Af7afF6E',
        pwbtc_delegate: '0xb3aee9dd4CEcd103D741c1541160632F1b5f4142',
        pwbtc: '0x2C84451aa8c0a7399b13eFBE464F19C6b9782aE3',
        ppbx_delegate: '0xA99E9dA0378a02ddC49ACFeBEd33b77D8DBf2309',
        ppbx: '0x2158eC1ff58bec31A192fb4F44B14D6269D07Ea7',
        pweth_delegate: '0x03b0965d1e5356d70F9EA660fF077Bd3B6b5E4DB',
        pweth: '0xA929003ce844167e16d03bf9d52AABE417F27df2',
        pusdc_delegate: '0x5BE6c288bF889aD8755f29D23CcDFE11595C6D3d',
        pusdc: '0xaDebd8a23D3d72Af2B3D3d82CDd04c5106e226F6',
        perc721: '0x38863819Ed7e632DdE9C5D7B20AD542859EEf9B8',
        perc721_2_delegate: '0x6e2807cc22742dd42C9bbbb290867870339e9B2c',
        perc721_2: '0xf02e2f6F041b833255296694Bc1B9e62cB7eF72A',
        perc721_3_delegate: '0x8ac52Cc270646dDF04AEaDC419A853823AD0E1d9',
        perc721_3: '0x4b44eee6202d25017F66dc1F3781532130e2b736',
        pcryptopunks: '0x58BD160bBC8DDEfAA4415D9069fCef637aAdD8a7',
        oracle: '0x1be82722b9752c7e3b806297Ff77EAE5e3849d08',
        oracle_setUnderlyingPrice_pwbtc_: '0xff90030d1311939e1e340307df4c0e0265689c9b98acf1495a9f911a5ec71563',
        oracle_setUnderlyingPrice_ppbx_: '0xfcc4761a8d98888cbe101b7754ac7fa37e5c721369f9dc928f26de7b0d98bdca',
        oracle_setUnderlyingPrice_pdai_: '0xe0fbee4e56291db9dc6cec52d8c91bb6d1c24f715e066eefe0ba15cea7dbeb67',
        oracle_setUnderlyingPrice_pusdc_: '0x2572ea880114074bbab9bb1994b9f5e7273198ec55ddfb82a5ca35c3eda5d87a',
        oracle_setUnderlyingPrice_pweth_: '0x52221c6c7f90d0a8cf873b8d33f46dd264ac1eda20f3caccb68c98ae35a9e9a1',
        pdai__setReserveFactor: '0x6c07aac881d0b19a69adbfc038c83953900821d881cc40543daa4e6143dbf364',
        pwbtc__setReserveFactor: '0x189bf5d053ee3e3ca200e18f6036bc9e46f9d9c57dbc9e205406144ae53fd599',
        ppbx__setReserveFactor: '0x0bb2daf2a259168d2f31f46eb63f141a4c8f4ee78b98deb8505365d716bc9df5',
        pusdc__setReserveFactor: '0x5fd82b261b75b158b466e7557c29df22dac9be4df683a364179bd3759be06531',
        pweth__setReserveFactor: '0x6229412062bf426dbf20d76c828aec8fc49ec77dd1825deb743312a2bb2be8c5',
        unitroller__setPBXToken: '0x65dc60cfa2567ca38e901ec493ef2475f151dadf6476bb2ef35ad6b6c1247492',
        unitroller__setPriceOracle: '0x4dc63141a5aeaf3c61b0d11d36ef489e529a0edcd3aa87464cf3f1b60a37d6f1',
        unitroller__setLiquidationIncentive: '0x522362640457358e2b6e7ca9dc64d244aabf84ae315a6b8be3794815025af465',
        unitroller__setCloseFactor: '0xb91309b88332224713feecf3bb7026079120c0d041377ee7525668511738d80d',
        unitroller__supportMarket_pdai_: '0xb70d4280ebd098298500a0341a01f4a05909abbd67dec0bcc66db0bf0b5cbc0d',
        unitroller__supportMarket_pwbtc_: '0x3dad5afa62b72f839e7a586ba2d5469567e90706d8522752d5cd1a3293d7b40c',
        unitroller__supportMarket_ppbx_: '0xb6de3f5be0a33cc523798c329cb9b51f6894e9cfde4a020a581d5efc3ecdae26',
        unitroller__supportMarket_pusdc_: '0x8c29c7012c4e26413085cc06575863e63cadcf4289c9f2f62d08e5dd7ec4797b',
        unitroller__supportMarket_pweth_: '0x8e3f1e65d1d506e0244d30a43c53e37a819e38a19c270e1300f165b50b00a8a1',
        unitroller__setCollateralFactor_pdai_: '0xbb0c30abf73e77cb6a93c7b5b7fd213a000403543627820a078af87acd271ba1',
        unitroller__setCollateralFactor_pwbtc_: '0x8ec1830984476dd040ac2bc9119b85eebf9dfb4300f441ac74feb8c5c0b747a5',
        unitroller__setCollateralFactor_ppbx_: '0x1f338abb1a9f7c62d333d54d384d40971078e932e8b355b133b866342946777e',
        unitroller__setCollateralFactor_pusdc_: '0xc07e4477a75f69f26ea12284c4c961a7462d7e720953f475020ff7fc0325185d',
        unitroller__setCollateralFactor_pweth_: '0xafc973838d7422c7d12e74417ed7f680e4491f11103ff89e295d5deb5ba016b4',
        oracle_setUnderlyingNFTPrice_perc721_0_: '0xb2b8da222ede8b7e90b667d83f581323f3c64b0059985bc3c7fa639305aa53f6',
        oracle_setUnderlyingNFTPrice_perc721_1_: '0x70d54d9895f0a6ff85ad6c3dfd4cbe5a8042e737d1fd72e1ee771ea51b0322ec',
        oracle_setUnderlyingNFTPrice_perc721_2_: '0x747dc4bf3751114b31f88c928da4814ed21af9c4f2e84a840efff70cd46394f4',
        oracle_setUnderlyingNFTPrice_perc721_3_: '0x61a7aa6f0bc26cf5d5d7eb5b8af03400ba0016e6e55176f1e909366c25f3cbdd',
        oracle_setUnderlyingNFTPrice_pcryptopunks_0_: '0x4a3ae69a6c9a01ea69b00ad9457d526fb1bf4da6241ebac4015807b9180d0999',
        oracle_setUnderlyingNFTPrice_pcryptopunks_1_: '0xf77bcd05cc0318846a12865fd11ce91156285154dd48d71642122496eda8331f',
        oracle_setUnderlyingNFTPrice_pcryptopunks_2_: '0xddb2889105412ffe01e3efc1c6a1edf95b8ca1d7ef729c96acac85961031d0fb',
        oracle_setUnderlyingNFTPrice_pcryptopunks_3_: '0x467c0946e6335563830cc98a3e046808147922297d0be5aea8b6734a215724be',
        oracle_setUnderlyingNFTPrice_perc721_2_0_: '0x9eb08b9523d0832413c7c7a7033a250a97c86653767f68901b6294ae202cfd65',
        oracle_setUnderlyingNFTPrice_perc721_2_1_: '0x1e64f8a358a7efababf993af4f7fe8088f5990c09fde5b84148b13a65ddcce4d',
        oracle_setUnderlyingNFTPrice_perc721_2_2_: '0x8b67dadc1a8f35377867bd7b7a2d342b95455a7ce92039bca5b3dc091d7a390a',
        oracle_setUnderlyingNFTPrice_perc721_2_3_: '0xa827b516194c663869b41d12482658657ceea36f82443181a5604a5b078cd7a0',
        oracle_setUnderlyingNFTPrice_perc721_3_0_: '0x68e50607d512f9a08d421ea5754cf7e14bd91bf9cc3e61c6c1bdcd532431aadb',
        oracle_setUnderlyingNFTPrice_perc721_3_1_: '0xaa9cae2c22fb60a47112d808697d80c3cd42db9a23b22ad09ff7e7514cfabb1e',
        oracle_setUnderlyingNFTPrice_perc721_3_2_: '0x5ca093c600c9419ecb4c8bd1e4e90f3eabdbd0bbcd13e059127b9bc3a8a043b3',
        oracle_setUnderlyingNFTPrice_perc721_3_3_: '0xadb3e0ecbaff0ee31c6c5c36e82e51c543ea3a3995c6810abb72a757c17534ce',
        unitroller__supportNFTMarket_perc721_: '0x7121be88018e7f7b57611d30bcb531d7618dd2f5e3fa4cf41913ff1e06ea1dce',
        unitroller__supportNFTMarket_perc721_2_: '0x17a4e10d28fdca0babe2fa5e0e30b1859d615e44633d5da4ebadebc7260e7f59',
        unitroller__supportNFTMarket_perc721_3_: '0x87ddd05bb5d1166b9427f3cfd6d88c3566bf563f67c4be1dd74382c0b8416887',
        unitroller__supportNFTMarket_pcryptopunks_: '0x6b8253c2fe5dacbb61e50bff6d05579c80d373ae25e43b50c2a0cc41cf7e0a69',
        unitroller__setNFTCollateralFactor_perc721_: '0xaa13d4ad9662e77f6acb7176572513828059e831bae2eeb8552e9dfde61c5f16',
        unitroller__setNFTCollateralFactor_perc721_2_: '0x67b4b626af8b1cd8eb0e0ae8961c5e81a7b3a89181d22d477512c6194f8a6982',
        unitroller__setNFTCollateralFactor_perc721_3_: '0x98d508520946222cf9039b7fa28233d139b3633cf0f7b1147232c37ef618da3a',
        unitroller__setNFTCollateralFactor_pcryptopunks_: '0xc24d24efe00044244e703a7f6642b8616a6cfa15a9b9fb98aa2e96a9319511a5',
        pbx_mint_unitroller_: '0x7141fb0c825c9a95cc065a4d3487eab863ead0ea33d9ec4905ea2a0103a8bc8b',
        cryptopunks_allInitialOwnersAssigned: '0xcbe6817e7abc21e2732b3a1a435715621838a5eb54b25a90ece0f8827569e697',
        nftxVaultFactoryMock: '0x35F0dc914d35d4C089F96408c2Ea8ffc26D9416d', // NFTXVaultFactoryMock
        nftxMarketplaceZap: '0xd9547caea066482D42efD63Ce9C563d24e4c68df', // NFTXMarketplaceZapMock
        nftxVaultFactoryMock_setNFTAsset_42_cryptopunks_: '0x1fe9f57e292a74b5a6ec442394db8c40bfc0e78c066abd99fe0c113dc09c242d',
        nftxVaultFactoryMock_setNFTAsset_43_erc721_: '0xf381ba27090387b1d3cdebd0dd51b8b7b943488964c038f58a375c30b574ff67',
        nftxVaultFactoryMock_setNFTAsset_44_erc721_2_: '0xd749caa4a0e4714abe07564e1cf69d51d6f95f1eae73c8da40da4d2af79136f7',
        nftxVaultFactoryMock_setNFTAsset_45_erc721_3_: '0x51b8c8f776f6d63af615d10f9ded58b6cc1153d80e814bfb414acdfcbd3cb9e1',
        unitroller__setNFTLiquidationExchangePToken: '0x708665303ad00415efd10c9e1b09092339b28425e11d148615ea7c1a21432b55',
        usdc_mint_nftxMarketplaceZap_: '0x3edfddceceeb3b898ba678c2cc6a872c54a7c0cf945b19e8a28ca1f5e6bb53c5',
        unitroller__setNFTXMarketplaceZapAddress: '0x062d5c66c967ec282db241f0080e60ae1176222abcdbcb09089ba4fec9447ac6',
        pcryptopunks__setNFTXVaultId: '0x79822f995557fb2d28bf0bd4f7fec046b617ba6c3c5fe0ae670e63f2ced1cfa3',
        perc721__setNFTXVaultId: '0xa6dfaba89880c1211dd3546f8cb83a36c75c6eff26dacf5e7b4bce6335e20dd4',
        perc721_2__setNFTXVaultId: '0x44dd9bf3855e599f55ee1ac634f547e7511a7a0596ca419e128776711168161d',
        perc721_3__setNFTXVaultId: '0x9161d9d8e57fde1f7538f28b1da6656b97257fbdac357b3cb1609720c294a4c2',
        cryptopunks_getPunk_0_: '0xc67b22da6aa2bfab922f240124a38a734f62b04f9e18b7ca7cdb481a4386396f',
        cryptopunks_offerPunkForSaleToAddress_0_pcryptopunks_: '0x552e693a2d01d779b7ae7b8048bdb2386f209019f465692b1a93979fd1b0875e',
        pcryptopunks_mint_0_: '0xa15fa60cdd4586ccbd54068134f4aa19751bc971bfc8938f5bf3dcfb7f5d8356',
        unitroller_enterNFTMarkets_pcryptopunks_: '0xf8853bb8b6edff01629d5b3938dc8b601e4009d732ff00535783e566bf35ae62',
        cryptopunks_getPunk_1_: '0xc1f5a4431e174d749668a762c438a9565abf32838e13e1600f01670037b50469',
        cryptopunks_offerPunkForSaleToAddress_1_pcryptopunks_: '0xb417f27a197c654ea0dcb71930a8869dc7eea666ef38cee8d485d648120bbc80',
        pcryptopunks_mint_1_: '0x3c0a102952bb8eda057619fc8f5289ccb70b0f4a9eeced6faae7533b623529a0',
        erc721_claim_0_: '0x7f2e3b04e851b877c4877e895ae8867e1177d2ec34751818e2eec4a6aa293c74',
        erc721_approve_perc721_0_: '0x8958e8b2cb328ebb647871cfb58e8fe5fd9b48d8871520ffbef794766a72427a',
        perc721_mint_0_: '0xae95a1f79a31caf595ddaf3b2b7f173f0454758e6e53a061f3dd7e41b7e08cd6',
        unitroller_enterNFTMarkets_perc721_: '0xeffff21f480e2538e3c481c5b59846c9a8d6ef8bc1c00c631e7f3c8e8e93b2f3',
        unitroller_enterMarkets_pdai_: '0x8abad5c5a67d76c785cb325089a17e5e32fb90e56d197c648a6b7d9936b9888e',
        dai_mint: '0x5e77ff12900d5dd861f622357da27e2f38b3c3cb82df632759fb0fd827b30e7d',
        dai_approve: '0x1f61217fb2be77833a426804b2e249da7170190538f7a2f35a0cc975e4898f95',
        pdai_mint: '0x60546da6a6d30273292073888e2b187bffedeeb6766607b9f4010c293f9f931b',
        usdc_mint: '0x406a754f2b6871018b465f04027718e03db5c2ed4a37023c8ffe937f8730876d',
        usdc_approve: '0x802593788c4fc6a20748aea94b1d8a9e0af37928a86e06517128cfd505b363da',
        pusdc_mint: '0x3121db5bbcde795a542eafa521bbb6ab3958bea901376782c71b6fe15d85d95e',
        unitroller_enterMarkets_pusdc_: '0xc128fd9ce2c1c6bcb1e6dc516ec0bb082c983e89f60a89576290f003d9b4a4d3',
        pcryptopunks_transferFrom_owner_user1_0_: '0x070c39a1fbe61530287ee6338107a98f839701b604328f2832acf3d0674f7b87',
        oracle_setUnderlyingNFTPrice_perc721_4_: '0xa68a84d2c036b82abc7bdbfad013ce7157ceabb4b87e995f7487780894a884b9',
        oracle_setUnderlyingNFTPrice_pcryptopunks_4_: '0x027032f49451827d1f4692e912ec62914d0f2ca72ec50e03a707dd666818579e',
        oracle_setUnderlyingNFTPrice_perc721_2_4_: '0xa46fc3cfadeb6a6e0ff35090e7b24bb57960581826962a6e79bc2866464a6350',
        oracle_setUnderlyingNFTPrice_perc721_3_4_: '0xd27f455e07be853f151703bcebf154705049dbe8a52d311aad0e11bb3bb75bf7',

        erc721_4: '0x71A700BFC4e3F2265150368829329cf1038BE554', // ERC721ClaimableMock
        perc721_4_delegate: '0xc803e8420c426280d11dC38cF0B4378772C3644E', // PErc721Delegate
        perc721_4: '0xe2b6bF5bD27C5B80E76a0Eb2DcD923d6422E92dd', // PNFTTokenDelegator upgradeable
        oracle_setUnderlyingNFTPrice_perc721_4_0_: '0xac1744f61453f40b06fa07c39dac943d460a7ad0376540c934455fbd7d69a959',
        oracle_setUnderlyingNFTPrice_perc721_4_1_: '0x34ab5f0045dc6b84064f1ec314cc91eedaa831053f6f5fe7898017908a387725',
        oracle_setUnderlyingNFTPrice_perc721_4_2_: '0xaa2e0a1b6dbeb6ce6294b545b293f56bdc0f99136b15542e3592890189c98353',
        oracle_setUnderlyingNFTPrice_perc721_4_3_: '0x938824b74bab9bafd546d508cc9bdbf828e109d3d4a40ec1f9bab6debdfdbe22',
        oracle_setUnderlyingNFTPrice_perc721_4_4_: '0x035e3939e68f378646c614286849819db4414076ba6d3a27f9eb76e640e8892b',
        unitroller__supportNFTMarket_perc721_4_: '0x7175c6f13f772ab5581cf9cb96a1ae5ce3b77c63964bc1666e765653055c197e',
        unitroller__setNFTCollateralFactor_perc721_4_: '0xe4dab67a5973db08458f57f7c61f3393da29119e793ed96c2b5b194835775e27',
        nftxVaultFactoryMock_setNFTAsset_46_erc721_4_: '0xc379f7ab0754a9ea14c617325144154d2ef513105d39ec11d42eacfec86198fd',
        perc721_4__setNFTXVaultId: '0x4d53f1c3cbc8aaf19f82bd5ce7788b3269d9d781abc5e106e4c8a281755e23f8',
        erc721_4_claim_0_: '0x7c1b4f9bad7a2c177dd3ac96d310e180102d400d3714d859738beba86e376032',
        erc721_4_claim_1_: '0xab0db3d931c1702036dc75c8ca17a24ebd8fcca30a7e7d1be5fad0e9f8f8ddf4',
        erc721_4_claim_2_: '0xe4f5f68269a8734707db09480aa7189a443814b2ea22661be7d72e0d158a0ee4',

        erc721_claim_200_: '0x3ab96aed6913cbc5b9504d961a6133b28273b94a5fe24575dd9a9e099f0837ce',
        erc721_claim_201_: '0xe355da99217f3e7457e86331795d0855781df6ba9e0e5d2c58085fe647339f6b',
        erc721_claim_202_: '0x876bf094f2a769f810b750dd797f8f82776d1a716c17911212e68b10def70d06',
        oracle_setUnderlyingNFTPrice_perc721_200_: '0x3ae030b2916572e4c24d69cc409aaccdff896c0081d5d8874728d1d9a16ad526',
        oracle_setUnderlyingNFTPrice_perc721_201_: '0x5c96a6376434c7a1e92752010ac3ba36f0b37b0f2ceb71c547b307aba87d2a39',
        oracle_setUnderlyingNFTPrice_perc721_202_: '0xca29136a5282ad10f8fb2e72147c285c73bc623a24cababf3de17186168232f3',
        erc721_2_claim_200_: '0xf25f05d1a638336554c6e2ebd57b4d99e3bef351b2147967a03a51ab8052fb1f',
        erc721_2_claim_201_: '0xea8a5e80ebf9740330188fff173da3084151e2deb67eae147e209fdba19ad933',
        erc721_2_claim_202_: '0x26447ceb3b2346e284b28df7b7675ed9b8f3a2534eee68a57c62c69267afa9ef',
        oracle_setUnderlyingNFTPrice_perc721_2_200_: '0x3931e210f90fc874ee75972db4380cb49c5c71608e96a1d810e6bd3ac3ea5b7e',
        oracle_setUnderlyingNFTPrice_perc721_2_201_: '0xf84d969d4e8ac005b449fbc962f4267e4674e0ebb68a1893a2858c9644f14822',
        oracle_setUnderlyingNFTPrice_perc721_2_202_: '0xa981e667f260de21039ec154e638cc43ce08ddb1b65193c0832b34610679318c',
        erc721_3_claim_200_: '0x19d93d1a7a280413723569cc8d169b3c19177df2a99f96bdf2c4d8ccc1a3511b',
        erc721_3_claim_201_: '0xd3e5283507cc7c1751a92d27f19c5f26e5a07eb3d97fbbe566ef8f89fe05b619',
        erc721_3_claim_202_: '0xac973069a38829cd6824a8bcbb2935e01f0361bcdcf3f65fbc6762b4172c8c98',
        oracle_setUnderlyingNFTPrice_perc721_3_200_: '0x68f1b23d73a2a93f8c67c3575d73add0abab2812c41add4cc27f90991658c010',
        oracle_setUnderlyingNFTPrice_perc721_3_201_: '0xe31426b47913d7d72ebb9c87a53ea39c6ca443aaec1c5c4030b0f2dac4d20aee',
        oracle_setUnderlyingNFTPrice_perc721_3_202_: '0xc1255725fd4a435adef1bd5148acd8ffc8a37ee0588c7c43e10d38fc72e1e26a',
        erc721_4_claim_200_: '0x0c03e721412ef33023812afc3bf6a1e5b39b347ec2a7410b581c6ab85f1607ae',
        erc721_4_claim_201_: '0xb71f1dabbd11c8b14639399c320c80626508a2b64cc84ad2037958a9e180ca1c',
        erc721_4_claim_202_: '0xa73ab5f54d948a71380394eb79aeaf6ad8c256d90463f10afc670aa30da37e94',
        oracle_setUnderlyingNFTPrice_perc721_4_200_: '0x71f077a421fdaa9e6ecbb1ebbbc26cdab8b72073b0b1005b058f9131a0acd4a7',
        oracle_setUnderlyingNFTPrice_perc721_4_201_: '0x72999bd7698d3cc3b09a2ac663470f4c43589b763bdeaa4e344a375a42f1a4d4',
        oracle_setUnderlyingNFTPrice_perc721_4_202_: '0x00d537249b9b7fe6f50a008f0f2b7caa446de0a9d6b81e1a7a42b24d6a8d8797',
    }


    let deployer = new DeployerNFT(addresses)
    await deployer.deploy()
}

module.exports = {
    deployNEW_NFTEnv,
}

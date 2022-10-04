<!---
[![CircleCI](https://circleci.com/gh/compound-finance/compound-protocol.svg?style=svg&circle-token=5ed19932325c559a06f71f87d69012aedd2cf3fb)](https://circleci.com/gh/compound-finance/compound-protocol) [![codecov](https://codecov.io/gh/compound-finance/compound-protocol/branch/master/graph/badge.svg?token=q4UvsvVzOX)](https://codecov.io/gh/compound-finance/compound-protocol)
-->

Paribus Protocol
=================
Forked from the Compound Protocol.

The Paribus Protocol is an Ethereum smart contract for supplying or borrowing assets. Through the pToken contracts, accounts on the blockchain *supply* capital (Ether or ERC-20 tokens) to receive pTokens or *borrow* assets from the protocol (holding other assets as collateral). The Paribus pToken contracts track these balances and algorithmically set interest rates for borrowers.

Before getting started with this repo, please read:

* The [Compound Whitepaper](https://compound.finance/documents/Compound.Whitepaper.pdf), describing how Compound works
* The [Compound Protocol Specification](https://github.com/compound-finance/compound-protocol/tree/master/docs/CompoundProtocol.pdf), explaining in plain English how the protocol operates

For questions about interacting with Compound, please visit [Compound Discord server](https://compound.finance/discord).

For security concerns, please visit [https://compound.finance/security](https://compound.finance/security) or email [security@compound.finance](mailto:security@compound.finance).

<!---
Contributing
============

Contributing to the Compound protocol is a bit different than most open-source projects -- check out the [community guide on Contributing](https://www.comp.xyz/t/contributing-to-compound-protocol/48).

-->
Contracts
=========

We detail a few of the core contracts in the Paribus protocol.

<dl>
  <dt>PToken, PErc20 and PEther</dt>
  <dd>The Paribus pTokens, which are self-contained borrowing and lending contracts. PToken contains the core logic and PErc20 and PEther add public interfaces for Erc20 tokens and ether, respectively. Each PToken is assigned an interest rate and risk model (see InterestRateModel and Comptroller sections), and allows accounts to *mint* (supply capital), *redeem* (withdraw capital), *borrow* and *repay a borrow*. Each PToken is an ERC-20 compliant token where balances represent ownership of the market.</dd>
</dl>

<dl>
  <dt>Comptroller</dt>
  <dd>The risk model contract, which validates permissible user actions and disallows actions if they do not fit certain risk parameters. For instance, the Comptroller enforces that each borrowing user must maintain a sufficient collateral balance across all pTokens.</dd>
</dl>

<dl>
  <dt>Paribus (PBX)</dt>
  <dd>The Paribus Governance Token (PBX). <!---Holders of this token have the ability to govern the protocol via the governor contract.--></dd>
</dl>

<!---
<dl>
  <dt>Governor Alpha</dt>
  <dd>The administrator of the Compound timelock contract. Holders of Comp token may create and vote on proposals which will be queued into the Compound timelock and then have effects on Compound cToken and Comptroller contracts. This contract may be replaced in the future with a beta version.</dd>
</dl>
-->

<dl>
  <dt>InterestRateModel</dt>
  <dd>Contracts which define interest rate models. These models algorithmically determine interest rates based on the current utilization of a given market (that is, how much of the supplied assets are liquid versus borrowed).</dd>
</dl>

<dl>
  <dt>Careful Math</dt>
  <dd>Library for safe math operations.</dd>
</dl>

<dl>
  <dt>ErrorReporter</dt>
  <dd>Library for tracking error codes and failure conditions.</dd>
</dl>

<dl>
  <dt>Exponential</dt>
  <dd>Library for handling fixed-point decimal numbers.</dd>
</dl>

<dl>
  <dt>SafeToken</dt>
  <dd>Library for safely handling Erc20 interaction.</dd>
</dl>

<dl>
  <dt>WhitePaperInterestRateModel</dt>
  <dd>Initial interest rate model, as defined in the Whitepaper. This contract accepts a base rate and slope parameter in its constructor.</dd>
</dl>

Installation
------------
To run paribus, pull the repository and install its dependencies. You will need [yarn](https://yarnpkg.com/lang/en/docs/install/) installed.

    git clone https://github.com/Paribus/paribus-protocol
    cd paribus-protocol
    yarn install
<!---
REPL
----

The Compound Protocol has a simple scenario evaluation tool to test and evaluate scenarios which could occur on the blockchain. This is primarily used for constructing high-level integration tests. The tool also has a REPL to interact with local the Compound Protocol (similar to `truffle console`).

    yarn repl -n development
    yarn repl -n rinkeby

    > Read PToken cBAT Address
    Command: Read PToken cBAT Address
    AddressV<val=0xAD53863b864AE703D31b819d29c14cDA93D7c6a6>

You can read more about the scenario runner in the [Scenario Docs](https://github.com/compound-finance/compound-protocol/tree/master/scenario/SCENARIO.md) on steps for using the repl.
-->

Testing
-------
Contract tests are defined under the tests directory `/test`. To run the tests run:

    yarn test


Formal Verification Specs
-------------------------

The Compound Protocol has a number of formal verification specifications, powered by [Certora](https://www.certora.com/). You can find details in the [original Compound repository](https://github.com/compound-finance/compound-protocol/tree/master/spec/formal).

Code Coverage
-------------
To run code coverage, run:

    yarn coverage

Linting
-------
To lint the code, run:

    yarn lint

Discussion
----------

For any concerns with the protocol, open an issue or visit Compound on [Discord](https://compound.finance/discord) to discuss.

For security concerns, please email [security@compound.finance](mailto:security@compound.finance).

_© Copyright 2022, Compound Labs, Paribus team_

Paribus Protocol
=================
Forked from the [Compound Protocol](https://github.com/compound-finance/compound-protocol).

The Paribus Protocol is an Ethereum smart contract for supplying or borrowing assets. Through the pToken contracts, accounts on the blockchain *supply* capital (Ether or ERC-20 tokens) to receive pTokens or *borrow* assets from the protocol (holding other assets as collateral). The Paribus pToken contracts track these balances and algorithmically set interest rates for borrowers.

Before getting started with this repo, please read:

* The [Paribus Litepaper](https://paribus.io/documents/PARIBUS-Litepaper-V1.0.pdf)
* The [Compound Whitepaper](https://compound.finance/documents/Compound.Whitepaper.pdf), describing how Compound works
* The [Compound Protocol Specification](https://github.com/compound-finance/compound-protocol/tree/master/docs/CompoundProtocol.pdf), explaining in plain English how the protocol operates

For questions about interacting with Paribus, please visit [Paribus Discord server](https://discord.io/paribus), [Paribus Telegram channel](https://t.me/paribus_io).

For security concerns, please visit our Discord / Telegram group or email [security@paribus.io](mailto:security@paribus.io).

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

<dl>
  <dt>InterestRateModel</dt>
  <dd>Contracts which define interest rate models. These models algorithmically determine interest rates based on the current utilization of a given market (that is, how much of the supplied assets are liquid versus borrowed).</dd>
</dl>

<dl>
  <dt>SafeMath</dt>
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
To run paribus, pull the repository and install its dependencies. You will need [npm](https://www.npmjs.com/) installed.

    git clone https://github.com/Paribus/paribus-protocol
    cd paribus-protocol
    npm install

Testing
-------
Contract tests are defined under the tests directory `/test`. To run the tests run:

    npm test


Code Coverage
-------------
To run code coverage, run:

    npm run coverage

Linting
-------
To lint the code, run:

    npm run lint

Discussion
----------

For any concerns with the protocol, open an issue or visit Paribus on [Discord](https://discord.io/paribus) to discuss.

For security concerns, please email [security@paribus.io](mailto:security@paribus.io).

_© Copyright 2023, Compound Labs, Paribus team_

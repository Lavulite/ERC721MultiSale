# ERC721MultiSale

## Summary

This project is a library to sale the ERC721.
Two types of Allow list sales are supported: Merkletree and Signature.

It is currently under development and has not been fully tested. Please use at your own risk.

このプロジェクトはERC721のNFTを販売するためのライブラリです。
ALの実現方法は下記二種類に対応しています。

- マークルツリー
- 署名

本ライブラリは現在開発中であり、十分なテストは完了していません。
利用する場合は自己責任でお願いします。

## Features

- [ERC721MultiSale.sol](./contracts/ERC721MultiSale.sol) : 複数回のセールを実施するための基本機能
- [ERC721MultiSaleByMerkle.sol](./contracts/merkletree/ERC721MultiSaleByMerkle.sol) : MerkletreeによるAL実装
- [ERC721MultiSaleBySignature.sol](./contracts/signature/ERC721MultiSaleBySignature.sol) : 署名によるAL実装

### ERC721MultiSale

現在のセール内容や購入数の管理を行います。
セール内容として以下の情報を管理します。

- id : セールのID ※セールを開催するごとに数値をあげる。
- saleType : 現在のセールが、「請求：0」か「交換：1」かを表す。
- mintCost : 現在のセールにおける単価。
- maxSupply : 現在のセールの最大在庫数。

請求(claim)とは、ETHを支払ってNFTを受け取ることを意味します。
交換(exchange)とは、ETHを支払って保有するトークンをburnし、burnしたtoken数だけ新しいトークンを受け取ることを意味します。

開催中のセールはclaimまたはexchangeどちらか一方のみ実行可能です。

### ERC721MultiSaleByMerkle

マークルツリーを用いてAL実装する機能を提供します。
セールを保存する際には必ずマークルルートを合わせて保存する必要があります。

マークルツリーの生成には[utils/merkletree.ts](./utils/merkletree.ts)をご利用ください。

マークルツリーのリーフは以下から構成されます。

- claimまたはexchange実行者のアドレス
- 現在のセールにおける実行者の最大実行回数

claimおよびexchange実行時は上記2つに加えて、マークルプルーフを引数に渡してください。

### ERC721MultiSaleBySignature

署名を用いてAL実装する機能を提供します。
運営が署名用のウォレットを用意し、APIで動的に署名を作るケースで利用します。
署名用のウォレットアドレスを事前にセットしておく必要がある点にご注意ください。

署名の生成には[utils/signature.ts](./utils/signature.ts)をご利用ください。

署名は以下から構成されます。

- 現在のセールID
- claimまたはexchange実行者のアドレス
- 現在のセールにおける実行者の最大実行回数

claimおよびexchange実行時はセールIDを除く上記2つに加えて、署名を引数に渡してください。

## Usage

npmを用いて導入可能です。

```shell
npm install erc721-multi-sales
```

基本機能はinternal関数として実装しています。
権限制御は利用するコレクション側の都合で行われるため、権限制御が必要な関数はexternal関数を提供していません。
interfaceのみ提供しているため、各コレクションにて必要な権限制御を加えたうえで実装してください。

## Sample

### Merkletree

マークルツリーを用いたAL実装サンプルは下記ファイルです。

```
contracts/sample/SampleERC721MultiSaleByMerkle.sol
```

### Signature

署名を用いたAL実装サンプルは下記ファイルです。

```
contracts/sample/SampleERC721MultiSaleBySignature.sol
```

## Test

[The test code](./test) will help you understand this library.

[テストコード](./test)は本ライブラリの機能を理解するために役立ちます。
是非ご参照ください。
---

# Client Haiex SDK Integration Guide

Integrate blockchain functionalities easily with `haiex-sdk`. This guide covers the basic setup and key functionalities to get you started with the Haiex SDK in your JavaScript or TypeScript project.

Code starter : https://gist.github.com/jsbeaudry/d43feff0967239b9ccd9e60337c69bcf

## Required packages

```bash
yarn add @gelatonetwork/relay-sdk magic-sdk @magic-ext/oauth ethers viem
```

## Installation

First, add `haiex-sdk` to your project using Yarn:

```bash
yarn add haiex-sdk
```

OR

```bash
npm install haiex-sdk
```

## Importing the SDK

Import the Haiex SDK into your project file:

```bash
import Haiex from "haiex-sdk";
```

## Initialization

Initialize the SDK with your project's specific keys:

```bash
const haiex = new Haiex(GELATO_KEY, MAGIC_KEY, INFURA_KEY);
```

Ensure to replace `GELATO_KEY`, `MAGIC_KEY`, and `INFURA_KEY` with your actual credentials.

## Checking User Login Status

Before proceeding with transactions, check if the user is logged in:

```bash
const isLogged = await haiex.isLoggedIn();
```

## Connecting a User

Connect a user with a valid email address:

```bash
const connected = await haiex.connect(email);
```

Make sure to replace `email` with the user's actual email address.

## Get User informations

```bash
const user = await haiex.getUser();
```

## Log Out a User

```bash
await haiex.logOutUser();
```

## Retrieving Stable Tokens

Get a list of available stable tokens:

```bash
const tokens = haiex.tokens; // ["htg","dop" ]
```

## Fetching Stable Coin Balances

To get the balance of stable coins

```bash
const balanceStables = await haiex.balanceStables();
```

## Sending Stable Coins

Send stable coins to a recipient:

```bash
await haiex.sendTransaction(
    token,                          // htg or dop
    recipient,                      // user address
    parseFloat(amount).toFixed(3),  // Amount to send
    callBack                        // Callback for transaction status
);
```

## Trading Stable Coins

Trade stable coins between two token types:

```bash
await haiex.tradeTransaction(
    token_1,                        // htg or dop
    token_2,                        // htg or dop
    parseFloat(amount).toFixed(3),  // Amount to trade
    callBack                        // Callback for transaction status
);
```

## Handling Callbacks

Define a callback method to handle transaction statuses:

```bash
const callBack = async (value) => {
    const status = value.task.taskState;
    console.log(status);
};
```

This function logs the transaction status, which you can customize according to your needs.

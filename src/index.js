import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth";
import { GelatoRelay } from "@gelatonetwork/relay-sdk";
import { polygonMumbai } from "viem/chains";
import { ethers } from "ethers";
import { createPublicClient, createWalletClient, custom, http } from "viem";

import stable_abis from "./abis/stable_abi";
import haiex_abi_full from "./abis/haiex_abi";

const floating = 1000000;

const addrs = {
  haiex: "0x036C704665AEda449244214781f93037B718B386",
  usd: "0xc14c9D26b33f96ACEB0CfD6c24618b0Ef1B73Cec",
  htg: "0xCe555e72861f7888F7627436c11732929e5e3DAd",
  dop: "0x6222E79398559FAB3931f156d0ce8b11586ddaEf",
  owner: "0x5C86a13b80Be938BfF49A0FbF836F4054F55b0f1",
};

class Haiex {
  constructor(GELATO_KEY, MAGIC_KEY, INFURA_KEY) {
    this.GELATO_KEY = GELATO_KEY;
    this.MAGIC_KEY = MAGIC_KEY;
    this.rpcUrl = `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`;
    const customNodeOptions = {
      rpcUrl: this.rpcUrl,
      chainId: polygonMumbai.chainId, // Polygon chain id
    };

    this.magic = new Magic(MAGIC_KEY, {
      network: customNodeOptions,
      extensions: [new OAuthExtension()],
    });

    this.provider = new ethers.BrowserProvider(this.magic.rpcProvider);
    this.relay = new GelatoRelay();

    this.haiex = addrs.haiex;
    this.stables = {
      htg: addrs.htg,
      dop: addrs.dop,
      usd: addrs.usd,
    };

    this.tokens = ["htg", "dop"];

    this.publicClient = createPublicClient({
      chain: polygonMumbai,
      transport: http(this.rpcUrl),
    });

    this.walletClientWC = createWalletClient({
      chain: polygonMumbai,
      transport: custom(this.magic.rpcProvider),
    });

    // this.approve(this.stables.usd, this.haiex, 1000000 * floating);
  }

  async balanceOf(token, account) {
    try {
      const balance = await this.publicClient.readContract({
        address: token,
        abi: stable_abis,
        functionName: "balanceOf",
        args: [account],
      });
      return parseFloat(balance) / floating;
    } catch (err) {
      console.error(err);
    }
  }

  async balanceStables(addr) {
    const user = await this.getUser();
    try {
      let balances = {};
      balances.usd = await this.balanceOf(
        this.stables.usd,
        addr || user.publicAddress
      );
      balances.htg = await this.balanceOf(
        this.stables.htg,
        addr || user.publicAddress
      );
      balances.dop = await this.balanceOf(
        this.stables.dop,
        addr || user.publicAddress
      );
      balances.reserve = await this.balanceOf(this.stables.usd, this.haiex);

      return balances;
    } catch (error) {
      console.log(error);
    }
  }

  async approve(token, spender, amount) {
    try {
      const [account] = await this.walletClientWC.getAddresses();
      const { request } = await this.publicClient.simulateContract({
        account,
        address: token,
        abi: stable_abis,
        functionName: "approve",
        args: [spender, amount],
      });
      const rep = await this.walletClientWC.writeContract(request);

      console.log(rep);
      return rep;
    } catch (err) {
      console.error(err);
    }
  }

  async send(token, to, amount) {
    try {
      const [account] = await this.walletClientWC.getAddresses();
      const { request } = await this.publicClient.simulateContract({
        account,
        address: this.haiex,
        abi: haiex_abi_full,
        functionName: "sendStable",
        args: [token, to, amount],
      });
      const rep = await this.walletClientWC.writeContract(request);

      console.log(rep);
      return rep;
    } catch (err) {
      console.error(err);
    }
  }

  async mint(token, amount) {
    try {
      const [account] = await this.walletClientWC.getAddresses();
      const { request } = await this.publicClient.simulateContract({
        account,
        address: this.haiex,
        abi: haiex_abi_full,
        functionName: "buyStable",
        args: [token, amount],
      });
      const rep = await this.walletClientWC.writeContract(request);

      console.log(rep);
      return rep;
    } catch (err) {
      console.error(err);
    }
  }

  async redeem(token, amount) {
    try {
      const [account] = await this.walletClientWC.getAddresses();
      const { request } = await this.publicClient.simulateContract({
        account,
        address: this.haiex,
        abi: haiex_abi_full,
        functionName: "sellStable",
        args: [token, amount],
      });
      const rep = await this.walletClientWC.writeContract(request);

      console.log(rep);
      return rep;
    } catch (err) {
      console.error(err);
    }
  }

  async trade(token1, token2, amount) {
    try {
      const [account] = await this.walletClientWC.getAddresses();
      const { request } = await this.publicClient.simulateContract({
        account,
        address: this.haiex,
        abi: haiex_abi_full,
        functionName: "stableTrade",
        args: [token1, token2, amount],
      });
      const rep = await this.walletClientWC.writeContract(request);

      console.log(rep);
      return rep;
    } catch (err) {
      console.error(err);
    }
  }

  async connect(email) {
    try {
      const connected = await this.magic.auth.loginWithEmailOTP({ email });
      return connected;
    } catch (err) {
      console.error(err);
    }
  }

  async gitConnect() {
    try {
      await this.magic.oauth.loginWithRedirect({
        provider: "github",
        redirectURI: new URL(window.location.origin).href,
      });
    } catch (err) {
      console.error(err);
    }
  }

  async isLoggedIn() {
    try {
      const isLogged = await this.magic.user.isLoggedIn();
      return isLogged;
    } catch (err) {
      console.error(err);
    }
  }

  async getUser() {
    try {
      return await this.magic.user.getInfo();
    } catch (err) {
      console.error(err);
    }
  }

  async getContract() {
    try {
      const provider = new ethers.BrowserProvider(this.magic.rpcProvider);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(this.haiex, haiex_abi_full, signer);
      console.log(contract);
      return contract;
    } catch (err) {
      console.error(err);
    }
  }
  async approveStable(token, callback) {
    try {
      const isLogged = await this.isLoggedIn();

      if (isLogged) {
        const provider = new ethers.BrowserProvider(this.magic.rpcProvider);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(token, stable_abis, signer);
        console.log(contract);

        // await this.mint(this.stables.dop, 1000000);
        // const contract = await this.getContract();
        const user = await this.getUser();
        const amount = 100000 * floating;
        const { data } = await contract.approve.populateTransaction(
          this.haiex,
          amount
        );

        const request = {
          chainId: (await this.provider.getNetwork()).chainId,
          target: token,
          data,
          user: user.publicAddress,
        };

        const relayResponse = await this.relay.sponsoredCallERC2771(
          request,
          this.provider,
          this.GELATO_KEY
        );

        // console.log(relayResponse);
        this.checkTaskId(relayResponse.taskId, callback);
      } else {
        callback({
          error: true,
          message: "Please logged in to process this transaction",
        });
      }
    } catch (err) {
      console.error(err);
    }
  }
  async sendTransaction(token, to, amount, callback) {
    try {
      const isLogged = await this.isLoggedIn();

      if (isLogged) {
        // await this.mint(this.stables.dop, 1000000);
        const contract = await this.getContract();
        const user = await this.getUser();

        const { data } = await contract.sendStable.populateTransaction(
          this.stables[token],
          to,
          amount * floating
        );

        const request = {
          chainId: (await this.provider.getNetwork()).chainId,
          target: this.haiex,
          data,
          user: user.publicAddress,
        };

        const relayResponse = await this.relay.sponsoredCallERC2771(
          request,
          this.provider,
          this.GELATO_KEY
        );

        // console.log(relayResponse);
        this.checkTaskId(relayResponse.taskId, callback);
      } else {
        callback({
          error: true,
          message: "Please logged in to process this transaction",
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async mintTransaction(token, amount, callback) {
    try {
      const isLogged = await this.isLoggedIn();

      if (isLogged) {
        // await this.mint(this.stables.dop, 1000000);
        const contract = await this.getContract();
        const user = await this.getUser();
        const amt = amount * floating;
        console.log(amt);
        const { data } = await contract.buyStable.populateTransaction(
          this.stables[token],
          amt
        );

        const request = {
          chainId: (await this.provider.getNetwork()).chainId,
          target: this.haiex,
          data,
          user: user.publicAddress,
        };

        const relayResponse = await this.relay.sponsoredCallERC2771(
          request,
          this.provider,
          this.GELATO_KEY
        );

        // console.log(relayResponse);
        this.checkTaskId(relayResponse.taskId, callback);
      } else {
        callback({
          error: true,
          message: "Please logged in to process this transaction",
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async redeemTransaction(token, amount, callback) {
    try {
      const isLogged = await this.isLoggedIn();

      if (isLogged) {
        // await this.mint(this.stables.dop, 100000
        const contract = await this.getContract();
        const user = await this.getUser();

        const amt = amount * floating;
        console.log(amt);
        const { data } = await contract.sellStable.populateTransaction(
          this.stables[token],
          amt
        );

        const request = {
          chainId: (await this.provider.getNetwork()).chainId,
          target: this.haiex,
          data,
          user: user.publicAddress,
        };

        const relayResponse = await this.relay.sponsoredCallERC2771(
          request,
          this.provider,
          this.GELATO_KEY
        );

        // console.log(relayResponse);
        this.checkTaskId(relayResponse.taskId, callback);
      } else {
        callback({
          error: true,
          message: "Please logged in to process this transaction",
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async tradeTransaction(token1, token2, amount, callback) {
    try {
      const isLogged = await this.isLoggedIn();

      if (isLogged) {
        // await this.mint(this.stables.dop, 1000000);
        const contract = await this.getContract();
        const user = await this.getUser();
        const amt = amount * floating;

        const tok1 = this.stables[token1];
        const tok2 = this.stables[token2];

        console.log(amt, tok1, tok2);

        const { data } = await contract.stableTrade.populateTransaction(
          tok1,
          tok2,
          amt
        );

        const request = {
          chainId: (await this.provider.getNetwork()).chainId,
          target: this.haiex,
          data,
          user: user.publicAddress,
        };

        const relayResponse = await this.relay.sponsoredCallERC2771(
          request,
          this.provider,
          this.GELATO_KEY
        );

        // console.log(relayResponse);
        this.checkTaskId(relayResponse.taskId, callback);
      } else {
        callback({
          error: true,
          message: "Please logged in to process this transaction",
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async logOutUser() {
    try {
      await this.magic.user.logout();

      return await this.magic.user.isLoggedIn();
    } catch (err) {
      console.error(err);
    }
  }

  async checkTaskId(taskId, callback) {
    //
    const intervalID = setInterval(async () => {
      const response = await fetch(
        `https://api.gelato.digital/tasks/status/${taskId}`,
        {
          headers: {
            accept: "application/json",
          },
        }
      );
      const txStatus = await response.json();
      console.log(txStatus);
      callback(txStatus);

      if (
        txStatus.task.taskState === "ExecSuccess" ||
        txStatus.task.taskState === "Cancelled"
      ) {
        clearInterval(intervalID);
      }
    }, 5000);
  }
}

export default Haiex;

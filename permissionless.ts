import {
    ENTRYPOINT_ADDRESS_V06,
    ENTRYPOINT_ADDRESS_V07,
    createSmartAccountClient,
    type UserOperation,
} from "permissionless";
import {
    signerToEcdsaKernelSmartAccount,
    signerToSimpleSmartAccount,
} from "permissionless/accounts";
import {
    createPimlicoBundlerClient,
    createPimlicoPaymasterClient,
} from "permissionless/clients/pimlico";
import {
    type PublicClient,
    createPublicClient,
    http,
    parseEther,
    type Address,
} from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { JiffyPaymaster } from "@jiffy-labs/web3a";

export const publicClient: PublicClient = createPublicClient({
    transport: http("https://api.developer.coinbase.com/rpc/v1/base/..."),
});

const jiffyscanKey = process.env.JIFFYSCAN_KEY as string;


const paymasterClient = new JiffyPaymaster("http://localhost:2999/", 8453, {
    "x-api-key": jiffyscanKey,
});


const pvtKey = process.env.PVT_KEY as `0x${string}`;

const signer = privateKeyToAccount(pvtKey);

const kernelAccount = await signerToEcdsaKernelSmartAccount(publicClient, {
    entryPoint: ENTRYPOINT_ADDRESS_V06, // global entrypoint
    signer: signer,
    index: 0n, // optional
});


const smartAccountClient = createSmartAccountClient(
    {
        // @ts-ignore 
        account: kernelAccount,
        entryPoint: ENTRYPOINT_ADDRESS_V06,
        chain: base,
        bundlerTransport: http('https://base.jiffyscan.xyz', {
            fetchOptions: {
                headers: { "x-api-key": jiffyscanKey },
            },
        }),
        middleware: {
            sponsorUserOperation: paymasterClient.sponsorUserOperationV6,

        }
    });

console.log(kernelAccount.address);

export const bundlerClient = createPimlicoBundlerClient({
    transport: http('https://base.jiffyscan.xyz', {
        fetchOptions: {
            headers: { "x-api-key": jiffyscanKey },
        },
    }),
    entryPoint: ENTRYPOINT_ADDRESS_V06,
});

const gasPrices = await bundlerClient.getUserOperationGasPrice();
console.log(gasPrices);
// @ts-ignore
console.log(smartAccountClient.account.address);

// @ts-ignore
const txHash = await smartAccountClient.sendTransaction({
    to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    // nonce: 1,
    value: parseEther("0.00"),
    maxFeePerGas: gasPrices.fast.maxFeePerGas, // if using Pimlico
    maxPriorityFeePerGas: gasPrices.fast.maxPriorityFeePerGas, // if using Pimlico
});

console.log(txHash);

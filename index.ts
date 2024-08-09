import { createPublicClient, http, parseEther } from 'viem'
import { createBundlerClient, createPaymasterClient, toCoinbaseSmartAccount } from 'viem/account-abstraction';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet, base } from 'viem/chains';


const jiffyscanKey = process.env.JIFFYSCAN_KEY as string;
const rpc = process.env.RPC as string;

const client = createPublicClient({
    chain: base,
    transport: http(rpc),
});

const pvtKey = process.env.PVT_KEY as `0x${string}`;
const owner = privateKeyToAccount(pvtKey);

const paymasterClient = createPaymasterClient({
    transport: http("https://paymaster.jiffyscan.xyz/8453", {
        fetchOptions: {
            headers: { "x-api-key": jiffyscanKey },
        },
    })
})

const bundlerClient = createBundlerClient({
    client,
    paymaster: paymasterClient,
    transport: http('https://base.jiffyscan.xyz', {
        fetchOptions: {
            headers: { "x-api-key": jiffyscanKey },
        },
    }),
});



const account = await toCoinbaseSmartAccount({
    client,
    owners: [owner]
});

console.log('smart account address - ', account.address);

const hash = await bundlerClient.sendUserOperation({
    account,
    calls: [{
        to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
        value: parseEther('0.000'),
    }],
    maxFeePerGas: BigInt('106833310'),
    maxPriorityFeePerGas: BigInt('10000000'),
}) as string;

console.log('https://jiffyscan.xyz/userOpHash/' + hash);

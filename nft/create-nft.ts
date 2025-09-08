import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { generateSigner, keypairIdentity, percentAmount, publicKey } from "@metaplex-foundation/umi";
import { getKeypairFromFile, airdropIfRequired, getExplorerLink } from "@solana-developers/helpers";
import { Connection, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";

(async () => {
    // Connect to Devnet
    const connection = new Connection(clusterApiUrl("devnet"));
    const user = await getKeypairFromFile();
    await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);

    console.log("Loaded wallet:", user.publicKey.toBase58());

    // Set up Umi
    const umi = createUmi(connection.rpcEndpoint);
    umi.use(mplTokenMetadata());
    const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
    umi.use(keypairIdentity(umiUser));

    console.log("Set up Umi instance for user");

    const collectionAddress = publicKey("J8mTiUpNwmRrEJY4NLH2DkGXLfFnuy43g3d1Fg58GL17");

    console.log(`creating NFT...`);

    const mint = generateSigner(umi);

    const transaction = await createNft(umi, {
        mint,
        name: "My NFT",
        uri: "https://raw.githubusercontent.com/UncleKweks/Rust-Solana-Portfolio/main/nft/assets/my_nft.json",  
        sellerFeeBasisPoints: percentAmount(0),
        collection: {
            key: collectionAddress,
            verified: false
        },
    });

    await transaction.sendAndConfirm(umi);

    // const createdNft = await fetchDigitalAsset(umi, mint.publicKey);

    console.log(`🎭 NFT created! Explorer: ${getExplorerLink("address", mint.publicKey, "devnet")}`);
    
})(); 


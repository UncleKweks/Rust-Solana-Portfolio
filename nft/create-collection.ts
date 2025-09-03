import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { generateSigner, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";
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

    // Generate a NEW fresh mint
    const collectionMint = generateSigner(umi);

    // Create NFT as collection
    const tx = await createNft(umi, {
        mint: collectionMint,
        name: "My Test NFT",
        symbol: "TST",
        uri: "https://raw.githubusercontent.com/UncleKweks/Rust-Solana-Portfolio/main/nft/assets/metadata.json",
        sellerFeeBasisPoints: percentAmount(0),
        isCollection: true,
    }).sendAndConfirm(umi);

    console.log("✅ Collection NFT created!");
    console.log(`Explorer: ${getExplorerLink("address", collectionMint.publicKey, "devnet")}`);
})();

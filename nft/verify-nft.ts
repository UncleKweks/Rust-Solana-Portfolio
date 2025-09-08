import { createNft, findMetadataPda, mplTokenMetadata, verifyCollectionV1 } from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { generateSigner, keypairIdentity, publicKey } from "@metaplex-foundation/umi";
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
    
    const nftAddress = publicKey("At4H1AWXcP9QkdK4GGueAXPfmqMhZ3cdDnKLMto2toA");
    
    const transaction = await verifyCollectionV1(umi, {
        metadata: findMetadataPda(umi, { mint: nftAddress }),
        collectionMint: collectionAddress,
        authority: umi.identity,
    });

    transaction.sendAndConfirm(umi);

    console.log(`✅ NFT collection ${nftAddress} verified as member of collection ${collectionAddress} See Explorer at ${getExplorerLink("address", nftAddress, "devnet")}`);

})();
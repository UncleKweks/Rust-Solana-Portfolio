'use client';

import { clusterApiUrl, Connection } from '@solana/web3.js';
import { useMemo } from 'react';

export function useCluster() {
    const cluster = 'devnet'; // hardcoded for now, can add mainnet/testnet switch later
    const endpoint = clusterApiUrl(cluster);

    const connection = useMemo(() => new Connection(endpoint, 'confirmed'), [endpoint]);

    return { cluster, endpoint, connection };
}

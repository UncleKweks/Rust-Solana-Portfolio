'use client';

import { useEffect, useState, useCallback } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { Program, Idl, BN } from '@coral-xyz/anchor';
import { useAnchorProvider } from '../solana/solana-provider';
import IDL from '../../crud_app.json';

// Program ID comes from IDL
const PROGRAM_ID = new PublicKey(IDL.address);

type JournalEntry = {
    publicKey: PublicKey;
    account: {
        owner: PublicKey;
        id: BN;
        title: string;
        content: string;
    };
};

type CrudEntry = {
    id: string;
    title: string;
    content: string;
};

export function useCrudProgram() {
    const provider = useAnchorProvider();
    const [program, setProgram] = useState<Program | null>(null);
    const [entries, setEntries] = useState<CrudEntry[]>([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (!provider) {
            setProgram(null);
            return;
        }

        import('@coral-xyz/anchor')
            .then(({ Program }) => {
                const prog = new Program(IDL as Idl, PROGRAM_ID, provider);
                setProgram(prog);
            })
            .catch(console.error);
    }, [provider]);

    // Derive PDA
    const getEntryPda = (owner: PublicKey, id: number) => {
        return PublicKey.findProgramAddressSync(
            [Buffer.from('journal'), owner.toBuffer(), new BN(id).toArrayLike(Buffer, 'le', 8)],
            PROGRAM_ID
        );
    };

    // Fetch all entries
    const fetchEntries = useCallback(async () => {
        if (!program || !provider) return;

        setLoading(true);
        try {
            const accounts = (await (program.account as any).journalEntryState.all()) as JournalEntry[];
            const simplified: CrudEntry[] = accounts
                .filter((acc) => acc.account.owner.equals(provider.wallet.publicKey!))
                .sort((a, b) => a.account.id.cmp(b.account.id))
                .map((acc) => ({
                    id: acc.account.id.toString(),
                    title: acc.account.title,
                    content: acc.account.content,
                }));
            setEntries(simplified);
        } catch (err) {
            console.error('Failed to fetch entries', err);
        } finally {
            setLoading(false);
        }
    }, [program, provider]);

    // Load entries when program is ready
    useEffect(() => {
        if (program && provider) {
            fetchEntries();
        }
    }, [program, provider, fetchEntries]);

    // Create
    const createEntry = async (title: string, content: string) => {
        if (!program || !provider) return;

        setLoading(true);
        try {
            const nextId = entries.length > 0 ? Math.max(...entries.map((e) => parseInt(e.id))) + 1 : 0;
            const [entryPda] = getEntryPda(provider.wallet.publicKey!, nextId);

            await program.methods
                .createJournalEntry(new BN(nextId), title, content)
                .accounts({
                    journalEntry: entryPda,
                    owner: provider.wallet.publicKey!,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            await fetchEntries();
        } catch (err) {
            console.error('Failed to create entry', err);
        } finally {
            setLoading(false);
        }
    };

    // Update
    const updateEntry = async (id: string, title: string, content: string) => {
        if (!program || !provider) return;

        setLoading(true);
        try {
            const numericId = parseInt(id, 10);
            const [entryPda] = getEntryPda(provider.wallet.publicKey!, numericId);

            await program.methods
                .updateJournalEntry(title, content) // <-- matches Rust fn signature
                .accounts({
                    journalEntry: entryPda,
                    owner: provider.wallet.publicKey!,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            await fetchEntries();
        } catch (err) {
            console.error('Failed to update entry', err);
        } finally {
            setLoading(false);
        }
    };

    // Delete
    const deleteEntry = async (id: string) => {
        if (!program || !provider) return;

        setLoading(true);
        try {
            const numericId = parseInt(id, 10);
            const [entryPda] = getEntryPda(provider.wallet.publicKey!, numericId);

            await program.methods
                .deleteJournalEntry(new BN(numericId)) // <-- delete takes id
                .accounts({
                    journalEntry: entryPda,
                    owner: provider.wallet.publicKey!,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            await fetchEntries();
        } catch (err) {
            console.error('Failed to delete entry', err);
        } finally {
            setLoading(false);
        }
    };

    return {
        entries,
        loading,
        createEntry,
        updateEntry,
        deleteEntry,
        fetchEntries,
    };
}
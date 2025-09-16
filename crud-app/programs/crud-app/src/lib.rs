use anchor_lang::prelude::*;

declare_id!("EBptMps7hrRq9nE9Liu1Rk4etYoCJvR1eMVrzxMKTwtU");

#[program]
pub mod crud_app  {
    use super::*;

    pub fn create_journal_entry(
        ctx: Context<CreateEntry>, 
        id: u64, 
        title: String, 
        content: String
    ) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.owner = *ctx.accounts.owner.key;
        journal_entry.id = id;
        journal_entry.title = title;
        journal_entry.content = content;
        Ok(())
    }

    pub fn update_journal_entry(
        ctx: Context<UpdateEntry>, 
        title: String, 
        content: String
    ) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        require!(journal_entry.owner == *ctx.accounts.owner.key, JournalError::Unauthorized);

        journal_entry.title = title;
        journal_entry.content = content;
        Ok(())
    }

   pub fn delete_journal_entry(ctx: Context<DeleteEntry>) -> Result<()> {
    let journal_entry = &ctx.accounts.journal_entry;

    // Safety check: only owner can delete
    require!(journal_entry.owner == *ctx.accounts.owner.key, JournalError::Unauthorized);

    Ok(())
}

}

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct CreateEntry<'info> {
    #[account(
        init, 
        seeds = [b"journal", owner.key().as_ref(), &id.to_le_bytes()],
        bump,
        space = 8 + JournalEntryState::INIT_SPACE,
        payer = owner,
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateEntry<'info> {
    #[account(
        mut, 
        seeds = [b"journal", owner.key().as_ref(), &journal_entry.id.to_le_bytes()],
        bump,
        realloc = 8 + JournalEntryState::INIT_SPACE,
        realloc::payer = owner,
        realloc::zero = true,
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}



#[derive(Accounts)]
#[instruction(id: u64)]
pub struct DeleteEntry<'info> {
    #[account(
        mut,
        close = owner,
        seeds = [b"journal", owner.key().as_ref(), &id.to_le_bytes()],
        bump,
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}



#[account]
#[derive(InitSpace)]
pub struct JournalEntryState {
    pub owner: Pubkey,
    pub id: u64,
    #[max_len(50)]
    pub title: String,
    #[max_len(1000)]
    pub content: String,
}

#[error_code]
pub enum JournalError {
    #[msg("Only the owner can update this entry.")]
    Unauthorized,
}

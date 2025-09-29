use anchor_lang::prelude::*;

declare_id!("933zmSGvoLgSaxNVCJURuXTSx4j1t4kdJbELGTxoX1u9");

#[program]
pub mod crud_backend {
    use super::*;

    
    /// Creates a new journal entry for the user
    /// Uses title + owner as seed to ensure unique entries per user

    pub fn create_journal_entry(
        ctx: Context<CreateJournalEntry>,
        title: String,
        content: String,
        category: String, // Added category for better organization
    ) -> Result<()> {
        // Basic input validation to prevent spam and ensure data quality
        require!(title.len() <= 100, JournalError::TitleTooLong);
        require!(content.len() <= 1000, JournalError::ContentTooLong);
        require!(!title.is_empty(), JournalError::TitleEmpty);
        require!(category.len() <= 50, JournalError::CategoryTooLong);

        let journal_entry = &mut ctx.accounts.journal_entry;
        
        // Set the basic entry data
        journal_entry.owner = *ctx.accounts.owner.key;
        journal_entry.title = title.clone();
        journal_entry.content = content;
        journal_entry.category = category;
        journal_entry.is_archived = false; // New entries are active by default
        
        // Use Solana's clock for consistent timestamps across the network
        let clock = Clock::get()?;
        journal_entry.created_at = clock.unix_timestamp;
        journal_entry.updated_at = clock.unix_timestamp;
        
        // Update the user's entry counter
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.total_entries += 1;
        
        // Emit event for frontend to listen and update UI accordingly
        emit!(JournalEntryCreated {
            owner: journal_entry.owner,
            title: title,
            category: journal_entry.category.clone(),
            created_at: journal_entry.created_at,
        });
        
        Ok(())
    }

    /// Updates an existing journal entry
    /// Only the owner can update their entries due to 'has_one = owner' constraint
    pub fn update_journal_entry(
        ctx: Context<UpdateJournalEntry>,
        title: String,
        content: String,
        category: String,
    ) -> Result<()> {
        // Same validation as create to maintain data integrity
        require!(title.len() <= 100, JournalError::TitleTooLong);
        require!(content.len() <= 1000, JournalError::ContentTooLong);
        require!(!title.is_empty(), JournalError::TitleEmpty);
        require!(category.len() <= 50, JournalError::CategoryTooLong);

        let journal_entry = &mut ctx.accounts.journal_entry;
        
        // Update the entry data
        journal_entry.title = title.clone();
        journal_entry.content = content;
        journal_entry.category = category;
        
        // Update timestamp to track when entry was last modified
        let clock = Clock::get()?;
        journal_entry.updated_at = clock.unix_timestamp;
        
        // Emit event for frontend state management
        emit!(JournalEntryUpdated {
            owner: journal_entry.owner,
            title: title,
            updated_at: journal_entry.updated_at,
        });
        
        Ok(())
    }

    /// Deletes a journal entry permanently
    /// The 'close = owner' constraint automatically refunds rent to the owner
    pub fn delete_journal_entry(
        ctx: Context<DeleteJournalEntry>,
        title: String,
    ) -> Result<()> {
        let journal_entry = &ctx.accounts.journal_entry;
        
        // Update user's entry counter before deletion
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.total_entries = user_profile.total_entries.saturating_sub(1); // Prevent underflow
        
        // Emit event before the account is closed
        emit!(JournalEntryDeleted {
            owner: journal_entry.owner,
            title: journal_entry.title.clone(),
        });
        
        // Account closure is handled automatically by Anchor's 'close' constraint
        Ok(())
    }

    /// Archives/unarchives a journal entry instead of deleting
    /// This provides a "soft delete" functionality for better UX
    pub fn toggle_archive_entry(
        ctx: Context<ToggleArchiveEntry>,
        title: String,
    ) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        
        // Toggle the archive status
        journal_entry.is_archived = !journal_entry.is_archived;
        
        // Update timestamp
        let clock = Clock::get()?;
        journal_entry.updated_at = clock.unix_timestamp;
        
        // Emit appropriate event based on new state
        if journal_entry.is_archived {
            emit!(JournalEntryArchived {
                owner: journal_entry.owner,
                title: journal_entry.title.clone(),
            });
        } else {
            emit!(JournalEntryUnarchived {
                owner: journal_entry.owner,
                title: journal_entry.title.clone(),
            });
        }
        
        Ok(())
    }

    /// Initializes a user profile to track their journal statistics
    /// This is called once per user to set up their profile
    pub fn initialize_user_profile(
        ctx: Context<InitializeUserProfile>,
    ) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        
        user_profile.owner = *ctx.accounts.owner.key;
        user_profile.total_entries = 0;
        
        let clock = Clock::get()?;
        user_profile.created_at = clock.unix_timestamp;
        
        emit!(UserProfileCreated {
            owner: user_profile.owner,
            created_at: user_profile.created_at,
        });
        
        Ok(())
    }

    /// Gets the count of entries for a user (for pagination purposes)
    /// This is a view function that doesn't modify state
    pub fn get_user_stats(
        ctx: Context<GetUserStats>,
    ) -> Result<UserStatsResponse> {
        let user_profile = &ctx.accounts.user_profile;
        
        Ok(UserStatsResponse {
            total_entries: user_profile.total_entries,
            member_since: user_profile.created_at,
        })
    }
}

// ============================================================================
// ACCOUNT CONTEXTS - Define the accounts needed for each instruction
// ============================================================================




/// Context for creating a new journal entry
#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateJournalEntry<'info> {
    /// The user creating the entry
    #[account(mut)]
    pub owner: Signer<'info>,

    /// New journal entry account
    #[account(
        init,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        payer = owner,
        space = 8 + JournalEntryState::INIT_SPACE,
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    /// User profile for tracking stats
    #[account(
        mut,
        seeds = [b"profile", owner.key().as_ref()],
        bump,
        has_one = owner,
    )]
    pub user_profile: Account<'info, UserProfile>,

    pub system_program: Program<'info, System>,
}



/// Context for updating an existing journal entry
#[derive(Accounts)]
#[instruction(title: String, content: String, category: String)]
pub struct UpdateJournalEntry<'info> {
    /// Owner must sign to prove they have permission
    #[account(mut)]
    pub owner: Signer<'info>,

    /// The journal entry to update - must exist and belong to signer
    #[account(
        mut,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        has_one = owner, // CRITICAL: Ensures only owner can update
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    pub system_program: Program<'info, System>,
}

/// Context for toggling archive state on an existing journal entry
#[derive(Accounts)]
#[instruction(title: String)]
pub struct ToggleArchiveEntry<'info> {
    /// Owner must sign to prove they have permission
    #[account(mut)]
    pub owner: Signer<'info>,

    /// The journal entry to archive/unarchive - must exist and belong to signer
    #[account(
        mut,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        has_one = owner,
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    pub system_program: Program<'info, System>,
}

/// Context for deleting a journal entry
#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteJournalEntry<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    /// The entry to delete - will be closed and rent refunded to owner
    #[account(
        mut,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        has_one = owner, // CRITICAL: Prevents unauthorized deletions
        close = owner,   // Automatically refunds rent to owner
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    /// User profile to update the entry count
    #[account(
        mut,
        seeds = [b"profile", owner.key().as_ref()],
        bump,
        has_one = owner,
    )]
    pub user_profile: Account<'info, UserProfile>,

    pub system_program: Program<'info, System>,
}

/// Context for initializing a user profile
#[derive(Accounts)]
pub struct InitializeUserProfile<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    /// User profile account - one per user
    #[account(
        init,
        seeds = [b"profile", owner.key().as_ref()],
        bump,
        payer = owner,
        space = 8 + UserProfile::INIT_SPACE,
    )]
    pub user_profile: Account<'info, UserProfile>,

    pub system_program: Program<'info, System>,
}

/// Context for getting user statistics
#[derive(Accounts)]
pub struct GetUserStats<'info> {
    pub owner: Signer<'info>,

    /// Read-only access to user profile
    #[account(
        seeds = [b"profile", owner.key().as_ref()],
        bump,
        has_one = owner,
    )]
    pub user_profile: Account<'info, UserProfile>,
}

// ============================================================================
// ACCOUNT STATES - Define the data structures stored on-chain
// ============================================================================

/// Main journal entry data structure
#[account]
#[derive(InitSpace)]
pub struct JournalEntryState {
    pub owner: Pubkey,        // 32 bytes - who owns this entry
    
    #[max_len(100)]
    pub title: String,        // 4 + 100 bytes - entry title
    
    #[max_len(1000)]
    pub content: String,      // 4 + 1000 bytes - entry content
    
    #[max_len(50)]
    pub category: String,     // 4 + 50 bytes - category for organization
    
    pub is_archived: bool,    // 1 byte - soft delete flag
    pub created_at: i64,      // 8 bytes - creation timestamp
    pub updated_at: i64,      // 8 bytes - last update timestamp
}

/// User profile to track statistics and metadata
#[account]
#[derive(InitSpace)]
pub struct UserProfile {
    pub owner: Pubkey,        // 32 bytes - profile owner
    pub total_entries: u32,   // 4 bytes - count of entries created
    pub created_at: i64,      // 8 bytes - when profile was created
}

// ============================================================================
// CUSTOM ERRORS - Define application-specific error messages
// ============================================================================

#[error_code]
pub enum JournalError {
    #[msg("Title cannot be empty")]
    TitleEmpty,
    #[msg("Title is too long (max 100 characters)")]
    TitleTooLong,
    #[msg("Content is too long (max 1000 characters)")]
    ContentTooLong,
    #[msg("Category is too long (max 50 characters)")]
    CategoryTooLong,
}

// ============================================================================
// EVENTS - For frontend integration and off-chain indexing
// ============================================================================

#[event]
pub struct JournalEntryCreated {
    pub owner: Pubkey,
    pub title: String,
    pub category: String,
    pub created_at: i64,
}

#[event]
pub struct JournalEntryUpdated {
    pub owner: Pubkey,
    pub title: String,
    pub updated_at: i64,
}

#[event]
pub struct JournalEntryDeleted {
    pub owner: Pubkey,
    pub title: String,
}

#[event]
pub struct JournalEntryArchived {
    pub owner: Pubkey,
    pub title: String,
}

#[event]
pub struct JournalEntryUnarchived {
    pub owner: Pubkey,
    pub title: String,
}

#[event]
pub struct UserProfileCreated {
    pub owner: Pubkey,
    pub created_at: i64,
}

// ============================================================================
// RETURN TYPES - For functions that return data
// ============================================================================

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UserStatsResponse {
    pub total_entries: u32,
    pub member_since: i64,
}
use anchor_lang::prelude::*;

declare_id!("3fAf1f2xVmJxSuUkV9RXs8jkLLFUj51YDmS4DUjXao7Z");

#[program]
pub mod social_platform {
    use super::*;

    pub fn initialize_user(ctx: Context<InitializeUser>, username: String) -> Result<()> {
        require!(username.len() <= 32, SocialPlatformError::UsernameTooLong);
        require!(username.len() > 0, SocialPlatformError::UsernameEmpty);

        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.owner = ctx.accounts.user.key();
        user_profile.username = username.clone();
        user_profile.post_count = 0;
        user_profile.followers_count = 0;
        user_profile.following_count = 0;
        user_profile.total_tips_received = 0;
        user_profile.total_tips_sent = 0;
        user_profile.bump = ctx.bumps.user_profile;
        user_profile.created_at = Clock::get()?.unix_timestamp;
        
        msg!("User profile initialized: {} ({})", username, ctx.accounts.user.key());
        Ok(())
    }

    pub fn create_post(
        ctx: Context<CreatePost>, 
        content: String, 
        image_url: Option<String>,
        tags: Vec<String>
    ) -> Result<()> {
        require!(content.len() <= 280, SocialPlatformError::ContentTooLong);
        require!(content.len() > 0, SocialPlatformError::ContentEmpty);
        require!(tags.len() <= 5, SocialPlatformError::TooManyTags);
        
        if let Some(ref url) = image_url {
            require!(url.len() <= 200, SocialPlatformError::ImageUrlTooLong);
        }

        for tag in &tags {
            require!(tag.len() <= 32, SocialPlatformError::TagTooLong);
        }
        
        let post = &mut ctx.accounts.post;
        let user_profile = &mut ctx.accounts.user_profile;
        
        post.author = ctx.accounts.author.key();
        post.content = content;
        post.image_url = image_url;
        post.tags = tags;
        post.timestamp = Clock::get()?.unix_timestamp;
        post.tips_received = 0;
        post.tip_count = 0;
        post.post_id = user_profile.post_count;
        post.is_active = true;
        post.bump = ctx.bumps.post;
        
        user_profile.post_count += 1;
        
        msg!("Post created by: {} with ID: {}", post.author, post.post_id);
        Ok(())
    }

    // ✅ Corrected version
    pub fn tip_post(ctx: Context<TipPost>, amount: u64) -> Result<()> {
        require!(amount > 0, SocialPlatformError::InvalidTipAmount);
        require!(amount >= 1000, SocialPlatformError::TipTooSmall);
        require!(
            ctx.accounts.tipper.key() != ctx.accounts.post.author,
            SocialPlatformError::CannotTipOwnPost
        );

        let post = &mut ctx.accounts.post;
        require!(post.is_active, SocialPlatformError::PostNotActive);

        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.tipper.key(),
            &ctx.accounts.post_author.key(),
            amount,
        );
        
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.tipper.to_account_info(),
                ctx.accounts.post_author.to_account_info(),
            ],
        )?;

        post.tips_received = post.tips_received.checked_add(amount)
            .ok_or(SocialPlatformError::ArithmeticOverflow)?;
        post.tip_count = post.tip_count.checked_add(1)
            .ok_or(SocialPlatformError::ArithmeticOverflow)?;

        msg!("Tip of {} lamports sent to post ID: {} (Total tips: {})", 
             amount, post.post_id, post.tip_count);
        Ok(())
    }

    pub fn follow_user(ctx: Context<FollowUser>) -> Result<()> {
        require!(
            ctx.accounts.follower.key() != ctx.accounts.target_user.key(),
            SocialPlatformError::CannotFollowSelf
        );

        let follow_record = &mut ctx.accounts.follow_record;
        follow_record.follower = ctx.accounts.follower.key();
        follow_record.following = ctx.accounts.target_user.key();
        follow_record.timestamp = Clock::get()?.unix_timestamp;
        follow_record.bump = ctx.bumps.follow_record;

        let follower_profile = &mut ctx.accounts.follower_profile;
        let target_profile = &mut ctx.accounts.target_profile;

        follower_profile.following_count = follower_profile.following_count
            .checked_add(1)
            .ok_or(SocialPlatformError::ArithmeticOverflow)?;

        target_profile.followers_count = target_profile.followers_count
            .checked_add(1)
            .ok_or(SocialPlatformError::ArithmeticOverflow)?;

        msg!("{} is now following {}", 
             ctx.accounts.follower.key(), 
             ctx.accounts.target_user.key());
        Ok(())
    }

    pub fn unfollow_user(ctx: Context<UnfollowUser>) -> Result<()> {
        let follower_profile = &mut ctx.accounts.follower_profile;
        let target_profile = &mut ctx.accounts.target_profile;

        follower_profile.following_count = follower_profile.following_count
            .checked_sub(1)
            .ok_or(SocialPlatformError::ArithmeticUnderflow)?;

        target_profile.followers_count = target_profile.followers_count
            .checked_sub(1)
            .ok_or(SocialPlatformError::ArithmeticUnderflow)?;

        msg!("{} unfollowed {}", 
             ctx.accounts.follower.key(), 
             ctx.accounts.target_user.key());
        Ok(())
    }

    pub fn edit_post(
        ctx: Context<EditPost>, 
        new_content: String,
        new_image_url: Option<String>
    ) -> Result<()> {
        require!(new_content.len() <= 280, SocialPlatformError::ContentTooLong);
        require!(new_content.len() > 0, SocialPlatformError::ContentEmpty);

        if let Some(ref url) = new_image_url {
            require!(url.len() <= 200, SocialPlatformError::ImageUrlTooLong);
        }

        let post = &mut ctx.accounts.post;
        require!(post.is_active, SocialPlatformError::PostNotActive);
        
        post.content = new_content;
        post.image_url = new_image_url;

        msg!("Post ID {} edited by author", post.post_id);
        Ok(())
    }

    pub fn deactivate_post(ctx: Context<DeactivatePost>) -> Result<()> {
        let post = &mut ctx.accounts.post;
        require!(post.is_active, SocialPlatformError::PostNotActive);
        
        post.is_active = false;

        msg!("Post ID {} deactivated by author", post.post_id);
        Ok(())
    }

    pub fn update_profile(
        ctx: Context<UpdateProfile>, 
        new_username: Option<String>
    ) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        
        if let Some(username) = new_username {
            require!(username.len() <= 32, SocialPlatformError::UsernameTooLong);
            require!(username.len() > 0, SocialPlatformError::UsernameEmpty);
            user_profile.username = username;
        }

        msg!("Profile updated for user: {}", ctx.accounts.user.key());
        Ok(())
    }
}

// Contexts
#[derive(Accounts)]
#[instruction(username: String)]
pub struct InitializeUser<'info> {
    #[account(
        init,
        payer = user,
        space = UserProfile::SPACE,
        seeds = [b"user_profile", user.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreatePost<'info> {
    #[account(
        init,
        payer = author,
        space = Post::SPACE,
        seeds = [b"post", author.key().as_ref(), &user_profile.post_count.to_le_bytes()],
        bump
    )]
    pub post: Account<'info, Post>,
    
    #[account(
        mut,
        seeds = [b"user_profile", author.key().as_ref()],
        bump = user_profile.bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    #[account(mut)]
    pub author: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

// ✅ Corrected simplified TipPost context
#[derive(Accounts)]
pub struct TipPost<'info> {
    #[account(mut)]
    pub post: Account<'info, Post>,
    
    #[account(mut)]
    pub tipper: Signer<'info>,
    
    /// CHECK: This is the post author who will receive the tip
    #[account(
        mut,
        constraint = post_author.key() == post.author
    )]
    pub post_author: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FollowUser<'info> {
    #[account(
        init,
        payer = follower,
        space = FollowRecord::SPACE,
        seeds = [b"follow", follower.key().as_ref(), target_user.key().as_ref()],
        bump
    )]
    pub follow_record: Account<'info, FollowRecord>,

    #[account(
        mut,
        seeds = [b"user_profile", follower.key().as_ref()],
        bump = follower_profile.bump
    )]
    pub follower_profile: Account<'info, UserProfile>,

    #[account(
        mut,
        seeds = [b"user_profile", target_user.key().as_ref()],
        bump = target_profile.bump
    )]
    pub target_profile: Account<'info, UserProfile>,

    #[account(mut)]
    pub follower: Signer<'info>,

    /// CHECK: Target user being followed
    pub target_user: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnfollowUser<'info> {
    #[account(
        mut,
        close = follower,
        seeds = [b"follow", follower.key().as_ref(), target_user.key().as_ref()],
        bump = follow_record.bump
    )]
    pub follow_record: Account<'info, FollowRecord>,

    #[account(
        mut,
        seeds = [b"user_profile", follower.key().as_ref()],
        bump = follower_profile.bump
    )]
    pub follower_profile: Account<'info, UserProfile>,

    #[account(
        mut,
        seeds = [b"user_profile", target_user.key().as_ref()],
        bump = target_profile.bump
    )]
    pub target_profile: Account<'info, UserProfile>,

    #[account(mut)]
    pub follower: Signer<'info>,

    /// CHECK: Target user being unfollowed
    pub target_user: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct EditPost<'info> {
    #[account(
        mut,
        seeds = [b"post", author.key().as_ref(), &post.post_id.to_le_bytes()],
        bump = post.bump,
        constraint = post.author == author.key()
    )]
    pub post: Account<'info, Post>,
    
    #[account(mut)]
    pub author: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeactivatePost<'info> {
    #[account(
        mut,
        seeds = [b"post", author.key().as_ref(), &post.post_id.to_le_bytes()],
        bump = post.bump,
        constraint = post.author == author.key()
    )]
    pub post: Account<'info, Post>,
    
    #[account(mut)]
    pub author: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateProfile<'info> {
    #[account(
        mut,
        seeds = [b"user_profile", user.key().as_ref()],
        bump = user_profile.bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    #[account(mut)]
    pub user: Signer<'info>,
}

// Accounts
#[account]
pub struct UserProfile {
    pub owner: Pubkey,
    pub username: String,
    pub post_count: u64,
    pub followers_count: u64,
    pub following_count: u64,
    pub total_tips_received: u64,
    pub total_tips_sent: u64,
    pub created_at: i64,
    pub bump: u8,
}

impl UserProfile {
    const SPACE: usize = 8 + 32 + (4 + 32) + 8 + 8 + 8 + 8 + 8 + 8 + 1;
}

#[account]
pub struct Post {
    pub author: Pubkey,
    pub content: String,
    pub image_url: Option<String>,
    pub tags: Vec<String>,
    pub timestamp: i64,
    pub tips_received: u64,
    pub tip_count: u64,
    pub post_id: u64,
    pub is_active: bool,
    pub bump: u8,
}

impl Post {
    const SPACE: usize = 8 + 32 + (4 + 280) + (1 + 4 + 200) + (4 + (5 * (4 + 32))) + 8 + 8 + 8 + 8 + 1 + 1;
}

#[account]
pub struct FollowRecord {
    pub follower: Pubkey,
    pub following: Pubkey,
    pub timestamp: i64,
    pub bump: u8,
}

impl FollowRecord {
    const SPACE: usize = 8 + 32 + 32 + 8 + 1;
}

// Errors
#[error_code]
pub enum SocialPlatformError {
    #[msg("Content exceeds 280 character limit")]
    ContentTooLong,
    #[msg("Content cannot be empty")]
    ContentEmpty,
    #[msg("Username exceeds 32 character limit")]
    UsernameTooLong,
    #[msg("Username cannot be empty")]
    UsernameEmpty,
    #[msg("Image URL exceeds 200 character limit")]
    ImageUrlTooLong,
    #[msg("Too many tags (maximum 5)")]
    TooManyTags,
    #[msg("Tag exceeds 32 character limit")]
    TagTooLong,
    #[msg("Invalid tip amount. Must be greater than 0")]
    InvalidTipAmount,
    #[msg("Tip amount too small. Minimum 1000 lamports")]
    TipTooSmall,
    #[msg("Cannot tip your own post")]
    CannotTipOwnPost,
    #[msg("Cannot follow yourself")]
    CannotFollowSelf,
    #[msg("Only the post author can modify this post")]
    UnauthorizedPostModification,
    #[msg("Post is not active")]
    PostNotActive,
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    #[msg("Arithmetic underflow")]
    ArithmeticUnderflow,
}

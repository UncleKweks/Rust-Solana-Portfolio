# Decentralized Social Platform

**Deployed Frontend URL:** [https://solsocial-rd1ooep2v-unclekweks-projects.vercel.app] <br>
**Solana Program ID:** `3fAf1f2xVmJxSuUkV9RXs8jkLLFUj51YDmS4DUjXao7Z`

---

## 📖 Project Overview

### Description
This project is a decentralized social platform built on Solana. Users create on-chain profiles, publish posts (with optional image URLs and tags), tip creators in SOL, and build social graphs via follow/unfollow. All actions are enforced by the on-chain program to ensure transparency, ownership, and censorship resistance.

The frontend is built with React + TypeScript + Tailwind and integrates Solana wallet adapters for a smooth experience on devnet.

---

## ✨ Key Features

- **User Profiles**: One profile per wallet with a validated username (≤ 32 chars).
- **Create Posts**: Text posts (≤ 280 chars) with optional image URL (≤ 200 chars) and up to 5 tags.
- **Tip Posts**: Send SOL tips (≥ 1000 lamports) to post authors via system transfer.
- **Follow/Unfollow**: On-chain follow records update follower/following counters.
- **Edit/Deactivate Posts**: Authors can edit content or deactivate posts.
- **Update Profile**: Change username with on-chain validation.

---

## 🚀 How to Use the dApp

1) **Connect Wallet**  
   Use Phantom/Solflare on devnet.

2) **Initialize Profile**  
   - Enter a username (≤ 32).  
   - The program creates your profile PDA and initializes counters.

3) **Create Post**  
   - Enter content (≤ 280), optional image URL (≤ 200), and up to 5 tags.  
   - A unique Post PDA is created tied to your wallet.

4) **Tip a Post**  
   - Choose amount ≥ 1000 lamports; SOL transfers to the post author.

5) **Follow / Unfollow**  
   - Follow creates a follow PDA and updates counters; unfollow closes it and decrements counters.

6) **Edit / Deactivate**  
   - Authors can edit their post content or deactivate a post.

7) **Update Profile**  
   - Optionally change your username with the same validation rules.

---

## 🏗️ Program Architecture

### PDA Usage
PDAs ensure deterministic ownership and uniqueness:

- **User Profile PDA**  
  - Seeds: `[b"user_profile", user_pubkey]`  
  - Purpose: One profile per wallet; stores profile metadata and counters.

- **Post PDA**  
  - Seeds: `[b"post", author_pubkey, user_profile.post_count]` (post_count at creation time)  
  - Purpose: Unique account per post tied to the author.

- **FollowRecord PDA**  
  - Seeds: `[b"follow", follower_pubkey, target_user_pubkey]`  
  - Purpose: Tracks follower → following relationship.

### Program Instructions

- `initialize_user(username: String)`
  - Creates the profile PDA. Validates username length and non-empty.

- `create_post(content: String, image_url: Option<String>, tags: Vec<String>)`
  - Creates a post PDA. Enforces content ≤ 280, image URL ≤ 200, ≤ 5 tags, tag ≤ 32.

- `tip_post(amount: u64)`
  - Requires amount ≥ 1000 lamports, disallows tipping own post, transfers SOL to author, updates `tips_received` and `tip_count`.

- `follow_user()` / `unfollow_user()`
  - Follow creates a follow record PDA; increments `followers_count`/`following_count`.
  - Unfollow closes the follow PDA and decrements counters.

- `edit_post(new_content, new_image_url)`
  - Only the author can edit; enforces content and image URL bounds.

- `deactivate_post()`
  - Marks a post inactive.

- `update_profile(new_username: Option<String>)`
  - Optionally updates username with same validations.

---

## 📂 Account Structure

```rust
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

#[account]
pub struct FollowRecord {
    pub follower: Pubkey,
    pub following: Pubkey,
    pub timestamp: i64,
    pub bump: u8,
}
```

---

## 🧪 Testing

### Test Coverage Ideas

Happy path:
- Initialize user with valid username.
- Create post with valid content, optional image URL, and tags.
- Tip a post with ≥ 1000 lamports by a non-author.
- Follow then unfollow another user; counters change correctly.
- Edit then deactivate a post by its author.
- Update profile username.

Unhappy path (should fail):
- Username empty or > 32 chars.
- Content empty or > 280 chars; image URL > 200; > 5 tags; tag > 32 chars.
- Tip amount 0 or < 1000 lamports; author tipping own post.
- Edit/deactivate by non-author; interactions with inactive posts.

### Running Tests

```bash
# Local validator
yarn install
anchor test

# Against devnet (requires funded keypair)
anchor test --provider.cluster devnet --skip-local-validator
```

---

## 🔗 Explorer & IDL

- Program (devnet): `https://explorer.solana.com/address/3fAf1f2xVmJxSuUkV9RXs8jkLLFUj51YDmS4DUjXao7Z?cluster=devnet`
- On-chain IDL (devnet): initialized so clients can fetch schema from chain.

---

## ℹ️ Additional Notes for Evaluators

- `require!` checks provide clear error semantics and prevent invalid state.
- PDAs leverage deterministic seeds to avoid collisions and enforce ownership.
- Minimum tipping threshold mitigates spam/dust transactions.



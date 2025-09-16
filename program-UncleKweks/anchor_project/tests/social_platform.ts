import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SocialPlatform } from "../target/types/social_platform";
import { assert, expect } from "chai";
import { Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

describe("social_platform", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SocialPlatform as Program<SocialPlatform>;

  let userKeypair: Keypair;
  let anotherUserKeypair: Keypair;
  let userProfilePda: PublicKey;
  let anotherUserProfilePda: PublicKey;
  let postPda: PublicKey;
  let followRecordPda: PublicKey;

  const username = "testuser";
  const anotherUsername = "anotheruser";
  const postContent = "Hello, Solana! This is my first post.";
  const imageUrl = "https://example.com/image.jpg";
  const tags = ["solana", "blockchain", "test"];

  before(async () => {
    userKeypair = Keypair.generate();
    anotherUserKeypair = Keypair.generate();

    await provider.connection.requestAirdrop(userKeypair.publicKey, 2 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(anotherUserKeypair.publicKey, 2 * LAMPORTS_PER_SOL);
    await new Promise(resolve => setTimeout(resolve, 1000));

    [userProfilePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), userKeypair.publicKey.toBuffer()],
      program.programId
    );

    [anotherUserProfilePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), anotherUserKeypair.publicKey.toBuffer()],
      program.programId
    );
  });

  describe("initialize_user", () => {
    it("Successfully initializes a user profile", async () => {
      const tx = await program.methods
        .initializeUser(username)
        .accounts({ user: userKeypair.publicKey })
        .signers([userKeypair])
        .rpc();

      console.log("Initialize user tx:", tx);

      const userProfile = await program.account.userProfile.fetch(userProfilePda);
      assert.equal(userProfile.username, username);
      assert.equal(userProfile.owner.toString(), userKeypair.publicKey.toString());
      assert.equal(userProfile.postCount.toString(), "0");
      assert.equal(userProfile.followersCount.toString(), "0");
      assert.equal(userProfile.followingCount.toString(), "0");
    });

    it("Fails with username too long", async () => {
      const longUsername = "a".repeat(33);
      const tempKeypair = Keypair.generate();
      await provider.connection.requestAirdrop(tempKeypair.publicKey, LAMPORTS_PER_SOL);
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        await program.methods
          .initializeUser(longUsername)
          .accounts({ user: tempKeypair.publicKey })
          .signers([tempKeypair])
          .rpc();
        assert.fail("Should have failed with username too long");
      } catch (error: any) {
        console.log("Username too long error:", error);
        // Check for various error formats
        const errorStr = JSON.stringify(error);
        const hasError = errorStr.includes("UsernameTooLong") ||
          errorStr.includes("6000") ||
          error?.error?.errorCode?.number === 6000 ||
          error?.error?.errorCode?.code === "UsernameTooLong";
        expect(hasError, `Expected UsernameTooLong error, got: ${errorStr}`).to.be.true;
      }
    });

    it("Fails with empty username", async () => {
      const tempKeypair = Keypair.generate();
      await provider.connection.requestAirdrop(tempKeypair.publicKey, LAMPORTS_PER_SOL);
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        await program.methods
          .initializeUser("")
          .accounts({ user: tempKeypair.publicKey })
          .signers([tempKeypair])
          .rpc();
        assert.fail("Should have failed with empty username");
      } catch (error: any) {
        console.log("Empty username error:", error);
        const errorStr = JSON.stringify(error);
        const hasError = errorStr.includes("UsernameEmpty") ||
          errorStr.includes("6001") ||
          error?.error?.errorCode?.number === 6001 ||
          error?.error?.errorCode?.code === "UsernameEmpty";
        expect(hasError, `Expected UsernameEmpty error, got: ${errorStr}`).to.be.true;
      }
    });

    it("Initializes another user for follow/tip tests", async () => {
      await program.methods
        .initializeUser(anotherUsername)
        .accounts({ user: anotherUserKeypair.publicKey })
        .signers([anotherUserKeypair])
        .rpc();
    });
  });

  describe("create_post", () => {
    it("Successfully creates a post", async () => {
      [postPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("post"), userKeypair.publicKey.toBuffer(), Buffer.from([0, 0, 0, 0, 0, 0, 0, 0])],
        program.programId
      );

      const tx = await program.methods
        .createPost(postContent, imageUrl, tags)
        .accounts({ author: userKeypair.publicKey })
        .signers([userKeypair])
        .rpc();

      console.log("Create post tx:", tx);

      const post = await program.account.post.fetch(postPda);
      assert.equal(post.content, postContent);
      assert.equal(post.imageUrl, imageUrl);
      assert.deepEqual(post.tags, tags);
      assert.equal(post.author.toString(), userKeypair.publicKey.toString());
      assert.equal(post.postId.toString(), "0");
      assert.equal(post.isActive, true);

      const userProfile = await program.account.userProfile.fetch(userProfilePda);
      assert.equal(userProfile.postCount.toString(), "1");
    });
  });

  describe("tip_post", () => {
    it("Successfully tips a post", async () => {
      const tipAmount = 5000;

      const userBalanceBefore = await provider.connection.getBalance(userKeypair.publicKey);
      const anotherUserBalanceBefore = await provider.connection.getBalance(anotherUserKeypair.publicKey);

      const tx = await program.methods
        .tipPost(new anchor.BN(tipAmount))
        .accounts({
          post: postPda,
          tipper: anotherUserKeypair.publicKey,
          postAuthor: userKeypair.publicKey,
        })
        .signers([anotherUserKeypair])
        .rpc();

      console.log("Tip post tx:", tx);

      const post = await program.account.post.fetch(postPda);
      expect(post.tipsReceived.toString()).to.equal(tipAmount.toString());
      expect(post.tipCount.toString()).to.equal("1");

      const userBalanceAfter = await provider.connection.getBalance(userKeypair.publicKey);
      const anotherUserBalanceAfter = await provider.connection.getBalance(anotherUserKeypair.publicKey);

      // Check that the post author received the tip
      expect(userBalanceAfter - userBalanceBefore).to.equal(tipAmount);
      // Check that the tipper paid the tip plus transaction fees
      expect(anotherUserBalanceBefore - anotherUserBalanceAfter).to.be.greaterThanOrEqual(tipAmount);
    });

    it("Fails when trying to tip own post", async () => {
      try {
        await program.methods
          .tipPost(new anchor.BN(5000))
          .accounts({
            post: postPda,
            tipper: userKeypair.publicKey,
            postAuthor: userKeypair.publicKey,
          })
          .signers([userKeypair])
          .rpc();

        assert.fail("Should have failed when tipping own post");
      } catch (error: any) {
        console.log("Tip own post error:", error);
        const errorStr = JSON.stringify(error);
        const hasError = errorStr.includes("CannotTipOwnPost") ||
          errorStr.includes("6002") ||
          error?.error?.errorCode?.number === 6002 ||
          error?.error?.errorCode?.code === "CannotTipOwnPost";
        expect(hasError, `Expected CannotTipOwnPost error, got: ${errorStr}`).to.be.true;
      }
    });

    it("Fails with tip amount too small", async () => {
      try {
        await program.methods
          .tipPost(new anchor.BN(500))
          .accounts({
            post: postPda,
            tipper: anotherUserKeypair.publicKey,
            postAuthor: userKeypair.publicKey,
          })
          .signers([anotherUserKeypair])
          .rpc();

        assert.fail("Should have failed with tip too small");
      } catch (error: any) {
        console.log("Tip too small error:", error);
        const errorStr = JSON.stringify(error);
        const hasError = errorStr.includes("TipTooSmall") ||
          errorStr.includes("6003") ||
          error?.error?.errorCode?.number === 6003 ||
          error?.error?.errorCode?.code === "TipTooSmall";
        expect(hasError, `Expected TipTooSmall error, got: ${errorStr}`).to.be.true;
      }
    });

    it("Fails with zero tip amount", async () => {
      try {
        await program.methods
          .tipPost(new anchor.BN(0))
          .accounts({
            post: postPda,
            tipper: anotherUserKeypair.publicKey,
            postAuthor: userKeypair.publicKey,
          })
          .signers([anotherUserKeypair])
          .rpc();

        assert.fail("Should have failed with zero tip amount");
      } catch (error: any) {
        console.log("Zero tip error:", error);
        const errorStr = JSON.stringify(error);
        const hasError = errorStr.includes("InvalidTipAmount") ||
          errorStr.includes("6004") ||
          error?.error?.errorCode?.number === 6004 ||
          error?.error?.errorCode?.code === "InvalidTipAmount";
        expect(hasError, `Expected InvalidTipAmount error, got: ${errorStr}`).to.be.true;
      }
    });
  });

  describe("follow_user", () => {
    it("Successfully follows a user", async () => {
      [followRecordPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("follow"), anotherUserKeypair.publicKey.toBuffer(), userKeypair.publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .followUser()
        .accounts({
          follower: anotherUserKeypair.publicKey,
          targetUser: userKeypair.publicKey,
        })
        .signers([anotherUserKeypair])
        .rpc();

      console.log("Follow user tx:", tx);

      const followRecord = await program.account.followRecord.fetch(followRecordPda);
      assert.equal(followRecord.follower.toString(), anotherUserKeypair.publicKey.toString());
      assert.equal(followRecord.following.toString(), userKeypair.publicKey.toString());
    });
  });

  describe("unfollow_user", () => {
    it("Successfully unfollows a user", async () => {
      const tx = await program.methods
        .unfollowUser()
        .accounts({
          follower: anotherUserKeypair.publicKey,
          targetUser: userKeypair.publicKey,
        })
        .signers([anotherUserKeypair])
        .rpc();

      console.log("Unfollow user tx:", tx);

      try {
        await program.account.followRecord.fetch(followRecordPda);
        assert.fail("Follow record should have been closed");
      } catch (_) {
        // expected
      }
    });
  });

  describe("edit_post", () => {
    it("Successfully edits a post", async () => {
      const newContent = "Edited content";
      const newImageUrl = "https://example.com/new-image.jpg";

      const tx = await program.methods
        .editPost(newContent, newImageUrl)
        .accountsStrict({ author: userKeypair.publicKey, post: postPda })
        .signers([userKeypair])
        .rpc();

      console.log("Edit post tx:", tx);

      const post = await program.account.post.fetch(postPda);
      assert.equal(post.content, newContent);
      assert.equal(post.imageUrl, newImageUrl);
    });

    it("Fails when non-author tries to edit", async () => {
      try {
        await program.methods
          .editPost("Hack attempt", "https://evil.com")
          .accountsStrict({ author: anotherUserKeypair.publicKey, post: postPda })
          .signers([anotherUserKeypair])
          .rpc();
        assert.fail("Should have failed when non-author tries to edit");
      } catch (error: any) {
        console.log("Unauthorized edit error:", error);
        const errorStr = JSON.stringify(error);
        // The program uses seeds constraints to validate the author, so we expect ConstraintSeeds error
        const hasError = errorStr.includes("ConstraintSeeds") ||
          errorStr.includes("2006") ||
          error?.error?.errorCode?.number === 2006 ||
          error?.error?.errorCode?.code === "ConstraintSeeds" ||
          // Also check for the custom UnauthorizedEdit error in case it's implemented
          errorStr.includes("UnauthorizedEdit") ||
          errorStr.includes("6005") ||
          error?.error?.errorCode?.number === 6005 ||
          error?.error?.errorCode?.code === "UnauthorizedEdit";
        expect(hasError, `Expected ConstraintSeeds or UnauthorizedEdit error, got: ${errorStr}`).to.be.true;
      }
    });
  });

  describe("deactivate_post", () => {
    it("Successfully deactivates a post", async () => {
      const tx = await program.methods
        .deactivatePost()
        .accountsStrict({ author: userKeypair.publicKey, post: postPda })
        .signers([userKeypair])
        .rpc();

      console.log("Deactivate post tx:", tx);

      const post = await program.account.post.fetch(postPda);
      assert.equal(post.isActive, false);
    });

    it("Fails when trying to tip deactivated post", async () => {
      try {
        await program.methods
          .tipPost(new anchor.BN(5000))
          .accounts({
            post: postPda,
            tipper: anotherUserKeypair.publicKey,
            postAuthor: userKeypair.publicKey,
          })
          .signers([anotherUserKeypair])
          .rpc();

        assert.fail("Should have failed when tipping deactivated post");
      } catch (error: any) {
        console.log("Tip deactivated post error:", error);
        const errorStr = JSON.stringify(error);
        const hasError = errorStr.includes("PostNotActive") ||
          errorStr.includes("6006") ||
          error?.error?.errorCode?.number === 6006 ||
          error?.error?.errorCode?.code === "PostNotActive";
        expect(hasError, `Expected PostNotActive error, got: ${errorStr}`).to.be.true;
      }
    });
  });

  describe("update_profile", () => {
    it("Successfully updates username", async () => {
      const newUsername = "updateduser";

      const tx = await program.methods
        .updateProfile(newUsername)
        .accounts({ user: userKeypair.publicKey })
        .signers([userKeypair])
        .rpc();

      console.log("Update profile tx:", tx);

      const userProfile = await program.account.userProfile.fetch(userProfilePda);
      assert.equal(userProfile.username, newUsername);
    });

    it("Fails with username too long", async () => {
      const longUsername = "b".repeat(40);
      try {
        await program.methods
          .updateProfile(longUsername)
          .accounts({ user: userKeypair.publicKey })
          .signers([userKeypair])
          .rpc();
        assert.fail("Should have failed with username too long");
      } catch (error: any) {
        console.log("Update profile username too long error:", error);
        const errorStr = JSON.stringify(error);
        const hasError = errorStr.includes("UsernameTooLong") ||
          errorStr.includes("6000") ||
          error?.error?.errorCode?.number === 6000 ||
          error?.error?.errorCode?.code === "UsernameTooLong";
        expect(hasError, `Expected UsernameTooLong error, got: ${errorStr}`).to.be.true;
      }
    });
  });
});
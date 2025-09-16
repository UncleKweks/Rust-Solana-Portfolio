import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton, useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { useSocialPlatform, PostWithMetadata } from "./hooks/useSocialPlatform";

// Components
import Navbar from "./components/Navbar";
import Landing from "./components/Landing";
import ProfileCard from "./components/ProfileCard";
import Composer from "./components/Composer";
import PostItem from "./components/PostItem";
import TransactionHistory from "./components/TransactionHistory";

export default function App() {
  const { publicKey, connected, connecting, disconnecting } = useWallet();
  const { setVisible } = useWalletModal();

  const {
    userProfile,
    userPosts,
    allPosts,
    loading,
    error,
    userBalance,
    transactions,
    initializeUser,
    createPost,
    tipPost,
    deletePost,
    fetchAllPosts,
    checkUserProfile,
    getUserBalance,
    lamportsToSol
  } = useSocialPlatform();

  const [newPost, setNewPost] = useState("");
  const [newImage, setNewImage] = useState("");
  const [notification, setNotification] = useState("");
  const [needsProfileInit, setNeedsProfileInit] = useState(false);

  // Debug wallet state for Windows compatibility
  useEffect(() => {
    console.log("Wallet state:", {
      connected,
      connecting,
      disconnecting,
      publicKey: publicKey?.toBase58(),
      userAgent: navigator.userAgent,
      platform: navigator.platform
    });
  }, [connected, connecting, disconnecting, publicKey]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleConnect = () => {
    console.log("Attempting to connect wallet...");
    try {
      setVisible(true);
    } catch (error) {
      console.error("Error opening wallet modal:", error);
      showNotification("❌ Failed to open wallet modal. Please check if you have a Solana wallet installed.");
    }
  };

  // Check if user needs profile initialization
  useEffect(() => {
    const checkProfile = async () => {
      if (publicKey) {
        try {
          const hasProfile = await checkUserProfile();
          setNeedsProfileInit(!hasProfile);
        } catch (err) {
          console.error("Profile check error:", err);
          setNeedsProfileInit(false);
        }
      }
    };

    if (publicKey && connected) {
      checkProfile();
    }
  }, [publicKey, connected, checkUserProfile]);

  // Load all posts on mount
  useEffect(() => {
    if (connected && publicKey) {
      fetchAllPosts();
    }
  }, [connected, publicKey, fetchAllPosts]);

  const handleInitializeUser = async () => {
    try {
      await initializeUser();
      setNeedsProfileInit(false);
      showNotification("✅ Profile initialized!");
    } catch (err) {
      showNotification(`❌ ${(err as Error).message}`);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) {
      showNotification("❌ Post cannot be empty!");
      return;
    }

    try {
      // Clear the form first to prevent issues
      const postContent = newPost;
      const postImage = newImage;
      setNewPost("");
      setNewImage("");

      await createPost(postContent, postImage || undefined);
      showNotification("✅ Post created!");

      // Refresh posts after successful creation
      await fetchAllPosts();
    } catch (err) {
      // Restore the form content if posting failed
      setNewPost(newPost);
      setNewImage(newImage);
      showNotification(`❌ ${(err as Error).message}`);
    }
  };

  const handleTipPost = async (authorPublicKey: PublicKey, postId: number) => {
    try {
      await tipPost(authorPublicKey, postId, 0.01);
      showNotification("💸 Tipped 0.01 SOL!");
      fetchAllPosts();
    } catch (err) {
      showNotification(`❌ ${(err as Error).message}`);
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await deletePost(postId);
      showNotification("✅ Post deleted!");
      fetchAllPosts();
    } catch (err) {
      showNotification(`❌ ${(err as Error).message}`);
    }
  };

  // Show error notifications
  useEffect(() => {
    if (error) {
      showNotification(`❌ ${error}`);
    }
  }, [error]);

  const containerClass = connected
    ? "min-h-screen w-screen bg-gray-50 text-gray-900 p-6"
    : "min-h-screen w-screen bg-gradient-to-br from-purple-600 to-indigo-800 text-white p-6";

  // Show loading state while connecting
  if (connecting) {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-purple-600 to-indigo-800 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <h1 className="text-2xl font-bold">Connecting to Phantom...</h1>
          <p className="text-purple-200">Please approve the connection in your wallet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {/* Notifications */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 p-3 bg-green-500 text-white rounded-lg shadow-lg animate-bounce">
          {notification}
        </div>
      )}

      {!connected ? (
        <Landing onConnect={handleConnect} />
      ) : needsProfileInit ? (
        <>
          <Navbar
            address={`${publicKey?.toBase58().slice(0, 4)}...${publicKey?.toBase58().slice(-4)}`}
          />
          <div className="bg-white p-6 rounded-xl max-w-md mx-auto">
            <h2 className="text-xl mb-4 text-gray-800">Initialize Your Profile</h2>
            <p className="text-gray-600 mb-4">
              Welcome to Solana Social! Click below to initialize your profile on the blockchain.
            </p>
            <button
              onClick={handleInitializeUser}
              disabled={loading}
              className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? "Initializing..." : "Initialize Profile"}
            </button>
          </div>
        </>
      ) : (
        <>
          <Navbar
            address={`${publicKey?.toBase58().slice(0, 4)}...${publicKey?.toBase58().slice(-4)}`}
          />

          {/* Profile Section */}
          <ProfileCard
            username={userProfile?.username}
            addressShort={`${publicKey?.toBase58().slice(0, 6)}...${publicKey?.toBase58().slice(-4)}`}
            followers={userProfile?.followers || 0}
            following={userProfile?.following || 0}
            postsCount={userPosts.length}
            balance={userBalance}
            loading={loading}
            totalEarned={userProfile?.totalEarned || 0}
          />

          {/* Transaction History */}
          <TransactionHistory
            transactions={transactions}
            loading={loading}
          />

          {/* Post Creator */}
          <Composer
            newPost={newPost}
            setNewPost={setNewPost}
            newImage={newImage}
            setNewImage={setNewImage}
            onPost={handleCreatePost}
            loading={loading}
          />

          {/* Feed */}
          <div className="space-y-4">
            {allPosts.map((post) => (
              <PostItem
                key={`${post.author.toBase58()}-${post.postId}`}
                post={post}
                onTip={() => handleTipPost(post.author, post.postId)}
                onDelete={
                  post.author.equals(publicKey!)
                    ? () => handleDeletePost(post.postId)
                    : undefined
                }
                loading={loading}
                canDelete={post.author.equals(publicKey!)}
              />
            ))}
            {allPosts.length === 0 && !loading && (
              <div className="text-center text-gray-500 py-8">
                No posts yet. Be the first to share something!
              </div>
            )}
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
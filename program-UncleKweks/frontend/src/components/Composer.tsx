import React from "react";

type Props = {
    newPost: string;
    setNewPost: (value: string) => void;
    newImage: string;
    setNewImage: (value: string) => void;
    onPost: () => void;
    loading: boolean;
};

export default function Composer({
    newPost,
    setNewPost,
    newImage,
    setNewImage,
    onPost,
    loading
}: Props) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows={3}
            />
            <div className="mt-3 flex gap-3">
                <input
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="Image URL (optional)"
                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                    onClick={onPost}
                    disabled={loading || !newPost.trim()}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Posting..." : "Post"}
                </button>
            </div>
        </div>
    );
}




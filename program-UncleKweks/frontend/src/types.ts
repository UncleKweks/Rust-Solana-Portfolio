export type Post = {
    id: number;
    content: string;
    image: string;
    tags: string[];
    active: boolean;
    tips: number;
};

export type Profile = {
    username: string;
    followers: number;
    following: number;
};




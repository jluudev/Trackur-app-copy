export interface Post {
  id: number;
  picture: string;
  caption: string;
  latitude: number;
  longitude: number;
  userId: number;
  animalName: string;
  timestamp: string;
  user: User;
  likedBy: { userId: number }[];
  comments: { id: string, username: string, comment: string, timestamp: string }[];
}

export interface Comment {
  id: number;
  comment: string;
  like_count: number;
  postId: number;
  userId: number;
  timestamp: string;
}

export interface User {
  id: number;
  username: string;
  profile_picture: string;
  post_like_count : number;
}

export interface Animal {
  name: string;
}
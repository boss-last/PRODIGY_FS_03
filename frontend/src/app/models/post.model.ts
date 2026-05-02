import { User } from './user.model';

export interface Post {
  id: number;
  content: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video';
  tags?: string;
  likesCount: number;
  userId: number;
  user: Partial<User>;
  comments?: Comment[];
  likedBy?: any[];
  createdAt: string;
}

export interface Comment {
  id: number;
  content: string;
  postId: number;
  userId: number;
  user: { username: string };
  createdAt: string;
}

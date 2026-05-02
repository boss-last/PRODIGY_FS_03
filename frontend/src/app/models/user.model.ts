export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  bio?: string;
  profilePicture?: string;
  role: 'user' | 'admin';
  token?: string;
}

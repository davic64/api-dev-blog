export interface User {
  id: number;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  profile: Profile;
}

export interface Profile {
  id: number;
  bio: string;
  avatarUrl: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

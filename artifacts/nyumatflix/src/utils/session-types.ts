export interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface Session {
  user?: SessionUser;
  expires?: string;
}

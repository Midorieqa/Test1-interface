export interface User {
  id: string;
  email: string;
  username: string;
  superuser: boolean;
  configuration: Record<string, any>;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, username: string) => Promise<void>;
  updateUserConfig: (config: Record<string, any>) => Promise<void>;
}

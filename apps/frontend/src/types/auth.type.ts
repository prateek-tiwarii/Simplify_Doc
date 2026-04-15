export interface AuthState {
  error?: string;
  message: string;
}

export interface AuthFormData {
  email: string;
  password: string;
}

export interface SignupFormData extends AuthFormData {
  name: string;
  imageSrc?: string;
}
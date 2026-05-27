export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'requester' | 'validator';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface VacationRequest {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: RequestStatus;
  comments: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  user?: User;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

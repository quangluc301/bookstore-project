export type BookType = {
  id: string;
  title: string;
  author: string;
  category?: string | null;
  format?: string | null;
  publisher?: string | null;
  publication_year?: number | null;
  description?: string | null;
  images?: { id: string; url: string; sort_order: number }[];
  price: number;
  stock: number;
  is_active?: boolean;
  created_at?: string;
};

export type UserType = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at?: string;
};

export type OrderType = {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  recipient_name?: string;
  phone?: string;
  address?: string;
  items?: OrderItemType[];
  user?: Pick<UserType, 'id' | 'email' | 'full_name'>;
  created_at?: string;
};

export type OrderItemType = {
  id: string;
  book_id: string | null;
  title: string;
  quantity: number;
  unit_price: number;
};

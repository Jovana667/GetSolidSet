export interface JWTPayload {
  id: number;
  email: string;
}

export interface Food {
  id: number;
  name: string;
  category: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  serving_size: number;
  created_at: Date;
  is_custom: boolean;
  created_by: number | null;
}

export interface FoodQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

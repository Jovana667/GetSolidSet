export interface JWTPayload {
  id: number;
  email: string;
}
export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface GetProfileResponse {
  name?: string;
  email: string;
  role: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
}

export interface CreateNutritionGoalRequest {
  target_calories?: number;
  target_protein_g?: number;
  target_fat_g?: number;
  target_carbs_g?: number;
  dietary_restrictions?: string;
}

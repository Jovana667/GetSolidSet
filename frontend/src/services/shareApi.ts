import axios from "axios";
import { mealApi } from "./api";

export const generateShareLink = async (mealPlanId: number): Promise<string> => {
  const response = await axios.post(    
    `${import.meta.env.VITE_MEAL_API_URL}/meals/plans/${mealPlanId}/share`,
        { },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
  return response.data.token;
};
 
// Revoke an existing share link
export const revokeShareLink = async (mealPlanId: number): Promise<void> => {
  await axios.delete(`${import.meta.env.VITE_MEAL_API_URL}/meals/plans/${mealPlanId}/share`);
};
 
// Public — fetch a meal plan via share token (no auth header needed)
export const getSharedMealPlan = async (token: string): Promise<any> => {
  const response = await axios.get(
    `${import.meta.env.VITE_MEAL_API_URL}/meals/share/${token}`
  );
  return response.data;
};
 
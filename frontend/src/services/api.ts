import axios from "axios";

// Create an instance with base configuration
const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const mealApi = axios.create({
  baseURL: import.meta.env.VITE_MEAL_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const foodApi = axios.create({
  baseURL: import.meta.env.VITE_FOOD_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const userApi = axios.create({
  baseURL: import.meta.env.VITE_USER_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to automatically add token to requests
const addTokenInterceptor = (apiInstance: any) => {
  apiInstance.interceptors.request.use((config: any) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

// Apply interceptor to all instances that need authentication
addTokenInterceptor(userApi);
addTokenInterceptor(mealApi);
addTokenInterceptor(foodApi);
// authApi doesn't need it (login/register don't require tokens)

// Authentication
export const login = async (email: string, password: string) => {
  const response = await authApi.post("/login", { email, password });
  return response.data;
};

export const register = async (email: string, role: 'trainer' | 'client', password: string) => {
  const response = await authApi.post("/register", { email, role, password });
  return response.data;
};

// profile
export const getUserProfile = async () => {
  const response = await userApi.get("/profile");
  return response.data;
};

export const updateUserProfile = async (profileData: any) => {
  const response = await userApi.put("/profile", profileData);
  return response.data;
};

// Trainer client management
export const getClients = async () => {
  const response = await userApi.get("/users/clients");
  return response.data;
};

export const addClient = async (email: string, name: string) => {
  const response = await userApi.post("/users/clients", { email, name });
  return response.data;
};

export const getClientMeals = async (trainerClientId: string) => {
  const response = await mealApi.get(`/meals/plans/client/${trainerClientId}`);
  return response.data;
};

export const removeClient = async (trainerClientId: string) => {
  const response = await userApi.delete(`/users/clients/${trainerClientId}`);
  return response.data;
}

// retrieve assigned meals from trainers
export const getAssignedMeals = async () => {
  const response = await mealApi.get("/meals/plans/assigned");
  return response.data;
};

// meals
export const getMeals = async () => {
  const response = await mealApi.get("/meals");
  return response.data;
};

export const createMeal = async (mealData: any) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found. Please log in again.");
  }

  try {
    const response = await mealApi.post("/meals", mealData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw new Error("Session expired. Please log in again.");
    }
    throw error;
  }
};

export const getMealById = async (mealId: number) => {
  const response = await mealApi.get(`/meals/${mealId}`);
  return response.data;
};

// Foods
export const getFoods = async (params?: {
  category?: string;
  search?: string;
  pageSize?: number;
}) => {
  const response = await foodApi.get("/api/foods", {
    params: { pageSize: 100, ...params },
  });
  return response.data;
};

export const searchFoods = async (query: string) => {
  const response = await foodApi.get("/api/foods/search", {
    params: { q: query },
  });
  return response.data;
};

export const createCustomFood = async (foodData: {
  name: string;
  category: string;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
  calories_per_100g: number;
}) => {
  const response = await foodApi.post("/api/foods/custom", foodData);
  return response.data;
};

export const updateCustomFood = async (id: number, foodData: {
  name: string;
  category: string;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
  calories_per_100g: number;
}) => {
  const response = await foodApi.put(`/api/foods/custom/${id}`, foodData);
  return response.data;
};

export const deleteCustomFood = async (id: number) => {
  const response = await foodApi.delete(`/api/foods/custom/${id}`);
  return response.data;
};

  export const addFoodToMeal = async (mealId: number, foodData: {
    food_id: number;
    servings: number;
  }) => {
    const response = await mealApi.post(`/meals/${mealId}/foods`, foodData);
    return response.data;
  };

export const updateFoodServing = async (mealId: number, mealFoodId: number, servings: number) => {
  const response = await mealApi.put(`/meals/${mealId}/foods/${mealFoodId}`, { servings });
  return response.data;
};  

export const removeFoodFromMeal = async (mealId: number, mealFoodId: number) => {
  const response = await mealApi.delete(`/meals/${mealId}/foods/${mealFoodId}`);
  return response.data;
};

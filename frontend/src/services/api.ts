import axios from "axios";

// Create an instance with base configuration
const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
    withCredentials: true,
});

export const mealApi = axios.create({
  baseURL: import.meta.env.VITE_MEAL_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
    withCredentials: true,
});

const foodApi = axios.create({
  baseURL: import.meta.env.VITE_FOOD_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
    withCredentials: true,
});

const userApi = axios.create({
  baseURL: import.meta.env.VITE_USER_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
    withCredentials: true,
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

// Add refresh token function
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token");
  
  const response = await axios.post(
    `${import.meta.env.VITE_AUTH_API_URL}/refresh`,
    { refreshToken }
  );
  
  localStorage.setItem("token", response.data.token);
  return response.data.token;
};

// Add response interceptor to handle token expiry
const addRefreshInterceptor = (apiInstance: any) => {
  apiInstance.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiInstance(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("role");
          localStorage.removeItem("user");

          // Only redirect to login if on a protected page
          const publicPaths = ["/", "/login", "/register", "/reset-password", "/privacy", "/terms"];
          const isPublic = publicPaths.includes(window.location.pathname) ||
            window.location.pathname.startsWith("/share/");

          if (!isPublic) {
            window.location.href = "/login";
          }

          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};

// Apply to all instances
addRefreshInterceptor(userApi);
addRefreshInterceptor(mealApi);
addRefreshInterceptor(foodApi);
addRefreshInterceptor(authApi);


// Apply interceptor to all instances that need authentication
addTokenInterceptor(userApi);
addTokenInterceptor(mealApi);
addTokenInterceptor(foodApi);
addTokenInterceptor(authApi);


// Authentication
export const login = async (email: string, password: string) => {
  const response = await authApi.post("/login", { email, password });
  return response.data;
};

export const register = async (
  name: string,
  email: string,
  role: "trainer" | "client",
  password: string,
) => {
  const response = await authApi.post("/register", {
    name,
    email,
    role,
    password,
  });
  return response.data;
};

// profile
export const getUserProfile = async () => {
  const response = await userApi.get("/users/profile");
  return response.data;
};

export const updateUserProfile = async (profileData: any) => {
  const response = await userApi.put("/users/profile", profileData);
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await authApi.post("/forgot-password", { email });
  return response.data;
};

export const verifyOTP = async (email: string, otp: string) => {
  const response = await authApi.post("/verify-otp", { email, otp });
  return response.data;
};

export const resetPassword = async (email: string, newPassword: string) => {
  const response = await authApi.post("/reset-password", {
    email,
    newPassword,
  });
  return response.data;
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const response = await authApi.post("/change-password", { currentPassword, newPassword });
  return response.data;
};

export const logoutUser = async (refreshToken: string) => {
  const response = await authApi.post("/logout", { refreshToken });
  return response.data;
};

export const deleteUserProfile = async () => {
  const response = await userApi.delete("/users/profile");
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
};

export const linkClient = async (trainerClientId: string, email: string) => {
  const response = await userApi.put(`/users/clients/${trainerClientId}/link`, {
    email,
  });
  return response.data;
};

// skin fold managemnent
export const getSkinFolds = async (trainerClientId: string) => {
  const response = await userApi.get(
    `/users/clients/${trainerClientId}/skin-folds`,
  );
  return response.data;
};

export const createSkinFold = async (
  trainerClientId: string,
  skinFoldData: any,
) => {
  const response = await userApi.post(
    `/users/clients/${trainerClientId}/skin-folds`,
    skinFoldData,
  );
  return response.data;
};

export const updateSkinFold = async (
  trainerClientId: string,
  skinFoldId: number,
  skinFoldData: any,
) => {
  const response = await userApi.put(
    `/users/clients/${trainerClientId}/skin-folds/${skinFoldId}`,
    skinFoldData,
  );
  return response.data;
};

// client note management
export const getClientNotes = async (trainerClientId: string) => {
  const response = await userApi.get(`/users/clients/${trainerClientId}/notes`);
  return response.data;
};

export const createClientNote = async (
  trainerClientId: string,
  noteData: { note: string },
) => {
  const response = await userApi.post(
    `/users/clients/${trainerClientId}/notes`,
    noteData,
  );
  return response.data;
};

export const deleteClientNote = async (
  trainerClientId: string,
  noteId: number,
) => {
  const response = await userApi.delete(
    `/users/clients/${trainerClientId}/notes/${noteId}`,
  );
  return response.data;
};

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
  const response = await mealApi.post("/meals", mealData);
  return response.data;
};

export const getMealById = async (mealId: number) => {
  const response = await mealApi.get(`/meals/${mealId}`);
  return response.data;
};

export const deleteMeal = async (mealId: number) => {
  const response = await mealApi.delete(`/meals/plans/${mealId}`);
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

export const updateCustomFood = async (
  id: number,
  foodData: {
    name: string;
    category: string;
    protein_per_100g: number;
    fat_per_100g: number;
    carbs_per_100g: number;
    calories_per_100g: number;
  },
) => {
  const response = await foodApi.put(`/api/foods/custom/${id}`, foodData);
  return response.data;
};

export const deleteCustomFood = async (id: number) => {
  const response = await foodApi.delete(`/api/foods/custom/${id}`);
  return response.data;
};

export const addFoodToMeal = async (
  mealId: number,
  foodData: {
    food_id: number;
    servings: number;
  },
) => {
  const response = await mealApi.post(`/meals/${mealId}/foods`, foodData);
  return response.data;
};

export const updateFoodServing = async (
  mealId: number,
  mealFoodId: number,
  quantity_g: number,
) => {
  const response = await mealApi.put(`/meals/${mealId}/foods/${mealFoodId}`, {
    quantity_g,
  });
  return response.data;
};

export const removeFoodFromMeal = async (
  mealId: number,
  mealFoodId: number,
) => {
  const response = await mealApi.delete(`/meals/${mealId}/foods/${mealFoodId}`);
  return response.data;
};

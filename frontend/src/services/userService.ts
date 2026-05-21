import api from "./api";

export const userService = {
  async getUserDetails() {
    const res = await api.get("/user");
    return res.data;
  },
  async updateUserDetails(data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    age?: string | number;
  }) {
    const res = await api.put("/user", data);
    return res.data;
  },
  async getUserListings() {
    const res = await api.get("/user/listings");
    return res.data;
  },
  async getUserReviews() {
    const res = await api.get("/user/reviews");
    return res.data;
  },
  async getUserSaved() {
    const res = await api.get("/user/saved");
    return res.data;
  },
  async getUserOrders() {
    const res = await api.get("/orders");
    return res.data;
  },
};

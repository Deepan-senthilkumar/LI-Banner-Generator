// backend/controllers/authController.js

export const login = async (req, res) => {
  // TODO: Validate input
  // TODO: Check DB for user
  // TODO: Compare password hash
  // TODO: Generate JWT
  res.status(501).json({ message: "Not implemented yet" });
};

export const register = async (req, res) => {
  // TODO: Validate input
  // TODO: Hash password
  // TODO: Create user in DB
  res.status(501).json({ message: "Not implemented yet" });
};

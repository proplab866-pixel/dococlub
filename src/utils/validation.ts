// Email validation
export const validateEmail = (
  email: string
): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  return { isValid: true };
};

// Password validation
export const validatePassword = (
  password: string
): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: "Password must be at least 6 characters long",
    };
  }

  return { isValid: true };
};

// Confirm password validation
export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): { isValid: boolean; error?: string } => {
  if (!confirmPassword) {
    return { isValid: false, error: "Please confirm your password" };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }

  return { isValid: true };
};

// Name validation
export const validateName = (
  name: string
): { isValid: boolean; error?: string } => {
  if (!name) {
    return { isValid: false, error: "Name is required" };
  }

  if (name.length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters long" };
  }

  if (name.length > 50) {
    return { isValid: false, error: "Name must be less than 50 characters" };
  }

  return { isValid: true };
};

// OTP validation
export const validateOTP = (
  otp: string
): { isValid: boolean; error?: string } => {
  if (!otp) {
    return { isValid: false, error: "OTP is required" };
  }

  if (otp.length !== 6) {
    return { isValid: false, error: "OTP must be 6 digits" };
  }

  if (!/^\d{6}$/.test(otp)) {
    return { isValid: false, error: "OTP must contain only numbers" };
  }

  return { isValid: true };
};

// Referral code validation
export const validateReferralCode = (
  referralCode: string
): { isValid: boolean; error?: string } => {
  if (!referralCode) {
    return { isValid: true }; // Optional field
  }

  if (referralCode.length !== 8) {
    return { isValid: false, error: "Referral code must be 8 characters long" };
  }

  if (!/^[A-Z0-9]{8}$/.test(referralCode)) {
    return {
      isValid: false,
      error: "Referral code must contain only uppercase letters and numbers",
    };
  }

  return { isValid: true };
};

// Login form validation
export const validateLoginForm = (email: string, password: string) => {
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);

  if (!emailValidation.isValid) {
    return { isValid: false, error: emailValidation.error };
  }

  if (!passwordValidation.isValid) {
    return { isValid: false, error: passwordValidation.error };
  }

  return { isValid: true };
};

// Registration form validation
export const validateRegistrationForm = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
  referralCode?: string
) => {
  const nameValidation = validateName(name);
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);
  const confirmPasswordValidation = validateConfirmPassword(
    password,
    confirmPassword
  );
  const referralCodeValidation = validateReferralCode(referralCode || "");

  if (!nameValidation.isValid) {
    return { isValid: false, error: nameValidation.error };
  }

  if (!emailValidation.isValid) {
    return { isValid: false, error: emailValidation.error };
  }

  if (!passwordValidation.isValid) {
    return { isValid: false, error: passwordValidation.error };
  }

  if (!confirmPasswordValidation.isValid) {
    return { isValid: false, error: confirmPasswordValidation.error };
  }

  if (!referralCodeValidation.isValid) {
    return { isValid: false, error: referralCodeValidation.error };
  }

  return { isValid: true };
};

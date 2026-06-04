CREATE TABLE IF NOT EXISTS password_reset_otps (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL,
  OTP           VARCHAR(6) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at    TIMESTAMP,
  used          BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_email ON password_reset_otps(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_otp  ON password_reset_otps(OTP);
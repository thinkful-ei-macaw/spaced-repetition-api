module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL
    || 'postgresql://dunder_mifflin@localhost/spaced-repetition',
  JWT_SECRET: process.env.JWT_SECRET || '34$iJY8&dafUHh8(*lcn^hjYP:.JH',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '3h',
}

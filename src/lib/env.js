export const ENV = {
  ADMIN_EMAIL: import.meta.env.VITE_ADMIN_EMAIL,
  ADMIN_PASSWORD: import.meta.env.VITE_ADMIN_PASSWORD,
  ADMIN_USERNAME: import.meta.env.VITE_ADMIN_USERNAME,

  ROOM_A_PAYOUT: Number(import.meta.env.VITE_ROOM_A_PAYOUT),
  ROOM_B_PAYOUT: Number(import.meta.env.VITE_ROOM_B_PAYOUT),
  ROOM_C_PAYOUT: Number(import.meta.env.VITE_ROOM_C_PAYOUT),

  API_KEY_PREFIX: import.meta.env.VITE_API_KEY_PREFIX,
}
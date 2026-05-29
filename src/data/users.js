import { ENV } from "../lib/env"

function genHex(bytes) {
  return Array.from(
    crypto.getRandomValues(new Uint8Array(bytes))
  )
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
}

export const generateUserId = () => `sgm_${genHex(6)}`
export const generateApiKey = () => `${ENV.API_KEY_PREFIX}${genHex(20)}`

export function createUser(username, password, email) {
  return {
    userid: generateUserId(),
    username,
    password,
    email,
    role: "user",
    saldo: 0,
    bankType: "DANA",
    bankNumber: "",
    apiKey: generateApiKey(),
    createdAt: new Date().toISOString(),
  }
}

export const SEED_USERS = [
  {
    userid: "sgm_admin000001",
    username: ENV.ADMIN_USERNAME,
    password: ENV.ADMIN_PASSWORD,
    email: ENV.ADMIN_EMAIL,
    role: "admin",
    saldo: 0,
    bankType: "",
    bankNumber: "",
    apiKey: generateApiKey(),
    createdAt: new Date().toISOString(),
  },
]
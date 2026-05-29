import { SEED_USERS } from "../data/users"
import { SEED_EMAILS } from "../data/emails"

export const SDB = {
  getUsers() {
    return JSON.parse(
      localStorage.getItem("sgm_users")
    ) || SEED_USERS
  },

  setUsers(data) {
    localStorage.setItem(
      "sgm_users",
      JSON.stringify(data)
    )
  },

  getEmails() {
    return JSON.parse(
      localStorage.getItem("sgm_emails")
    ) || SEED_EMAILS
  },

  setEmails(data) {
    localStorage.setItem(
      "sgm_emails",
      JSON.stringify(data)
    )
  },

  getSession() {
    return JSON.parse(
      localStorage.getItem("sgm_session")
    )
  },

  setSession(data) {
    localStorage.setItem(
      "sgm_session",
      JSON.stringify(data)
    )
  },

  clearSession() {
    localStorage.removeItem("sgm_session")
  },
}
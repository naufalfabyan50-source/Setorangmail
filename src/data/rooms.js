import { ENV } from "../lib/env"

export const ROOMS = [
  {
    id: "A",
    name: "Room A",
    payout: ENV.ROOM_A_PAYOUT,
    open: true,
  },
  {
    id: "B",
    name: "Room B",
    payout: ENV.ROOM_B_PAYOUT,
    open: true,
  },
  {
    id: "C",
    name: "Room C",
    payout: ENV.ROOM_C_PAYOUT,
    open: false,
  },
]
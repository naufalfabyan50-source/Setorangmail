function genHex(bytes) {
  return Array.from(
    crypto.getRandomValues(new Uint8Array(bytes))
  )
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
}

export const generateSubId = () => `sub_${genHex(4)}`

export function createEmailEntry(
  email,
  ownerid,
  ownerUsername,
  paymentOwner,
  room
) {
  return {
    id: generateSubId(),
    email,
    ownerid,
    ownerUsername,
    paymentOwner,
    room,

    status: "pending",
    payout: 0,
    reason: null,

    timestamp: new Date().toISOString(),
    processedAt: null,
  }
}

export const SEED_EMAILS = []
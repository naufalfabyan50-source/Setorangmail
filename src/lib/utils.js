export const fmtRp = n =>
  "Rp " + Number(n).toLocaleString("id-ID")

export const fmtDate = s =>
  new Date(s).toLocaleString("id-ID")

export const paymentLabel = s => {
  if (!s) return "-"

  const [type, ...rest] = s.split("_")

  return `${type.toUpperCase()} ${rest.join("_")}`
}
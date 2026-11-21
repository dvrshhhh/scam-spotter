export type ExampleKind =
  | 'ordinary'
  | 'suspicious'
  | 'uncertain'
  | 'kyc'
  | 'upi'
  | 'courier'

export interface ExampleMessage {
  id: ExampleKind
  label: string
  description: string
  region?: 'india' | 'general'
  text: string
}

export const EXAMPLE_MESSAGES: ExampleMessage[] = [
  {
    id: 'ordinary',
    label: 'Ordinary',
    description: 'Everyday chat with little scam language',
    region: 'general',
    text: `Hi Maya, running 10 minutes late for coffee. See you at the usual cafe near campus. No rush!`,
  },
  {
    id: 'uncertain',
    label: 'Uncertain',
    description: 'Delivery pressure plus a shortened link',
    region: 'general',
    text: `Amazon Support Alert: We couldn't deliver your package. Update your shipping address here: https://bit.ly/pkg-update99 within 24 hours to avoid return to sender.`,
  },
  {
    id: 'suspicious',
    label: 'Suspicious',
    description: 'Bank pressure, OTP ask, and a lookalike login URL',
    region: 'general',
    text: `FINAL NOTICE from your Bank Security Team: Your account will be suspended within 2 hours. Confirm your password and OTP immediately at http://secure-bank-login.paypa1-verify.ru/login or we will take legal action. Keep this confidential. Do not tell anyone.`,
  },
  {
    id: 'kyc',
    label: 'Fake KYC',
    description: 'India: pending KYC + Aadhaar/PAN pressure',
    region: 'india',
    text: `Dear Customer, your KYC is pending with HDFC Bank Security Team. Complete KYC and share Aadhaar + PAN now or account will be blocked within 2 hours: https://hdfc-verify.ru/kyc Keep this confidential.`,
  },
  {
    id: 'upi',
    label: 'UPI collect',
    description: 'India: unexpected UPI pin / collect request',
    region: 'india',
    text: `SBI Fraud Prevention Team: Unusual login detected. Confirm UPI pin and OTP immediately or your account will be suspended. Pay collect request 9876543210@paytm and do not tell anyone.`,
  },
  {
    id: 'courier',
    label: 'Courier fee',
    description: 'India: customs / delivery fee bait with short link',
    region: 'india',
    text: `Courier Partner Alert: Your international parcel is held for customs duty. Pay the clearance fee here https://rb.gy/duty99 within 24 hours or parcel will be returned. Official notice from Customs Department.`,
  },
]

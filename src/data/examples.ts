export type ExampleKind = 'ordinary' | 'suspicious' | 'uncertain'

export interface ExampleMessage {
  id: ExampleKind
  label: string
  description: string
  text: string
}

export const EXAMPLE_MESSAGES: ExampleMessage[] = [
  {
    id: 'ordinary',
    label: 'Ordinary',
    description: 'Everyday message with little scam language',
    text: `Hi Maya — running 10 minutes late for coffee. See you at the usual café near campus. No rush!`,
  },
  {
    id: 'suspicious',
    label: 'Suspicious',
    description: 'Stacked pressure, credentials, and a shady link',
    text: `FINAL NOTICE from your Bank Security Team: Your account will be suspended within 2 hours. Confirm your password and OTP immediately at http://secure-bank-login.paypa1-verify.ru/login or we will take legal action. Keep this confidential — do not tell anyone.`,
  },
  {
    id: 'uncertain',
    label: 'Uncertain',
    description: 'Some pressure and a link, but not a full credential ask',
    text: `Amazon Support Alert: We couldn't deliver your package. Update your shipping address here: https://bit.ly/pkg-update99 within 24 hours to avoid return to sender.`,
  },
]

export type SafetyPathId =
  | 'suspicious-message'
  | 'clicked-link'
  | 'shared-secrets'
  | 'sent-money'

export interface SafetyPath {
  id: SafetyPathId
  title: string
  summary: string
  steps: string[]
}

export const SAFETY_PATHS: SafetyPath[] = [
  {
    id: 'suspicious-message',
    title: 'I received a suspicious message',
    summary: 'Pause before replying, clicking, or sharing anything.',
    steps: [
      'Do not reply, click links, or call numbers that appear only in the message.',
      'Compare the claim with what you already know (orders, bank activity, job applications).',
      'Open the official app or type the organization’s website address yourself.',
      'Contact the organization using a phone number or channel you already trust, not one supplied only in the message.',
      'If you are unsure, ask a trusted person before taking action.',
    ],
  },
  {
    id: 'clicked-link',
    title: 'I clicked a link',
    summary: 'A click alone is not always a disaster, but treat the page as untrusted.',
    steps: [
      'Stop interacting with the page. Do not enter passwords, codes, or payment details.',
      'Close the tab or browser window.',
      'If you typed anything sensitive, change that password from a device and site you trust.',
      'Open the official app or website by typing the address yourself and check your account activity.',
      'Run a device security check using tools you already trust, and update your browser and OS when prompted.',
    ],
  },
  {
    id: 'shared-secrets',
    title: 'I shared a password, PIN, or one-time code',
    summary: 'Act quickly. Treat the credential as compromised.',
    steps: [
      'Stop further contact with the sender.',
      'Change the password or PIN from the official app or website you open yourself.',
      'If you shared a one-time code, contact the bank or service provider immediately through an official channel and report possible account takeover.',
      'Turn on or confirm multi-factor authentication where available.',
      'Review recent logins, transfers, and connected devices in the official app.',
    ],
  },
  {
    id: 'sent-money',
    title: 'I sent money or shared payment information',
    summary: 'Contact your bank or payment provider through official channels right away.',
    steps: [
      'Stop sending any further money or details.',
      'Contact your bank, card issuer, or payment app using the official app, website, or a number you already trust.',
      'Ask about freezing cards, blocking UPI or wallets, and disputing the transaction if that option exists.',
      'Save copies of messages, payment references, and screenshots for the report.',
      'Report the incident through the official fraud or cybercrime channels available in your area when advised by your bank or provider.',
    ],
  },
]

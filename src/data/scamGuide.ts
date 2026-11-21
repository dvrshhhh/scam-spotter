export interface ScamGuideItem {
  id: string
  title: string
  summary: string
  redFlags: string[]
  doInstead: string[]
}

/** Educational guide content for demos (local, no network). */
export const SCAM_GUIDE: ScamGuideItem[] = [
  {
    id: 'otp-phishing',
    title: 'OTP / password phishing',
    summary:
      'Messages claim your bank or app needs a password, PIN, or OTP by reply. Real banks almost never ask for these over SMS or chat.',
    redFlags: [
      'Asks you to reply with OTP, PIN, or password',
      'Threatens account freeze within minutes',
      'Link to a login page you did not open yourself',
    ],
    doInstead: [
      'Open the official bank or UPI app yourself',
      'Call the number printed on your card or passbook',
      'Never share OTP, even with someone claiming to be support',
    ],
  },
  {
    id: 'fake-kyc',
    title: 'Fake KYC update',
    summary:
      'Common in India: “KYC pending” texts push Aadhaar, PAN, or a verify link. Official KYC usually happens inside the bank app or branch.',
    redFlags: [
      'Sudden KYC deadline with legal threats',
      'Asks for Aadhaar / PAN over chat',
      'Shortened or odd “bank-verify” domains',
    ],
    doInstead: [
      'Check KYC status only inside your bank’s official app',
      'Ignore links in unexpected SMS',
      'Visit a branch if you are unsure',
    ],
  },
  {
    id: 'upi-collect',
    title: 'UPI collect / wrong-transfer scams',
    summary:
      'Scammers send collect requests or ask you to “confirm UPI pin”. Approving a collect request can send your money out.',
    redFlags: [
      'Unexpected collect request',
      'Pressure to “enter UPI pin to receive money”',
      'Stranger asking you to reverse a “wrong transfer”',
    ],
    doInstead: [
      'Decline unknown collect requests',
      'Remember: receiving money does not need your UPI pin',
      'Report fraud in the UPI app and call your bank helpline',
    ],
  },
  {
    id: 'courier-customs',
    title: 'Courier / customs fee bait',
    summary:
      'Fake delivery messages claim a parcel is stuck for a small “duty” or “rebooking fee,” then steal card or UPI details.',
    redFlags: [
      'Parcel you never ordered',
      'Pay fee via gift card, crypto, or random UPI id',
      'Short links instead of the courier’s official site',
    ],
    doInstead: [
      'Track packages only in the official courier app',
      'Confirm the tracking number with the seller',
      'Do not pay customs through a chat link',
    ],
  },
  {
    id: 'job-investment',
    title: 'Job / investment grooming',
    summary:
      'Too-good job offers or “guaranteed returns” move the chat to secrecy, then ask for fees, gift cards, or remote-access apps.',
    redFlags: [
      'Pay a registration or training fee first',
      'Asks you to install AnyDesk / TeamViewer',
      '“Keep this secret from family”',
    ],
    doInstead: [
      'Research the company on official sites',
      'Never pay to get a job',
      'Refuse remote-access software for “HR verification”',
    ],
  },
]

export const SAFETY_TIPS: string[] = [
  'Pause when a message creates panic. Scams love countdown timers.',
  'Type website addresses yourself or use the official app. Do not trust links in unexpected SMS.',
  'Banks and tax offices will not ask for OTP, full card details, or Aadhaar over chat.',
  'If money already moved, freeze UPI / cards in the official app and call the bank fraud number you already trust.',
  'When unsure, show the message to a trusted person before acting.',
]

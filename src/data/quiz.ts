export interface QuizSample {
  id: string
  label: string
  /** Educational sample message text. */
  text: string
  /** Correct answer for “does this look suspicious?” */
  isSuspicious: boolean
  clues: string[]
  explanation: string
  patternLabel: string
}

/** Educational practise samples. Clearly fictional for learning. */
export const QUIZ_SAMPLES: QuizSample[] = [
  {
    id: 'benign-meetup',
    label: 'Campus meetup',
    text: 'Hey, class is moved to room 204. Bring your notes. See you at 3.',
    isSuspicious: false,
    clues: ['No payment ask', 'No credential ask', 'No urgent threat or unknown link'],
    explanation:
      'This reads like an ordinary planning message. Still verify unexpected schedule changes with someone you know if you are unsure.',
    patternLabel: 'Ordinary message',
  },
  {
    id: 'bank-otp',
    label: 'Bank OTP ask',
    text: 'FINAL NOTICE from your Bank Security Team: confirm your password and OTP at http://secure-bank-login.paypa1-verify.ru/login within 2 hours or your account will be locked.',
    isSuspicious: true,
    clues: [
      'Impersonates a bank security team',
      'Asks for password and OTP',
      'Urgent lockout deadline',
      'Lookalike / suspicious login URL',
    ],
    explanation:
      'Banks that already know you rarely ask you to submit a password or OTP through a chat link. This stacks impersonation, urgency, credentials, and a shady URL.',
    patternLabel: 'Account impersonation + urgent threat',
  },
  {
    id: 'prize',
    label: 'Prize claim',
    text: 'Congratulations! You have been selected as a lucky winner. Claim your prize and pay the release fee with gift cards here: https://bit.ly/prize-now',
    isSuspicious: true,
    clues: [
      'Unexpected prize language',
      'Asks for a fee to release the prize',
      'Gift-card payment channel',
      'Shortened URL',
    ],
    explanation:
      'Unexpected prizes that require a fee or gift cards are classic bait. Short links also hide the real destination.',
    patternLabel: 'Unexpected prize + payment request',
  },
  {
    id: 'job-anydesk',
    label: 'Job offer',
    text: 'Part-time online job: earn daily. Pay a small registration fee and install AnyDesk so HR can verify your laptop. Keep this confidential.',
    isSuspicious: true,
    clues: [
      'Pay-to-start job framing',
      'Remote-access software request',
      'Secrecy pressure',
    ],
    explanation:
      'Legitimate employers do not usually ask for registration fees or remote-access apps over chat before hiring.',
    patternLabel: 'Suspicious job or remote-access pressure',
  },
  {
    id: 'kyc',
    label: 'KYC SMS',
    text: 'Dear Customer, KYC pending. Share Aadhaar and PAN and complete verification at https://hdfc-verify.ru/kyc within 2 hours or account will be blocked.',
    isSuspicious: true,
    clues: [
      'Unexpected KYC deadline',
      'Asks for Aadhaar / PAN over the message',
      'Odd verify domain',
      'Account-block threat',
    ],
    explanation:
      'Official KYC updates usually happen inside the bank’s own app or branch, not through a rushed SMS link asking for ID numbers.',
    patternLabel: 'Account impersonation + urgent threat',
  },
  {
    id: 'family-ping',
    label: 'Family ping',
    text: 'Reached home. Dinner is in the fridge. Call if you need anything.',
    isSuspicious: false,
    clues: ['Personal context', 'No links', 'No money or credential asks'],
    explanation:
      'No common scam hallmarks appear here. Context from people you know still matters more than any automated tool.',
    patternLabel: 'Ordinary message',
  },
]

export abstract class SMSInterface {
  abstract sendSMS: (to: string, body: string) => Promise<void>;
}
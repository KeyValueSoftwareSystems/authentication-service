import { ConfigService } from '@nestjs/config';
import request from 'request';

export class RecaptchaService {

    constructor(private configService: ConfigService) {}

    verifyGoogleRecaptcha(captcha: string) {

        const RECAPTCHA_SECRET_KEY = this.configService.get("RECAPTCHA_SECRET_KEY");
        const minRecaptchaScore = this.configService.get("minRecaptchaScore");

        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${captcha}`;

        request(verifyUrl ,(err: any, response: any, body: any)=> {

            if(err) 
                console.log(err); 

            body = JSON.parse(body);

            if(!body.success && body.success === undefined){
                return false;
            }
            else if(body.score < minRecaptchaScore){
                return false;
            }
            
            return true;

        })
    }

}
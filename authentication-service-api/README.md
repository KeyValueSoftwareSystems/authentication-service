
# Authentication Service

A standalone service to handle authentication and authorization.
<p  align="center">
<img src="https://www.keyvalue.systems/logo.png" width="290" height="100">
</p>
&nbsp;
<p  align="center">
<a  href="https://gitlab.com/keyvalue-systems/authentication-service/-/pipelines"  target="_blank"><img  src="https://gitlab.com/keyvalue-systems/authentication-service/badges/master/pipeline.svg?key_text=build"  alt="build status"/></a>
</p>

  

## Description

User signup, authentication and authorization are integral parts of any SAAS product. When we kick start a new product development we can either use services like AWS cognito , Auth0 etc or build ourselves to achieve this, Even if we use external services we end up writing a wrapper. This service tries to implement the user authentication and authorization features needed for any application.

Service can be used as mentioned below
-   Deploy as a standalone service for managing authentication and authorization   
-   Use it as a starting point for new product development and build new features on top of it.
 
Developers can customise this as per their requirement.

## Features

-   Signup using phone number/email and password
-   Login using phone number/email and password
-   Signup using phone number/email and OTP (custom totp + message via sendgrid / twilio)
-   Validating OTP
-   Recaptcha v2 and v3 implementation
-   Signup using google
-   Authentication using JWT access token
-   Ability to refresh the token
-   Option to change password
-   Managing groups
-   Assign user to a group
-   Manage permissions for different apis
-   Assigning permissions to a group or individual user.
-   Authorize a user based on their permissions(direct permissions and group permissions)
 
## Tech stack 

-   [NodeJS](https://nodejs.org/en/)
-   [NestJS](https://nestjs.com/)
-   [Redis](https://redis.io/)
-   [Postgresql](https://www.postgresql.org/)
-   [Apollo Graphql](https://www.apollographql.com/)
-   [Docker](https://www.docker.com/)
-   [Sendgrid](https://sendgrid.com/)
-   [Twilio](https://www.twilio.com/)

## Getting Started

-   Clone the repo and execute command `npm install`
-   Create a copy of the env.sample file and rename it as .env
-   Install postgres and redis
-   Provide postgres, redis secrets and default user details in .env file as mentioned below

| Database configuration(Required) |  |
|--|--|
|POSTGRES_HOST  | localhost |
|POSTGRES_PORT  |  5432|
|POSTGRES_USER  | postgres |
|POSTGRES_PASSWORD  | postgres |
|POSTGRES_DB  | auth_service |

&nbsp;
|Redis Cache configuration(Required)  |  |
|--|--|
|REDIS_HOST  | localhost |
|REDIS_PORT |6379  |
|REDIS_CACHE_TTL | 3600 |
|REDIS_MAX_ITEM_IN_CACHE  |1000  |

&nbsp;
| Authentication Configuration(Required) |  |
|--|--|
|OTP_SECRET|  secret|
|JWT_TOKEN_EXPTIME|3600  |
|JWT_REFRESH_TOKEN_EXP_TIME| 36000 |
|ENV  |  local|

  &nbsp;
| Other Configuration(Required) |  |
|--|--|
|PORT|4000  |
|DEFAULT_ADMIN_PASSWORD|Should be atleast 10 characters|

  &nbsp;
|Google social login Configuration(Optional)|  |
|--|--|
|GOOGLE_CLIENT_ID  |  |
|GOOGLE_SECRET  |  |
|APP_URL  | the URL of the application to which the redirect should happen |

&nbsp;
|Google recaptcha Configuration(Optional) |  |
|--|--|
|RECAPTCHA_SECRET_KEY | secret |
|RECAPTCHA_VERIFY_URL  | https://www.google.com/recaptcha/api/siteverify |
|MIN_RECAPTCHA_SCORE  |Required for Recaptcha V3  |

  &nbsp;
|OTP Sender Configuration(Optional)  |  |
|--|--|
|IS_TWILIO_INTEGRATED  | false |
|TWILIO_ACC_SID  | required only if you are using any twilio service(sms sender or verify tool) |
|TWILIO_AUTH_TOKEN  | required only if you are using any twilio service(sms sender or verify tool) |
|TWILIO_SENDING_NUMBER  | required only if you are using any twilio service(sms sender or verify tool) |
|OTP_VERIFY_TOOL| twilio or default|
|TWILIO_VERIFY_SID| required only if otp verify tool is twilio |
|SMS_INTEGRATION|twilio or aws|
| OTP_WINDOW | 300  |
| OTP_STEP | 1 |

-   Run `npm run run-migrations`
-   Run `npm run start`
-   Service should be up and running in http://localhost:${PORT}.
- A default admin user with email **admin@domain.com** and password given in `DEFAULT_ADMIN_PASSWORD` will already be available in the application. This user will be associated to the default `Admin` group which will have the permissions to create/update permissions, create/update groups, create/update entities and update a user
    

We can ensure the health of the service by accessing http://localhost:${PORT}/auth/api/health.

## Google Social login

Inorder to login by Google, access the following URL in browser http://localhost:4000/auth/api/google 
## GraphQL API reference

GraphQL endpoint

http://localhost:${PORT}/auth/api/graphql

[API Documentation](https://documenter.getpostman.com/view/10091423/U16ev8cG)
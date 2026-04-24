export const COGNITO_CONFIG = {
    region: process.env.AWS_REGION ?? 'us-east-1',
    userPoolId: process.env.COGNITO_USER_POOL_ID ?? '',
    clientId: process.env.COGNITO_CLIENT_ID ?? '',
    clientSecret: process.env.COGNITO_CLIENT_SECRET,
} as const;

console.log(COGNITO_CONFIG);
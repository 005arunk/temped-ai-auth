import { CognitoJwtVerifier } from 'aws-jwt-verify';

export function cognitoConfigured() {
  return Boolean(process.env.AWS_REGION && process.env.COGNITO_USER_POOL_ID && process.env.COGNITO_CLIENT_ID);
}

let verifier;
function getVerifier() {
  if (!cognitoConfigured()) {
    const error = new Error('Cognito not configured');
    error.code = 'AUTH_NOT_CONFIGURED';
    throw error;
  }
  if (!verifier) {
    verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.COGNITO_USER_POOL_ID,
      tokenUse: 'access',
      clientId: process.env.COGNITO_CLIENT_ID
    });
  }
  return verifier;
}

export async function verifyCognitoAccessToken(token) {
  return getVerifier().verify(token);
}

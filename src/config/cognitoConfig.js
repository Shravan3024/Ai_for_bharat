import { CognitoUserPool } from "amazon-cognito-identity-js";

// You will configure these variables with actual values from the AWS Console later
const poolData = {
    UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || "us-east-1_xxxxxxxxx", 
    ClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID || "xxxxxxxxxxxxxxxxxxxxxxxxxx"
};

export const userPool = new CognitoUserPool(poolData);

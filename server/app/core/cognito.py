import urllib.request
import json
from jose import jwk, jwt
from jose.utils import base64url_decode
from fastapi import HTTPException, status
from typing import Dict, Any

from app.core.config import settings

def get_cognito_jwks() -> dict:
    if not settings.COGNITO_REGION or not settings.COGNITO_USER_POOL_ID:
        return {}
        
    url = f"https://cognito-idp.{settings.COGNITO_REGION}.amazonaws.com/{settings.COGNITO_USER_POOL_ID}/.well-known/jwks.json"
    try:
        req = urllib.request.urlopen(url)
        keys = json.loads(req.read())
        return keys
    except Exception as e:
        print(f"Failed to fetch JWKS: {e}")
        return {}

# Cache the keys in memory to avoid fetching them on every request
_COGNITO_JWKS = None

def verify_cognito_token(token: str) -> Dict[str, Any]:
    global _COGNITO_JWKS
    
    if not settings.COGNITO_REGION or not settings.COGNITO_USER_POOL_ID or not settings.COGNITO_APP_CLIENT_ID:
        # Fallback for development if Cognito is not fully configured
        # In a real production app, this should raise an error
        from app.core.security import verify_token as legacy_verify
        return legacy_verify(token)

    if _COGNITO_JWKS is None:
        _COGNITO_JWKS = get_cognito_jwks()

    if not _COGNITO_JWKS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not construct JWKS",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        # get the kid from the headers prior to verification
        headers = jwt.get_unverified_headers(token)
        kid = headers.get('kid')
        
        if not kid:
            raise Exception("No kid in token header")

        key_index = -1
        for i in range(len(_COGNITO_JWKS['keys'])):
            if kid == _COGNITO_JWKS['keys'][i]['kid']:
                key_index = i
                break
                
        if key_index == -1:
            raise Exception("Public key not found in jwks.json")

        # construct the public key
        public_key = jwk.construct(_COGNITO_JWKS['keys'][key_index])

        # get the last two sections of the token,
        # message and signature (encoded in base64)
        message, encoded_signature = str(token).rsplit('.', 1)

        # decode the signature
        decoded_signature = base64url_decode(encoded_signature.encode('utf-8'))

        # verify the signature
        if not public_key.verify(message.encode("utf8"), decoded_signature):
            raise Exception("Signature verification failed")

        # verify claim
        claims = jwt.get_unverified_claims(token)
        
        # Verify token expiration
        import time
        if time.time() > claims['exp']:
            raise Exception("Token expired")
            
        # verify app client id - ID tokens use 'aud', access tokens use 'client_id'
        print(f"[Cognito DEBUG] token_use: {claims.get('token_use')}, aud: {claims.get('aud')}, client_id: {claims.get('client_id')}")
        token_use = claims.get('token_use')
        if token_use == 'access':
            if claims.get('client_id') != settings.COGNITO_APP_CLIENT_ID:
                raise Exception("Access token was not issued for this client")
        else:
            # id token uses 'aud'
            if claims.get('aud') != settings.COGNITO_APP_CLIENT_ID:
                raise Exception(f"Token aud '{claims.get('aud')}' does not match client '{settings.COGNITO_APP_CLIENT_ID}'")

        return claims
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

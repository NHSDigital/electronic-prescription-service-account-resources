import jwt, {Secret} from "jsonwebtoken"
import {v4 as uuidv4} from "uuid"
import axios from "axios"

const realm_url = "https://identity.prod.api.platform.nhs.uk/realms/api-producers"

function createSignedJWT(privateKey: Secret, kid: string, apiName: string) {
  const header = {
    typ: "JWT",
    alg: "RS512",
    kid: kid
  }
  const jti_value = uuidv4()

  const currentTimestamp = Math.floor(Date.now() / 1000)
  const data = {
    sub: `${apiName}-client`,
    iss: `${apiName}-client`,
    jti: jti_value,
    aud: realm_url,
    exp: currentTimestamp + 180 // expiry time is 180 seconds from time of creation
  }

  const signedJWT = jwt.sign(JSON.stringify(data), privateKey, {algorithm: "RS512", header: header})
  return signedJWT
}

export async function getAccessToken(privateKey: Secret, kid: string, apiName: string) {
  const signedJWT = createSignedJWT(privateKey, kid, apiName)
  const payload = {
    grant_type: "client_credentials",
    client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    client_assertion: signedJWT
  }
  const auth_url = `${realm_url}/protocol/openid-connect/token`
  const response = await axios.post(auth_url, payload, {headers: {"content-type": "application/x-www-form-urlencoded"}})
  return response.data
}

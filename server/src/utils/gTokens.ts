import fetch from "node-fetch"

const tokenExpired = (gExpirationDate: string | number | Date) => {
    const now = Date.now();
  
    if (now > gExpirationDate) {
      return true; // token expired
    }
  
    return false; // valid token
};

const newExpirationDate = () => {
    var expiration = new Date()
    expiration.setHours(expiration.getHours() + 1)
    return Date.parse(expiration.toDateString())
};
  
const getValidTokenFromServer = async (gRefreshToken: string | null) => {
    // get new token from server with refresh token
    try {
        const request = await fetch("http://localhost:4000/getValidToken", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                gRefreshToken: gRefreshToken,
            }),
        });
        const token = await request.json();
        return token;
    } catch (error:any) {
        throw new Error(error.message);
    }
};

export const getGToken = async (gRefreshToken: string | null, gExpirationDate: string | number | Date) => {
    if (tokenExpired(gExpirationDate)) {
        const {access_token} = await getValidTokenFromServer(gRefreshToken);
        const newGExpirationDate = newExpirationDate()
        return {access_token, newGExpirationDate}
    } else {
        console.log("token not expired");
        return false
    }
};
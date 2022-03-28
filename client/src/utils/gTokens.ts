  
const newExpirationDate = () => {
    var expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);
    return expiration;
};
  
const tokenExpired = () => {
    const now = Date.now();
  
    const expirationDate = localStorage.getItem("gExpirationDate");
    const expDate = new Date(expirationDate!);
  
    if (now > expDate.getTime()) {
      return true; // token expired
    }
  
    return false; // valid token
};
  
const getValidTokenFromServer = async (refreshToken: string | null) => {
    // get new token from server with refresh token
    try {
        const request = await fetch("http://localhost:4000/getValidToken", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                refreshToken: refreshToken,
            }),
        });
        const token = await request.json();
        return token;
    } catch (error:any) {
        throw new Error(error.message);
    }
};

export const getGToken = async () => {
    if (tokenExpired()) {
        const refreshtoken = localStorage.getItem("gRefreshToken");
        const token = await getValidTokenFromServer(refreshtoken);
        localStorage.setItem("gAccessToken", token.accessToken);
        localStorage.setItem("gExpirationDate", newExpirationDate().toDateString());
        return token.accessToken;
    } else {
        console.log("tokens.js 11 | token not expired");
        return localStorage.getItem("gAccessToken");
    }
};
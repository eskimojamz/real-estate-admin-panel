let accessToken = "";

export const setAccessToken = (s: string) => {
  accessToken = s;
  console.log("setAccessToken")
  console.log(accessToken)
};

export const getAccessToken = () => {
  console.log(accessToken)
  return accessToken;
};
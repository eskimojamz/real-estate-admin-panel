export const googleAuth = async () => {
    const url = 'https://horizon-admin-panel.herokuapp.com'

    try {
        const request = await fetch(`${url}/auth/google`, {
            method: "POST",
        });
        const response = await request.json();
        console.log(response)
        window.location.href = response.url;
    } catch (error: any) {
        console.log("App.js 12 | error", error);
        throw new Error(error.message);
    }
}
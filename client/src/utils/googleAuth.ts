import {url} from './url'

export const googleAuth = async () => {

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
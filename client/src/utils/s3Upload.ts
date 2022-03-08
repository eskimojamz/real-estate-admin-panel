import axios from "axios"

const s3Upload = async (signedRequest: string, file: File, ) => {
    const options = {
        headers: {
            "Content-Type": file.type
        }
    }
    await axios.put(signedRequest, file, options)
}

export default s3Upload
import axios from "axios"

const s3Upload = async (signedRequest: string, file: File, setLoading:React.Dispatch<React.SetStateAction<boolean>>) => {
    const options = {
        headers: {
            "Content-Type": file.type
        }
    }
    await axios.put(signedRequest, file, options)
        .then(res => {
            console.log(res)
        })
        .catch(err => {
            console.log(err)
            setLoading(false)
            throw new Error(err)
        })
}

export default s3Upload
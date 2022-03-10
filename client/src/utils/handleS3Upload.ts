const handleS3Upload = (file: File) => {
    let newFileName = file.name.replace(/\..+$/, "-");
    return newFileName
}

export default handleS3Upload
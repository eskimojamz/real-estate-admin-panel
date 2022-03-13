import { useCallback, useEffect, useState } from "react";
import {useDropzone} from "react-dropzone"
import Sidebar from "../components/Sidebar";
import { useSignS3Mutation } from "../generated/graphql";
import s3Upload from "../utils/s3Upload"

interface listing {
    id: string,
    address1: string
    address2: string,
    price: number,
    beds: number,
    baths: number,
    squareFt: number,
    status: string,
    area: string,
    description: string,
    dateCreated: string,
    lastEdited: string,
    image1: string,
    image2: string,
    image3: string,
    image4: string,
    image5: string,
}

const Create: React.FC = () => {
    const [s3Sign, {loading: s3SignLoading}] = useSignS3Mutation()
    const [s3UploadData, setS3UploadData] = useState([] as any)
    const [s3Uploading, setS3Uploading] = useState(false as Boolean)
    const [images, setImages] = useState([] as any)
    // const [imageUrls, setImageUrls] = useState([] as any)
   
    const onDrop:any = useCallback((acceptedFiles:[File]) => {
        setS3Uploading(true)
        setImages(acceptedFiles)
        console.log(acceptedFiles)
        console.log(images)
        const uploads = [] as any

        acceptedFiles.forEach(async (file:File) => {
            let fileName = file.name.replace(/\..+$/, "");
            
            console.log(file.type, file.name, file)
            const reader = new FileReader()
      
            reader.onabort = () => console.log('file reading was aborted')
            reader.onerror = () => console.log('file reading has failed')
            reader.onload = () => {
            // Do whatever you want with the file contents
              const binaryStr = reader.result
              console.log(binaryStr)
            }
            reader.readAsArrayBuffer(file)

            const s3SignedRequest = await s3Sign({
                variables: {
                    filename: fileName,
                    filetype: file.type
                },
                onError: (err) => {
                    console.log(err)
                }
            })

            

            uploads.push(
                {
                    signedRequest: s3SignedRequest?.data?.signS3?.signedRequest,
                    file: file,
                }
            )
        })
        setS3UploadData(uploads)
        setS3Uploading(false)
        return
    }, [])
    console.log(images)
    // console.log(imageUrls)
    const submit = async (e:any) => {
        e.preventDefault()
        await s3UploadData.forEach(async(data:any) => {
            await s3Upload(data.signedRequest, data.file)
            // await console.log(data)
        })
    }

    

    const {
        getRootProps,
        getInputProps,
        acceptedFiles,
        fileRejections,
      } = useDropzone({
        accept: 'image/jpeg,image/png',
        maxFiles: 5,
        onDrop
      });
    
      const acceptedFileItems = acceptedFiles.map((file:any) => (
        <li key={file.path}>
          {file.path} - {file.size} bytes
        </li>
      ));
    
      const fileRejectionItems = fileRejections.map(({ file, errors }:any) => (
        <li key={file.path}>
          {file.path} - {file.size} bytes
          <ul>
            {errors.map((e:any) => (
              <li key={e.code}>{e.message}</li>
            ))}
          </ul>
        </li>
      )); 
    
    const imagePreviews = images.map((image:File) => (
        <img className="image-preview-img" src={URL.createObjectURL(image)} />
    ))
    
    return (
        <>
        <Sidebar />
        <div className="create-container">
        <h2>Create New Listing</h2>
        <br></br>
        <div className="create-wrapper">
            
            <section className="form-col-1">
                <div className="dropzone-wrapper">
                    <div {...getRootProps({ className: 'dropzone' })}>
                        <input {...getInputProps()} />
                        <p>Drag and drop up to five (5) image files here, or click to select files</p>
                        <em>(Only *.jpeg/jpg and *.png images will be accepted)</em>
                    </div>
                    <aside className="image-preview-aside">
                    {imagePreviews}
                    </aside>
                </div>
                {(s3SignLoading || s3Uploading) && 
                <p>Preparing images for upload...</p>
                }
                
                <form className="form-col-1-bottom">
                    <label htmlFor="status">Status</label>
                    <select id="status" name="status">
                        <option value="active">Active</option>
                        <option value="sold">Sold</option>
                    </select>

                    <label htmlFor="area">Area</label>
                    <select id="area" name="area">
                        <option value="Queens">Queens</option>
                        <option value="Brooklyn">Brooklyn</option>
                        <option value="Long Island">Long Island</option>
                        <option value="Manhattan">Manhattan</option>
                        <option value="Bronx">Bronx</option>
                        <option value="New Jersey">New Jersey</option>
                        <option value="Staten Island">Staten Island</option>
                    </select>
                </form>
            </section>

            <section className="form-col-2">
            <form>
                <div className="label-group">
                    <label>Address</label>
                    <input placeholder="123 Street"></input>
                    <input placeholder="Bayside, NY 11364"></input>
                </div>

                <div className="label-group">
                    <label>Price</label>
                    <span>$ <input></input></span>
                </div>

                <div className="label-group">
                    <label htmlFor="beds">Beds</label>
                    <select id="beds" name="beds">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                    </select>
                </div>

                <div className="label-group">
                    <label htmlFor="baths">Baths</label>
                    <select id="baths" name="baths">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                    </select>
                </div>

                <div className="label-group">
                    <label htmlFor="squareFt">Square Ft.</label>
                    <input id="squareFt" name="squareFt"></input>
                </div>
            </form>
            </section>

            <section className="form-col-3">
                <label htmlFor="description">Description</label>
                <textarea name="description" id="description" cols={30} rows={20}></textarea>
            </section>
        </div>

            <section className="form-buttom-btns">
                <div className="form-bottom-btns-wrapper"> 
                    <button className="submit-btn" onClick={submit}>Submit</button>
                    <button >Cancel</button>
                </div>
            </section>

        </div>
        </>
    )
}

export default Create
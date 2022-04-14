import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { useDropzone } from "react-dropzone"
import { AllListingsDocument, useAllListingsQuery, useCreateMutation, useSignS3Mutation } from "../generated/graphql";
import s3Upload from "../utils/s3Upload"
import axios from "axios";
import { motion } from "framer-motion";

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

// interface s3UploadData {
//     signedRequest: string,
//     file: File,
//     url: string,
// }

const Create: React.FC = () => {
    const navigate = useNavigate()

    const [s3Sign, { loading: s3SignLoading }] = useSignS3Mutation()
    const [s3UploadData, setS3UploadData] = useState([])
    const [s3UploadError, setS3UploadError] = useState<boolean>(false)

    const [createMutation, { data: createData, error: createError, loading: createLoading }] = useCreateMutation({})
    const [createUpload, setCreateUpload] = useState<boolean>(false)

    const [loading, setLoading] = useState<boolean>(false)

    const [address1, setAddress1] = useState<string>()
    const [address2, setAddress2] = useState<string>()
    const [price, setPrice] = useState<any>()
    const [squareFt, setSquareFt] = useState<any>()
    const [beds, setBeds] = useState<number>(1)
    const [baths, setBaths] = useState<number>(1)
    const [status, setStatus] = useState<string>("Active")
    const [area, setArea] = useState<string>("Queens")
    const [description, setDescription] = useState<string>()
    const [imageUrls, setImageUrls] = useState([] as any)
    console.log(imageUrls)
    const [images, setImages] = useState([] as any)

    const onDrop: any = useCallback((acceptedFiles: [File]) => {
        setImages(acceptedFiles)
        console.log(acceptedFiles)
        console.log(images)
        const uploads = [] as any

        acceptedFiles.forEach(async (file: File) => {
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

            console.log(s3SignedRequest.data?.signS3.url)

            await setImageUrls((imageUrls: []) => [...imageUrls, s3SignedRequest?.data?.signS3?.url])
        })
        console.log(uploads)
        setS3UploadData(uploads)
        return
    }, [])
    console.log(images)
    // console.log(imageUrls)


    const submit = async (e: any) => {
        e.preventDefault()
        setLoading(true)

        let redirectId: string | undefined

        await createMutation({
            variables: {
                data: {
                    address1,
                    address2,
                    price: parseInt(price?.toString().replace(/\D/g, '')),
                    beds,
                    baths,
                    squareFt: parseInt(squareFt?.toString().replace(/\D/g, '')),
                    status,
                    area,
                    description,
                    image1: imageUrls[0] || null,
                    image2: imageUrls[1] || null,
                    image3: imageUrls[2] || null,
                    image4: imageUrls[3] || null,
                    image5: imageUrls[4] || null,
                }
            },
            refetchQueries: [{ query: AllListingsDocument }],
            awaitRefetchQueries: true,
            onCompleted: data => {
                console.log(data)
                redirectId = data.create?.id
            },
            onError: error => {
                console.log(error)
                setLoading(false)
                throw new Error(error.toString())
            }
        })
            .then(() => {
                s3UploadData && s3UploadData.forEach(async (data: any) => {
                    const options = {
                        headers: {
                            "Content-Type": data.file.type
                        }
                    };
                    await axios.put(data.signedRequest, data.file, options)
                        .then(res => {
                            console.log(res);
                        })
                        .catch(err => {
                            console.log(err);
                            setLoading(false)
                            setS3UploadError(true)
                            throw new Error(err);
                        });
                })
            })
            .then(() => setLoading(false))
            .then(() => navigate(`/listings/${redirectId}`))
            .catch(err => {
                console.log(err)
                throw new Error(err)
            })
    }

    const {
        getRootProps,
        getInputProps,
        fileRejections,
    } = useDropzone({
        accept: 'image/jpeg,image/png',
        maxFiles: 5,
        onDrop
    });

    const fileRejectionItems = fileRejections.map(({ file, errors }: any) => (
        <li key={file.path}>
            {file.path} - {file.size} bytes
            <ul>
                {errors.map((e: any) => (
                    <li key={e.code}>{e.message}</li>
                ))}
            </ul>
        </li>
    ));

    const imagePreviews = images.map((image: File) => (
        <motion.img className="image-preview-img"
            src={URL.createObjectURL(image)}
            whileHover={{ scale: 1.1, boxShadow: '-5px 5px 10px rgb(131, 130, 130, 0.2)', transition: { duration: 0.25 } }}
        />
    ))

    const loadingModal = (
        loading ?
            <div className="create-loading-modal">
                <div className="create-loading-modal-card">
                    Creating listing...
                </div>
            </div>
            : null
    )

    return (
        <>
            {loadingModal}

            <div className="wrapper">
                <div className="create-container">
                    <div className="page-header">
                        <div className="create-header-text">
                            <h5>Create New Listing</h5>
                        </div>
                        <div className="create-header-btns">
                            <button className="btn-grey">Cancel</button>
                            <button className="btn-primary" onClick={submit}>Submit</button>
                        </div>
                    </div>
                    <div className="create-wrapper">
                        <form>
                            <section className="form-col-1">
                                <label>Images</label>
                                <div className="dropzone-wrapper">
                                    <div {...getRootProps({ className: 'dropzone' })}>
                                        <input {...getInputProps()} />
                                        <p>Drag and drop up to five (5) image files here, or click to select files</p>
                                        <em>(Only *.jpeg/jpg and *.png images will be accepted)</em>
                                    </div>
                                    <motion.aside className="image-preview-aside"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        {imagePreviews}
                                        {fileRejections && fileRejectionItems}
                                    </motion.aside>
                                </div>
                            </section>

                            <section className="form-col-2">
                                <div className="label-group">
                                    <label>Address</label>
                                    <input className="input-mb" placeholder="123 Street" onChange={e => setAddress1(e.target.value)}></input>
                                    <input placeholder="Bayside, NY 11364" onChange={e => setAddress2(e.target.value)}></input>
                                </div>

                                <div className="label-group-row">
                                    <div className="label-group w-50 label-group-gap">
                                        <div className="label-input">
                                            <label>Price</label>
                                            <span className="dollar-placeholder">$</span><input className="price-input" onChange={e => setPrice(parseInt(e.target.value))}></input>
                                        </div>

                                        <div className="label-input">
                                            <label htmlFor="squareFt">Square Ft.</label>
                                            <input id="squareFt" name="squareFt" onChange={e => setSquareFt(parseInt(e.target.value))}></input>
                                        </div>
                                    </div>

                                    <div className="label-group w-50 label-group-gap">
                                        <div className="label-input">
                                            <label htmlFor="beds">Beds</label>
                                            <select id="beds" name="beds" value={beds} onChange={e => setBeds(parseInt(e.target.value))}>
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                                <option value="4">4</option>
                                                <option value="5">5</option>
                                                <option value="6">6</option>
                                            </select>
                                        </div>

                                        <div className="label-input">
                                            <label htmlFor="baths">Baths</label>
                                            <select id="baths" name="baths" value={baths} onChange={e => setBaths(parseInt(e.target.value))}>
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                                <option value="4">4</option>
                                                <option value="5">5</option>
                                                <option value="6">6</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="label-group label-group-gap">
                                    <div className="label-input">
                                        <label htmlFor="status">Status</label>
                                        <select id="status" name="status" value={status} onChange={e => setStatus(e.target.value)}>
                                            <option value="Active">Active</option>
                                            <option value="Sold">Sold</option>
                                        </select>
                                    </div>

                                    <div className="label-input">
                                        <label htmlFor="area">Area</label>
                                        <select id="area" name="area" value={area} onChange={e => setArea(e.target.value)}>
                                            <option value="Queens">Queens</option>
                                            <option value="Brooklyn">Brooklyn</option>
                                            <option value="Long Island">Long Island</option>
                                            <option value="Manhattan">Manhattan</option>
                                            <option value="Bronx">Bronx</option>
                                            <option value="New Jersey">New Jersey</option>
                                            <option value="Staten Island">Staten Island</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            <section className="form-col-3">
                                <label htmlFor="description">Description</label>
                                <textarea className="description" id="description" onChange={e => setDescription(e.target.value)}></textarea>
                            </section>
                        </form>
                        {createError || s3UploadError ?
                            <div className="error-div">
                                <em>There was an error. Please input all required fields and try again.</em>
                            </div>
                            : null}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Create
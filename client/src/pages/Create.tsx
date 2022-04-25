import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { useDropzone } from "react-dropzone"
import { AllListingsDocument, useAllListingsQuery, useCreateMutation, useSignS3Mutation } from "../generated/graphql";
import s3Upload from "../utils/s3Upload"
import axios from "axios";
import { motion } from "framer-motion";
import * as async from "async";
import { BarLoader } from "react-spinners";
import ImageCarousel from "../components/ImageCarousel";

const Create: React.FC = () => {
    const navigate = useNavigate()

    const [s3Sign] = useSignS3Mutation()
    const [s3UploadData, setS3UploadData] = useState([])
    const [createMutation] = useCreateMutation({})

    const [loading, setLoading] = useState<boolean>()
    const [error, setError] = useState<boolean>()

    const [address1, setAddress1] = useState<string>()
    const [address2, setAddress2] = useState<string>()
    const [price, setPrice] = useState<string>('0')
    const [squareFt, setSquareFt] = useState<string>('0')
    const [beds, setBeds] = useState<number>(1)
    const [baths, setBaths] = useState<number>(1)
    const [status, setStatus] = useState<string>("Active")
    const [area, setArea] = useState<string>("Queens")
    const [description, setDescription] = useState<string>()
    const [imageUrls, setImageUrls] = useState([] as any)
    console.log(imageUrls)
    const [images, setImages] = useState([] as any)

    const onDrop: any = useCallback((acceptedFiles: [File]) => {
        const imageSrcs: any = []
        acceptedFiles.map((file, i) => {
            imageSrcs.push({ key: i, src: URL.createObjectURL(file) })
        })
        setImages(imageSrcs)
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

            // console.log(s3SignedRequest.data?.signS3.url)

            setImageUrls((imageUrls: []) => [...imageUrls, s3SignedRequest?.data?.signS3?.url])
        })
        // console.log(uploads)
        setS3UploadData(uploads)
        return
    }, [])

    const submit = (e: any) => {
        e.preventDefault()
        setLoading(true)

        let redirectId: string | undefined
        createMutation({
            variables: {
                data: {
                    address1,
                    address2,
                    price: parseInt(price?.replace(/\D/g, '')),
                    beds,
                    baths,
                    squareFt: parseInt(squareFt?.replace(/\D/g, '')),
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
                // console.log(data)
                redirectId = data.create?.id
            },
            onError: error => {
                // console.log(error)
                setLoading(false)
                setError(true)
                throw new Error(error.toString())
            }
        }).then(() => {
            s3UploadData &&
                Promise.all(s3UploadData.map(async (data: any) => {

                    const options = {
                        headers: {
                            "Content-Type": data.file.type
                        }
                    };
                    await axios.put(data.signedRequest, data.file, options)
                        .catch((err) => {
                            setLoading(false)
                            setError(true)
                            throw new Error(err)
                        })
                })).then(() => {
                    setLoading(false)
                    navigate(`/listings/${redirectId}`)
                })
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

    const [toggleCarousel, setToggleCarousel] = useState<boolean>(false)
    const [currentIndex, setCurrentIndex] = useState<number>()

    const handleImg = (index: number) => {
        setCurrentIndex(index)
        setToggleCarousel(true)
    }

    const imagePreviews = images.map((image: { src: string }, i: number) => (
        <motion.img className="image-preview-img"
            src={image.src}
            whileHover={{ scale: 1.1, boxShadow: '-5px 5px 10px rgb(131, 130, 130, 0.2)', transition: { duration: 0.25 } }}
            onClick={() => handleImg(i)}
        />
    ))

    const imageCarousel = (
        toggleCarousel ?
            <ImageCarousel
                allImages={images}
                toggleCarousel={toggleCarousel}
                setToggleCarousel={setToggleCarousel}
                currentIndex={currentIndex!}
                imagesCount={images.length}
            />
            : null
    )

    const loadingModal = (
        loading ?
            <div className="create-loading-modal">
                <div className="create-loading-modal-card">
                    <p>Creating Listing...</p>
                    <BarLoader color="#2c5990" />
                </div>
            </div>
            : null
    )

    return (
        <>
            {/* Event conditional components */}
            {imageCarousel}
            {loadingModal}
            {/*  */}
            <div className="wrapper">
                <motion.div className="create-container"
                    initial={{ opacity: 0.5, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="page-header">
                        <div className="create-header-text">
                            <h5>Create New Listing</h5>
                        </div>
                        <div className="create-header-btns">
                            <button className="btn-grey" onClick={() => navigate('/listings')}>Cancel</button>
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
                                    {/* {imagePreviews || fileRejections && ( */}
                                    <motion.aside className="image-preview-aside"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        {imagePreviews}
                                        {fileRejections && fileRejectionItems}
                                    </motion.aside>
                                    {/* )} */}
                                </div>
                            </section>

                            <section className="form-col-2">
                                <div className="label-group">
                                    <label>Address *</label>
                                    <input className="input-mb" required={true} placeholder="123 Street" onChange={e => setAddress1(e.target.value)}></input>
                                    <input required={true} placeholder="Bayside, NY 11364" onChange={e => setAddress2(e.target.value)}></input>
                                </div>

                                <div className="label-group-row">
                                    <div className="label-group w-50 label-group-gap">
                                        <div className="label-input">
                                            <label>Price</label>
                                            <span className="dollar-placeholder">$</span><input className="price-input" onChange={e => setPrice(e.target.value)}></input>
                                        </div>

                                        <div className="label-input">
                                            <label htmlFor="squareFt">Square Ft.</label>
                                            <input id="squareFt" name="squareFt" onChange={e => setSquareFt(e.target.value)}></input>
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
                        <div className="form-required">
                            <p>*Required Fields</p>
                        </div>
                        {error ?
                            <div className="error-div">
                                <em>There was an error. Please input all required fields and try again.</em>
                            </div>
                            : null}
                    </div>
                </motion.div>
            </div>
        </>
    )
}

export default Create
import React, { useCallback, useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom";
import { AllListingsDocument, GetListingDocument, useDeleteMutation, useEditMutation, useGetListingQuery, useSignS3Mutation } from "../generated/graphql";
import GoogleMap from "google-map-react"
import Geocode from "react-geocode"
import { AnimatePresence, motion, MotionConfig } from "framer-motion"
import ImageCarousel from "../components/ImageCarousel"
import ListingEditView from "../components/ListingEditView"
import { LazyLoadImage } from "react-lazy-load-image-component";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { Img } from "react-image";
import s3Upload from "../utils/s3Upload";
import axios from "axios";
import { MdOutlineChevronRight } from "react-icons/md";
import { ScaleLoader } from "react-spinners";

interface MapMarkerProps {
    lat: number;
    lng: number;
    address: string;
}

const MapMarker: React.FC<MapMarkerProps> = (props) => {
    const { address } = props
    const encodedAddress = encodeURIComponent(address).replace(/%20/g, "+")
    return (
        <>
            <div className="map-marker"
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`)}
            />
        </>
    )
}

export interface ImagesFiles {
    0: File | null,
    1: File | null,
    2: File | null,
    3: File | null,
    4: File | null,
}

export interface DropState {
    0: boolean | undefined,
    1: boolean | undefined,
    2: boolean | undefined,
    3: boolean | undefined,
    4: boolean | undefined,
}

function ListingView() {
    const { listingId } = useParams()
    const navigate = useNavigate()

    const scaleVariant = {
        hidden: { scale: 0, opacity: 0 },
        visible: { scale: 1, opacity: 1 }
    }

    const { data: listingData, loading: listingDataLoading } = useGetListingQuery({
        variables: {
            getListingId: listingId as string
        }
    })

    const listingImages = {
        0: listingData?.getListing?.image1,
        1: listingData?.getListing?.image2,
        2: listingData?.getListing?.image3,
        3: listingData?.getListing?.image4,
        4: listingData?.getListing?.image5
    }

    console.log(listingImages)

    const [mapCenter, setMapCenter] = useState({ lat: null, lng: null } as any)
    const address: string = listingData?.getListing?.address1 + " " + listingData?.getListing?.address2
    console.log(address, mapCenter)

    // set Google Maps Geocoding API
    Geocode.setApiKey(process.env.REACT_APP_GOOGLE_MAPS_API_KEY!);
    Geocode.setLanguage("en");
    Geocode.setRegion("us");

    const [deleteMutation] = useDeleteMutation({
        variables: {
            deleteId: listingId!
        },
        refetchQueries: [{ query: AllListingsDocument }],
        onError: error => {
            console.log(error)
            // setLoading(false)
            throw new Error(error.toString())
        }
    })

    const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false)
    const deleteModal = (
        deleteConfirm ?
            <AnimatePresence>
                <motion.div className="modal-backdrop" onClick={() => setDeleteConfirm(false)} />
                <motion.div className="modal-backdrop-wrapper"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                >
                    <motion.span>
                        <motion.p>Are you sure you want to delete this listing?</motion.p>
                        <motion.em className="secondary">Deletions cannot be undone!</motion.em>
                    </motion.span>
                    <motion.span>
                        <motion.button className="btn-grey"
                            style={{ width: 75 }}
                            onClick={() => setDeleteConfirm(false)}
                        >
                            Cancel
                        </motion.button>
                        <motion.button className="delete-btn"
                            onClick={async () => {
                                await setDeleteConfirm(false)
                                // delete mutation
                                await deleteMutation()
                                navigate("/listings", { replace: true })
                            }}
                        >
                            Delete
                        </motion.button>
                    </motion.span>
                </motion.div>

            </AnimatePresence>
            : null
    )

    const [editMode, setEditMode] = useState<boolean>(false)
    const editListingData = listingData && Object.fromEntries(Object.entries(listingData?.getListing!).slice(2, 11))

    const [address1, setAddress1] = useState<string>()
    const [address2, setAddress2] = useState<string>()
    const [price, setPrice] = useState<string>()
    const [squareFt, setSquareFt] = useState<string>()
    const [beds, setBeds] = useState<number>(1)
    const [baths, setBaths] = useState<number>(1)
    const [status, setStatus] = useState<string>("Active")
    const [area, setArea] = useState<string>("Queens")
    const [description, setDescription] = useState<string>()

    const editState = {
        address1,
        address2,
        price,
        squareFt,
        beds,
        baths,
        status,
        area,
        description,
    }

    const editStateSetters = {
        setAddress1,
        setAddress2,
        setPrice,
        setSquareFt,
        setBeds,
        setBaths,
        setStatus,
        setArea,
        setDescription
    }

    const [allImages, setAllImages] = useState([] as any)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<boolean>()

    const [editMutation] = useEditMutation({
        refetchQueries: [{ query: AllListingsDocument }, { query: GetListingDocument, variables: { getListingId: listingId } }],
        awaitRefetchQueries: true,
        onError: error => {
            setLoading(false)
            setError(true)
            throw new Error(error.message)
        }
    })

    const EditTooltip = (
        editMode ?
            <motion.div className="edit-tooltip"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                Edit Mode is On
            </motion.div>
            : null
    )

    const [s3Sign] = useSignS3Mutation()
    const [s3UploadData, setS3UploadData] = useState([] as any)

    const submit = (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        setLoading(true)

        const editData: any = {}
        // if editState variable was updated, send to edit mutation
        Object.keys(editState).map((k) => {
            if (editState[k as keyof typeof editState]) {
                editData[k] = editState[k as keyof typeof editState]
            }
        })
        // add images to edit mutation, if none: null
        for (let i = 0; i < 4; i++) {
            const keyStr = 'image' + (i + 1)
            Object.assign(editData, {
                [keyStr]: allImages[i] ? allImages[i].url : null
            })
        }
        // edit mutation with listingId and editData
        editMutation({
            variables: {
                editId: listingId!,
                data: editData,
            },
        }).then(() => {
            // if s3UploadData... upload
            s3UploadData && Promise.all(s3UploadData.map(async (data: any) => {
                const options = {
                    headers: {
                        "Content-Type": data.file.type
                    }
                }
                await axios.put(data.signedRequest, data.file, options)
                    .catch(err => {
                        setLoading(false)
                        setError(true)
                        throw new Error(err)
                    })
            })).then(() => {
                // on success
                setEditMode(false)
                if (error) {
                    setError(false)
                }
                setLoading(false)
            })
        })
    }

    const loadingModal = (
        loading ?
            <div className="create-loading-modal">
                <div className="create-loading-modal-card">
                    <ScaleLoader color='#2c5990' />
                    Submitting edited listing...
                </div>
            </div>
            : null
    )

    const onDrop: any = useCallback(async (acceptedFiles: [File]) => {
        console.log(acceptedFiles)
        console.log('onDrop triggered')

        // const images = [...allImages] 
        // console.log(images)
        acceptedFiles.forEach(async (acceptedFile) => {
            const s3SignedRequest = await s3Sign({
                variables: {
                    filename: acceptedFile.name,
                    filetype: acceptedFile.type
                },
                onError: (err: any) => {
                    console.log(err)
                }
            })

            const signedRequest = s3SignedRequest?.data?.signS3?.signedRequest

            const url = s3SignedRequest.data?.signS3.url

            // images.push({"src": URL.createObjectURL(acceptedFile), "name": acceptedFile.name, "url": url})

            setAllImages((allImages: any) => [...allImages, { "src": URL.createObjectURL(acceptedFile), "name": acceptedFile.name, "url": url }])
            setS3UploadData((uploadData: any) => [...uploadData, { signedRequest, file: acceptedFile }])
        })
        console.log(allImages)
    }, [])
    console.log(s3UploadData)

    const imagesCount = allImages?.length

    const [toggleCarousel, setToggleCarousel] = useState<boolean>(false)
    const [currentIndex, setIndex] = useState<number>()

    const handleImg = (index: number) => {
        setIndex(index)
        setToggleCarousel(true)
    }

    const imageCarousel = (
        toggleCarousel ?
            <ImageCarousel
                allImages={allImages}
                toggleCarousel={toggleCarousel}
                setToggleCarousel={setToggleCarousel}
                currentIndex={currentIndex!}
                listingImages={listingImages}
                imagesCount={imagesCount}
            />
            : null
    )

    const cancel = () => {
        const images = [] as any
        Object.values(listingImages).filter(val => val !== null).forEach(imageUrl => {
            images.push({ "src": imageUrl, "name": null, "url": imageUrl })
        })
        console.log(images)
        setAllImages(images)
    }

    const errorModal = (
        error ?
            <div className="create-loading-modal">
                <div className="create-loading-modal-card">
                    <em>Oops! There was a problem with the edited listing!</em>
                    <p>Make sure all required fields are filled and try again.</p>
                    <button className="btn-grey" onClick={() => setError(false)}>Okay</button>
                </div>
            </div>
            : null
    )

    useEffect(() => {
        const images = [] as any
        Object.values(listingImages).filter(val => val !== null).forEach(imageUrl => {
            images.push({ "src": imageUrl, "name": null, "url": imageUrl })
        })
        setAllImages(images)
    }, [listingData])
    useEffect(() => {
        Geocode.fromAddress(address).then(
            (response) => {
                const { lat, lng } = response.results[0].geometry.location;
                console.log(lat, lng);
                setMapCenter({ lat, lng })
            },
            (error) => {
                console.error(error);
            }
        );
    }, [listingData])

    return listingData ? (
        <>
            {/* Event conditional components */}
            {imageCarousel}
            {deleteModal}
            {loadingModal}
            {errorModal}
            {/* -------------------------- */}
            <div className="wrapper">
                <motion.div className="listing-view-wrapper"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="listing-view-header">
                        <div className="listing-view-title">
                            <h5 onClick={() => navigate('/listings')}>Listings</h5>
                            <MdOutlineChevronRight size='20px' color='#000' />
                            <h5>Listing Details</h5>
                        </div>
                        {EditTooltip}
                        <div className="listing-view-actions">
                            {editMode ?
                                <motion.button className="btn-grey"
                                    style={{ width: 75 }}
                                    initial="hidden"
                                    animate="visible"
                                    variants={scaleVariant}
                                    onClick={() => {
                                        // reset all edit states
                                        setEditMode(false)
                                        setS3UploadData([])
                                        cancel()
                                    }}
                                >
                                    Cancel
                                </motion.button>
                                : <button className="delete-btn"
                                    onClick={() => setDeleteConfirm(true)}
                                >
                                    Delete
                                </button>
                            }
                            {editMode ?
                                <motion.button className="btn-primary edit-btn"
                                    onClick={(e) => submit(e)}
                                    initial="hidden"
                                    animate="visible"
                                    variants={scaleVariant}
                                >
                                    Submit
                                </motion.button>
                                : <button className="btn-primary edit-btn"
                                    onClick={() => {
                                        setEditMode(true)
                                    }
                                    }
                                >
                                    Edit
                                </button>
                            }
                        </div>
                    </div>
                    {editMode
                        ? <ListingEditView
                            allImages={allImages}
                            setAllImages={setAllImages}
                            handleImg={handleImg}
                            listingData={editListingData}
                            editStateSetters={editStateSetters}
                            onDrop={onDrop}
                            s3UploadData={s3UploadData}
                            setS3UploadData={setS3UploadData}
                        />
                        : (
                            <div className="listing-view">
                                <div className="listing-view-images">
                                    {/* images mosaic */}
                                    <motion.div className="listing-view-images-main"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        {listingImages[0] ?
                                            <motion.img src={listingImages[0]!} onClick={() => handleImg(0)}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                whileHover={{ scale: 1.05, transition: { duration: 0.25 } }}
                                            />
                                            : <p>No images for this listing!</p>}
                                    </motion.div>
                                    <div className={`listing-view-images-side 
                            ${imagesCount < 2 ? "display-none"
                                            : imagesCount == 2 ? "listing-view-images-side-2"
                                                : imagesCount == 3 ? "listing-view-images-side-3"
                                                    : ""
                                        }
                        `}>
                                        {Object.values(listingImages).slice(1).filter(val => val !== null).map((imageUrl, i) => {
                                            return (
                                                <motion.img
                                                    src={imageUrl!}
                                                    onClick={() => handleImg(i + 1)}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    whileHover={{ scale: 1.05, transition: { duration: 0.25 } }}
                                                />
                                            )
                                        })}
                                        {imagesCount == 4 &&
                                            <div className="listing-view-images-side-placeholder"
                                                onClick={() => handleImg(0)}
                                            >
                                                <span>View all</span>
                                                <span>➟</span>
                                            </div>
                                        }
                                    </div>
                                </div>

                                <div className="listing-view-text">
                                    {/* listing view text */}
                                    <div className="listing-view-text-head">
                                        <span>
                                            <h3>{listingData?.getListing?.address1}</h3>
                                            <h4>{listingData?.getListing?.address2}</h4>
                                        </span>
                                        <span>
                                            <h3>$ {listingData?.getListing?.price.toLocaleString()}</h3>
                                        </span>
                                    </div>
                                    <div className="listing-view-text-body">
                                        <div className="listing-view-text-details">
                                            <div className="listing-view-text-details-col">
                                                <span>
                                                    <h5>Beds</h5>
                                                    <p>{listingData?.getListing?.beds}</p>
                                                </span>
                                                <span>
                                                    <h5>Baths</h5>
                                                    <p>{listingData?.getListing?.baths}</p>
                                                </span>
                                                <span>
                                                    <h5>Square Ft.</h5>
                                                    <p>{listingData?.getListing?.squareFt}</p>
                                                </span>
                                            </div>
                                            <div className="listing-view-text-details-col">
                                                <span>
                                                    <h5>Area</h5>
                                                    <p>{listingData?.getListing?.area}</p>
                                                </span>
                                                <span>
                                                    <h5>Status</h5>
                                                    <p>{listingData?.getListing?.status}</p>
                                                </span>
                                                <span>
                                                    <h5>Type</h5>
                                                    <p>For Sale</p>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="listing-view-text-desc">
                                            <span>
                                                <h5>Description</h5>
                                                <p>{listingData?.getListing?.description}</p>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="listing-view-text-foot">
                                        <span>
                                            <h5>Date Created:</h5>
                                            <p>{new Date(listingData?.getListing?.dateCreated!).toLocaleString()}</p>
                                        </span>
                                        <span>
                                            <h5>Last Edited</h5>
                                            <p>{listingData?.getListing?.lastEdited == null ? "N/A" : new Date(listingData?.getListing?.lastEdited).toLocaleString()}</p>
                                        </span>
                                    </div>
                                    <div className="listing-view-map">
                                        <GoogleMap
                                            bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY! }}
                                            center={{ lat: mapCenter.lat, lng: mapCenter.lng }}
                                            defaultZoom={14}
                                        >
                                            <MapMarker lat={mapCenter.lat} lng={mapCenter.lng} address={(listingData?.getListing?.address1 + " " + listingData?.getListing?.address2)} />
                                        </GoogleMap>
                                    </div>
                                </div>
                            </div>
                        )}
                    {/* ----- Listing View ----- */}
                </motion.div>
            </div>
        </>
    ) : null
}

export default ListingView
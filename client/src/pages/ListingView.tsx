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

    const [deleteMutation, { loading: deleteLoading }] = useDeleteMutation({
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
                        <motion.button className="cancel-btn"
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
    const [price, setPrice] = useState<number>()
    const [squareFt, setSquareFt] = useState<number>()
    const [beds, setBeds] = useState<number>(1)
    const [baths, setBaths] = useState<number>(1)
    const [status, setStatus] = useState<string>("Active")
    const [area, setArea] = useState<string>("Queens")
    const [description, setDescription] = useState<string>()

    const editState = {
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
    // const [prevImages, setPrevImages] = useState<string[] | []>([])

    // const setImagesForEdit = () => {
    //     const unchangedImages = [] as any
    //     Object.values(listingImages).filter(val => val !== null).forEach((imageUrl, i) => {
    //         if (imageUrl == allImages[i]) {
    //             unchangedImages.push(imageUrl)
    //         }
    //     })
    //     setPrevImages(unchangedImages)
    // }

    const [editMutation, { data: editData }] = useEditMutation({
        variables: {
            editId: listingId!,
            data: {
                address1,
                address2,
                price,
                squareFt,
                beds,
                baths,
                status,
                area,
                description,
                image1: allImages[0] ? allImages[0].url : null,
                image2: allImages[1] ? allImages[1].url : null,
                image3: allImages[2] ? allImages[2].url : null,
                image4: allImages[3] ? allImages[3].url : null,
                image5: allImages[4] ? allImages[4].url : null,
            }
        },
        refetchQueries: [{ query: AllListingsDocument }, { query: GetListingDocument, variables: { getListingId: listingId } }],
        awaitRefetchQueries: true,
        onError: error => {
            console.log(error)
            setLoading(false)
            throw new Error(error.toString())
        }
    })

    const EditToolip = (
        editMode ?
            <motion.div className="edit-tooltip"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                Edit Mode is On
            </motion.div>
            : null
    )

    const [loading, setLoading] = useState<boolean>(false)
    const [s3Sign] = useSignS3Mutation()
    const [s3UploadData, setS3UploadData] = useState([] as any)

    const submit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault()

        setLoading(true)

        await editMutation()
            .then(() => {
                // if s3UploadData... upload
                s3UploadData && s3UploadData.forEach(async (data: any) => {
                    const options = {
                        headers: {
                            "Content-Type": data.file.type
                        }
                    }
                    await axios.put(data.signedRequest, data.file, options)
                        .then((res) => {
                            console.log(res)
                        })
                        .catch(err => {
                            console.log(err)
                            setLoading(false)
                            throw new Error(err)
                        })
                })
            })
            .then(() => setLoading(false))
            .then(() => navigate(0))
            .catch((err) => {
                console.log(err)
                throw new Error(err)
            })
    }

    const loadingModal = (
        loading ?
            <div className="create-loading-modal">
                <div className="create-loading-modal-card">
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
        await acceptedFiles.forEach(async (acceptedFile) => {
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

    console.log(allImages)
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
            {/* -------------------------- */}
            <div className="wrapper">
                <motion.div className="listing-view-wrapper"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="listing-view-header">
                        <div className="listing-view-back">
                            <button className="back-btn" onClick={() => navigate("/listings")}>
                                ← Back to Listings
                            </button>
                        </div>
                        {EditToolip}
                        <div className="listing-view-actions">
                            {editMode ?
                                <motion.button className="cancel-btn"
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
                                <motion.button className="edit-btn"
                                    onClick={(e) => submit(e)}
                                    initial="hidden"
                                    animate="visible"
                                    variants={scaleVariant}
                                >
                                    Submit
                                </motion.button>
                                : <button className="edit-btn"
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
                            editState={editState}
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
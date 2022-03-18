import React, { useCallback, useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom";
import { AllListingsDocument, useDeleteMutation, useEditMutation, useGetListingQuery, useSignS3Mutation } from "../generated/graphql";
import GoogleMap from "google-map-react"
import Geocode from "react-geocode"
import {AnimatePresence, motion} from "framer-motion"
import ImageCarousel from "../components/ImageCarousel"
import ListingEditView from "../components/ListingEditView"
import { useDropzone } from "react-dropzone";

interface MapMarkerProps {
    lat: number,
    lng: number
}

const MapMarker: React.FC<MapMarkerProps> = () => {
    return (
        <>
        <div className="map-marker" />
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

function ListingView(){
    const {listingId} = useParams()
    const navigate = useNavigate()

    const scaleVariant = {
        hidden: {scale: 0, opacity: 0},
        visible: {scale: 1, opacity: 1}
    }

    const {data: listingData} = useGetListingQuery({
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

    const imagesCount = Object.values(listingImages).filter(val => val !== null).length

    console.log(listingImages)

    const [mapCenter, setMapCenter] = useState({lat: null, lng: null} as any)
    const address:string = listingData?.getListing?.address1 + " " + listingData?.getListing?.address2
    console.log(address, mapCenter)

    // set Google Maps Geocoding API
    Geocode.setApiKey(process.env.REACT_APP_GOOGLE_MAPS_API_KEY!);
    Geocode.setLanguage("en");
    Geocode.setRegion("us");

    const [deleteMutation, {loading: deleteLoading}] = useDeleteMutation({
        variables: {
            deleteId: listingId!
        },
        refetchQueries: [{query: AllListingsDocument}],
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
        <motion.div className="modal-backdrop" onClick={() => setDeleteConfirm(false)}/>
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
                        onClick={ async() => {
                            await setDeleteConfirm(false)
                            // delete mutation
                            await deleteMutation()
                            navigate("/listings", {replace: true})
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

    const [editMutation, {data: editData}] = useEditMutation({
        variables: {
            editId: listingId!,
            data: {
                address1,
                address2,
                price,
                beds,
                baths,
                squareFt,
                status,
                area,
                description,
                // image1: imageUrls[0] || null,
                // image2: imageUrls[1] || null,
                // image3: imageUrls[2] || null,
                // image4: imageUrls[3] || null,
                // image5: imageUrls[4] || null,
            }
        },
        onError: error => {
            console.log(error)
            // setLoading(false)
            throw new Error(error.toString())
        }
    })

    const [loading, setLoading] = useState<boolean>(false)

    const submit = async(e: { preventDefault: () => void; }) => {
        e.preventDefault()
        setLoading(true)
        setEditMode(false)
        await editMutation()

        setLoading(false)
        // return navigate(`/listings/${listingId}`)
        return
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

    const [toggleCarousel, setToggleCarousel] = useState<boolean>(false)
    const [currentIndex, setIndex] = useState<number>()

    const handleImg = (index:number) => {
        setIndex(index)
        setToggleCarousel(true)
    }

    const imageCarousel = (
        toggleCarousel ?
        <ImageCarousel 
            toggleCarousel={toggleCarousel}
            setToggleCarousel={setToggleCarousel}
            currentIndex={currentIndex!}
            listingImages={listingImages}
            imagesCount={imagesCount}
        />
        : null
    )
    
    const [imageFiles, setImageFiles] = useState<ImagesFiles>({
        0: null,
        1: null,
        2: null,
        3: null,
        4: null,
    })
    console.log(imageFiles)
    const [s3Sign, {loading: s3SignLoading}] = useSignS3Mutation()
    const [s3UploadData, setS3UploadData] = useState([] as any)

    const onDrop:any = useCallback(async(acceptedFile:File) => {
        console.log(acceptedFile)
        
        let fileName = acceptedFile.name.replace(/\..+$/, "");
            
        console.log(acceptedFile.type, acceptedFile.name, acceptedFile)
        

        const s3SignedRequest = await s3Sign({
            variables: {
                filename: fileName,
                filetype: acceptedFile.type
            },
            onError: (err:any) => {
                console.log(err)
            }
        })

        const signedRequest = s3SignedRequest?.data?.signS3?.signedRequest

        console.log(s3SignedRequest.data?.signS3.url)

        // await setImageUrls((imageUrls:[]) => [...imageUrls, s3SignedRequest?.data?.signS3?.url])
        // })
        setS3UploadData([...s3UploadData, {signedRequest, acceptedFile}])
        return
    }, [])
    
    const {
        getRootProps,
        getInputProps,
    } = useDropzone({
        accept: 'image/jpeg,image/png',
        maxFiles: 1,
        onDrop
    });

    useEffect(() => {
        Geocode.fromAddress(address).then(
            (response) => {
                const { lat, lng } = response.results[0].geometry.location;
                console.log(lat, lng);
                setMapCenter({lat, lng})
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
            <div className="listing-view-wrapper">
                <div className="listing-view-header">
                    <div className="listing-view-back">
                        <button className="back-btn" onClick={() => navigate(-1)}>
                            ← Back to Listings
                        </button>
                    </div>
                    <div className="listing-view-actions">
                        {editMode ? 
                        <motion.button className="cancel-btn"
                            onClick={() => setEditMode(false)}
                            initial="hidden"
                            animate="visible"
                            variants={scaleVariant}
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
                            onClick={() => setEditMode(true)}
                        >
                            Edit
                        </button>
                        }
                    </div>
                </div>
                { editMode 
                ? <ListingEditView 
                    listingImages={listingImages}
                    imagesCount={imagesCount}
                    handleImg={handleImg}
                    listingData={editListingData} 
                    editState={editState}
                    onDrop={onDrop}
                    imageFiles={imageFiles}
                    setImageFiles={setImageFiles}
                /> 
                : (
                <div className="listing-view">
                    <div className="listing-view-images">
                        {/* images carousel */}
                        <div className="listing-view-images-main">
                            <img src={listingImages[0]!} onClick={() => handleImg(0)} />
                        </div>
                        <div className={`listing-view-images-side 
                            ${
                                imagesCount == 1 ? "display-none"
                                : imagesCount == 2 ? "listing-view-images-side-2"
                                : imagesCount == 3 ? "listing-view-images-side-3"
                                : ""
                            }
                        `}>
                            {Object.values(listingImages).slice(1).filter(val => val !== null).map((imageUrl, i) => {
                                return <img src={imageUrl!} onClick={() => handleImg(i + 1)} />
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
                                <p>{listingData?.getListing?.lastEdited == null ? "N/A" : listingData?.getListing?.lastEdited}</p>
                            </span>
                        </div>
                        <div className="listing-view-map">
                            <GoogleMap
                                bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY! }}
                                center={{lat: mapCenter.lat, lng: mapCenter.lng}}
                                defaultZoom={14}
                            >
                                <MapMarker lat={mapCenter.lat} lng={mapCenter.lng}/>
                            </GoogleMap>
                        </div>
                    </div>
                </div>
                )}
                {/* ----- Listing View ----- */}
            </div>
        </div>
        </>
    ) : null
}

export default ListingView
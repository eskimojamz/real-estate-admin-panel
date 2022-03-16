import React, { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom";
import { useGetListingQuery } from "../generated/graphql";
import GoogleMap from "google-map-react"
import Geocode from "react-geocode"
import ImageCarousel from "../components/ImageCarousel"


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

function ListingView(){
    const {listingId} = useParams()
    const navigate = useNavigate()
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

    const [toggleCarousel, setToggleCarousel] = useState<boolean>(false)
    const [currentIndex, setIndex] = useState<number>()

    const handleImg = (index:number) => {
        setIndex(index)
        setToggleCarousel(true)
    }

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
        { toggleCarousel ?
            <ImageCarousel 
                toggleCarousel={toggleCarousel}
                setToggleCarousel={setToggleCarousel}
                currentIndex={currentIndex}
                listingImages={listingImages}
                imagesCount={imagesCount}
            />
            : null

        }
        <div className="wrapper">
            <div className="listing-view-wrapper">
                <div className="listing-view-header">
                    <div className="listing-view-back">
                        <button className="back-btn" onClick={() => navigate(-1)}>
                            ← Back to Listings
                        </button>
                    </div>
                    <div className="listing-view-actions">
                        <button className="delete-btn">Delete</button>
                        <button className="edit-btn">Edit</button>
                    </div>
                </div>

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
            </div>
        </div>
        </>
    ) : null
}

export default ListingView
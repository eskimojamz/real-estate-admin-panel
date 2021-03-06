import {useEffect, useState} from "react"
import GoogleMap from "google-map-react"
import Geocode from "react-geocode"
import {AnimatePresence, motion} from "framer-motion"
import { useGetListingQuery } from "../generated/graphql"
import { useNavigate } from "react-router-dom"

interface Props {
    listings: any;
}

interface MapMarkerProps {
    listingId: string;
    lat: number;
    lng: number;
    setCurrentMapListing: React.Dispatch<React.SetStateAction<string | undefined>>;
}

interface MapMarkerListingProps {
    listingId: string;
    setCurrentMapListing: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const MapMarker: React.FC<MapMarkerProps> = ({listingId, setCurrentMapListing}) => {

    return (
        <>
        <motion.div className="map-marker" 
            onClick={() => setCurrentMapListing(listingId)}
            initial={{scale: 0, opacity:0}}
            animate={{scale: 1, opacity:1}}
            transition={{type: 'spring', damping:5, delay: 0.5}}
        />
        </>
    )
}

const MapMarkerListing: React.FC<MapMarkerListingProps> = ({listingId, setCurrentMapListing}) => {
    const {data: listingData} = useGetListingQuery({
        variables: { getListingId: listingId }
    })

    const navigate = useNavigate()

    return (
        <>
        <AnimatePresence>
        {listingId && (
        <motion.div className="map-marker-listing"
            key="map-marker-listing"
            initial={{x: -10, opacity: 0}}
            animate={{x: 0, opacity:1}}
            exit={{x: -10, opacity: 0, transition: {duration: 0.25} }}
        >
            <div className="map-marker-listing-image">
                <motion.img src={listingData?.getListing?.image1!} 
                    onClick={() => navigate(listingId)}
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                />
                {/* close button */}
                <button className="map-marker-listing-close"
                    onClick={() => setCurrentMapListing(undefined)}
                >
                    {/* <button className="map-marker-listing-close-btn">
                        
                    </button> */}
                </button>
            </div>
            <div className="map-marker-listing-details">
            
                <h4>{listingData?.getListing?.address1}</h4>
                <h5 className="map-marker-listing-address2">{listingData?.getListing?.address2}</h5>
                <h4>$ {listingData?.getListing?.price.toLocaleString()}</h4>
    
            </div>
            <div className="map-marker-listing-bottom">
                <span className="map-marker-listing-details">
                    <span>
                        <span>
                            <h5>Beds:</h5>
                            <p>{listingData?.getListing?.beds}</p>
                        </span>
                        <span>
                            <h5>Baths:</h5>
                            <p>{listingData?.getListing?.baths}</p>
                        </span>
                    </span>
                    <span>
                        <h5>Status:</h5>
                        <p className={`${listingData?.getListing?.status == "Active" ? "status-active" : "status-sold"}`}>{listingData?.getListing?.status}</p>
                    </span>
                </span>
                <span className="map-marker-listing-button">
                    <button className="map-marker-listing-submit submit-btn" 
                        onClick={() => {
                            setCurrentMapListing(undefined)
                            navigate(listingId)
                        }}
                    >
                        View
                    </button>
                </span>
            </div>
        </motion.div>
        )}
        </AnimatePresence>
        </>
    )
}

const Map:React.FC<Props> = ({listings}) => {
    // set Google Maps Geocoding API
    Geocode.setApiKey(process.env.REACT_APP_GOOGLE_MAPS_API_KEY!);
    Geocode.setLanguage("en");
    Geocode.setRegion("us");

    const [mapMarkers, setMapMarkers] = useState([] as any)
    console.log(mapMarkers)
    const [currentMapListing, setCurrentMapListing] = useState<MapMarkerProps['listingId']>()

    useEffect(() => {
        if (listings) {
            // reset map markers for search filter
            setMapMarkers([])
            // map coordinates and set map markers
            listings.map((listing: { id: string; address1: string; address2: string; }) => {
                const address:string = listing.address1 + listing.address2
                Geocode.fromAddress(address).then(
                    (response) => {
                        const { lat, lng } = response.results[0].geometry.location;
                        // {lat, lng} are google-map-react component props
                        setMapMarkers((mapMarkers: any) => [...mapMarkers, <MapMarker listingId={listing.id} lat={lat} lng={lng} setCurrentMapListing={setCurrentMapListing}/>])
                    },
                    (error) => {
                        console.error(error);
                    }
                );
            })
        }
    }, [listings])

    return (
        <div className="listings-map">
            <GoogleMap
                bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY! }}
                center={{lat: 40.7427, lng: -73.8524}}
                defaultZoom={12}
                options={{
                    fullscreenControl: false,
                    scrollwheel: true,
                }}
            >
                {mapMarkers}
            </GoogleMap>
            {<MapMarkerListing listingId={currentMapListing!} setCurrentMapListing={setCurrentMapListing} />}
        </div>
    )
}

export default Map
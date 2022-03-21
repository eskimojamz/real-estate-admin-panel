import {useEffect, useState} from "react"
import GoogleMap from "google-map-react"
import Geocode from "react-geocode"

interface Props {
    listings: any;
    setListings: React.Dispatch<any>;
}

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

const Map:React.FC<Props> = ({listings, setListings}) => {
    // set Google Maps Geocoding API
    Geocode.setApiKey(process.env.REACT_APP_GOOGLE_MAPS_API_KEY!);
    Geocode.setLanguage("en");
    Geocode.setRegion("us");

    const [mapMarkerCoordinates, setMapMarkerCoordinates] = useState([] as any)
    console.log(mapMarkerCoordinates)

    useEffect(() => {
        if (listings) {
        const coordinates: { lat: number; lng: number }[] = []
        listings.forEach((listing: { address1: any; address2: any }) => {
            const address:string = listing.address1 + listing.address2
            Geocode.fromAddress(address).then(
                (response) => {
                    const { lat, lng } = response.results[0].geometry.location;
                    setMapMarkerCoordinates((mapMarkerCoordinates: any) => [...mapMarkerCoordinates, { lat, lng }])
                },
                (error) => {
                    console.error(error);
                }
            );
        })
        
        }
    }, [])
    return mapMarkerCoordinates ? (
        <GoogleMap
            bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY! }}
            center={{lat: 40.7427, lng: -73.8524}}
            defaultZoom={12}
        >
            {mapMarkerCoordinates.map((marker: { lat: number; lng: number }) => <MapMarker lat={marker.lat} lng={marker.lng} /> )}
        </GoogleMap>
    ):null
}

export default Map
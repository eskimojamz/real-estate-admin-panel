import { useNavigate } from "react-router-dom"
import deleteIcon from "../assets/deleteIcon.svg"
import editIcon from "../assets/editIcon.svg"

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

function Table({listings}:any) {
    const navigate = useNavigate()

    return (
        <>
        <table>
            <thead>
                <tr className="thead-row">
                    {/* Image */}
                    <th></th>
                    {/*  */}
                    <th>ADDRESS</th>
                    <th>PRICE</th>
                    <th>BEDS</th>
                    <th>BATHS</th>
                    <th>STATUS</th>
                    <th>AREA</th>
                    <th>CREATED</th>
                    <th>EDITED</th>
                    <th>ACTIONS</th>
                </tr>
            </thead>
            
            <tbody>
                {listings?.map((listing:listing) => {
                    const listingId = listing.id

                    return (
                    <>
                    <tr id={listing.id} onClick={() => navigate(`${listing.id!}`)}>
                        <td><img src={listing.image1}/></td>
                        <td>
                            <p className="address1">{listing.address1}</p>
                            <p className="address2">{listing.address2}</p>
                        </td>
                        <td>
                            <p className="td-p-bold">$ {listing.price.toLocaleString('en-US')}</p>
                        </td>
                        <td>
                            <p className="td-p-bold">{listing.beds}</p>
                        </td>
                        <td>
                            <p className="td-p-bold">{listing.baths}</p>
                        </td>
                        <td><p className={`td-p-bold ${listing.status == "Active" ? "td-p-active" : "td-p-sold"}`}>{listing.status}</p></td>
                        <td><p className="td-p-bold">{listing.area}</p></td>
                        <td><p className="td-p-bold">{new Date(listing.dateCreated).toLocaleDateString()}</p></td>
                        <td><p className="td-p-bold">{listing.lastEdited !== null && new Date(listing.lastEdited).toLocaleDateString()}</p></td>
                        <td>
                            <button id={listingId} className="td-delete"><img src={deleteIcon}/></button>
                            <button id={listingId} className="td-edit"><img src={editIcon}/></button>
                        </td>
                    </tr>
                    </>
                    )
                })}
            </tbody>
        </table>
        </>
    )
}

export default Table
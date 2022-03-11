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

    return (
        <>
        <table>
            <thead>
                <tr className="thead-row">
                    {/* Image */}
                    <th></th>
                    {/*  */}
                    <th>Address</th>
                    <th>Price</th>
                    <th>Bedrooms</th>
                    <th>Bathrooms</th>
                    <th>Status</th>
                    <th>Area</th>
                    <th>Created</th>
                    <th>Edited</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <br></br>
            <tbody>
                {listings?.map((listing:listing) => {
                    const listingId = listing.id

                    return (
                    <>
                    <tr>
                        <td><img src={listing.image1}/></td>
                        <td>
                            <p className="address1">{listing.address1}</p>
                            <p className="address2">{listing.address2}</p>
                        </td>
                        <td>
                            <p className="td-p-bold">$ {listing.price}</p>
                        </td>
                        <td>
                            <p className="td-p-bold">{listing.beds}</p>
                        </td>
                        <td>
                            <p className="td-p-bold">{listing.baths}</p>
                        </td>
                        <td><p className={`td-p-bold ${listing.status == "Active" ? "td-p-active" : "td-p-sold"}`}>{listing.status}</p></td>
                        <td><p className="td-p-bold">{listing.area}</p></td>
                        <td><p className="td-p-bold">{listing.dateCreated}</p></td>
                        <td><p className="td-p-bold">{listing.lastEdited}</p></td>
                        <td>
                            <button id={listingId} className="td-edit">Edit</button>
                            <button id={listingId} className="td-view">View</button>
                        </td>
                    </tr>
                    <br></br>
                    </>
                    )
                })}
            </tbody>
        </table>
        </>
    )
}

export default Table
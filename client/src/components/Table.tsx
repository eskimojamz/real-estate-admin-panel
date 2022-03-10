function Table() {
    const listings = [
        {
            "id": "23432-fdsf-4343",
            "address1": "100 St",
            "address2": "Bayside, NY 11237",
            "price": 500000,
            "beds": 2,
            "baths": 2,
            "squareFt": 3500,
            "description": "Great house",
            "dateCreated": "",
            "lastEdited": "",
            "image1": "",
            "image2": "",
            "image3": "",
            "image4": "",
            "image5": ""
          },
          {
            "id": "544dea2f-0b87-47c9-b1b7-0872ba7c58fc",
            "address1": "Happy St",
            "address2": "Bayside, NY 11237",
            "price": 500000,
            "beds": 2,
            "baths": 2,
            "squareFt": 3500,
            "description": "Great house",
            "dateCreated": "",
            "lastEdited": "",
            "image1": "",
            "image2": "",
            "image3": "",
            "image4": "",
            "image5": ""
          },
          {
            "id": "23-sdf43-434fdsf",
            "address1": "100 St",
            "address2": "Bayside, NY 11237",
            "price": 500000,
            "beds": 2,
            "baths": 2,
            "squareFt": 3500,
            "description": "Great house",
            "dateCreated": "",
            "lastEdited": "",
            "image1": "",
            "image2": "",
            "image3": "",
            "image4": "",
            "image5": ""
          },
          {
            "id": "544dea2f-0b87-47c9-b1b7-0872ba7c58fc",
            "address1": "Happy St",
            "address2": "Bayside, NY 11237",
            "price": 500000,
            "beds": 2,
            "baths": 2,
            "squareFt": 3500,
            "description": "Great house",
            "dateCreated": "",
            "lastEdited": "",
            "image1": "abc",
            "image2": "",
            "image3": "",
            "image4": "",
            "image5": ""
          }
    ]
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
                    <th>Created</th>
                    <th>Status</th>
                    <th>Area</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <br></br>
            <tbody>
                {listings?.map(listing => {
                    const listingId = listing.id

                    return (
                    <>
                    <tr>
                        <td>{Object.values(listing)[10]}</td>
                        <td>
                            <p className="address1">{Object.values(listing)[1]}</p>
                            <p className="address2">{Object.values(listing)[2]}</p>
                        </td>
                        <td>
                            <p className="td-p-bold">$ {Object.values(listing)[3]}</p>
                        </td>
                        <td>
                            <p className="td-p-bold">{Object.values(listing)[4]}</p>
                        </td>
                        <td>
                            <p className="td-p-bold">{Object.values(listing)[5]}</p>
                        </td>
                        <td>{Object.values(listing)[8]}</td>
                        <td>Status</td>
                        <td>Area</td>
                        <td>
                            <button id={listingId} className="td-edit">Edit</button>
                            <button id={listingId}>View</button>
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
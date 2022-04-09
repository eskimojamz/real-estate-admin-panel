import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import deleteIcon from "../assets/deleteIcon.svg"
import editIcon from "../assets/editIcon.svg"
import Pagination from "../utils/pagination/Pagination"

interface Props {
    results: any;
}

interface Listing {
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

interface SortConfig {
    key: string;
    direction: string;
}

const Table: React.FC<Props> = ({ results }) => {
    const navigate = useNavigate()

    const [currentPage, setCurrentPage] = useState<number>(1)
    const pageSize = Math.floor((window.innerHeight - 230) / 65)


    const useSortableData = (items: any = results, config = { key: 'dateCreated', direction: 'descending' }) => {
        const [sortConfig, setSortConfig] = useState<SortConfig | null>(config);

        const sortedItems = useMemo(() => {
            let sortableItems = [...items];
            if (sortConfig !== null) {
                sortableItems.sort((a, b) => {
                    if (a[sortConfig.key] < b[sortConfig.key]) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (a[sortConfig.key] > b[sortConfig.key]) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                    return 0;
                });
            }
            return sortableItems;
        }, [items, sortConfig]);

        const requestSort = (key: any) => {
            let direction = 'ascending';
            if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
                direction = 'descending';
            }
            setSortConfig({ key, direction });
        }

        return { sortedResults: sortedItems, requestSort, sortConfig };
    }

    const { sortedResults, requestSort, sortConfig } = useSortableData(results);

    const paginatedResults = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * pageSize;
        const lastPageIndex = firstPageIndex + pageSize;
        return sortedResults?.slice(firstPageIndex, lastPageIndex);
    }, [sortedResults, currentPage]);

    const getClassNamesFor = (name: string) => {
        if (!sortConfig) {
            return;
        }
        return sortConfig.key === name ? sortConfig.direction : undefined;
    };

    return (
        <>
            <div className="listings-table">
                <table>
                    <thead>
                        <tr className="thead-row">
                            {/* Image */}
                            <th></th>
                            {/*  */}
                            <th>ADDRESS</th>
                            <th className={`filterable ${getClassNamesFor('price')}`}
                                onClick={() => requestSort('price')}
                            >
                                PRICE
                            </th>
                            <th className={`filterable ${getClassNamesFor('beds')}`}
                                onClick={() => requestSort('beds')}
                            >
                                BEDS
                            </th>
                            <th className={`filterable ${getClassNamesFor('baths')}`}
                                onClick={() => requestSort('baths')}
                            >
                                BATHS
                            </th>
                            <th className={`filterable ${getClassNamesFor('status')}`}
                                onClick={() => requestSort('status')}
                            >
                                STATUS
                            </th>
                            <th className={`filterable ${getClassNamesFor('area')}`}
                                onClick={() => requestSort('area')}
                            >
                                AREA
                            </th>
                            <th
                                className={`filterable ${getClassNamesFor('dateCreated')}`}
                                onClick={() => requestSort('dateCreated')}
                            >
                                CREATED
                            </th>
                            <th className={`filterable ${getClassNamesFor('lastEdited')}`}
                                onClick={() => requestSort('lastEdited')}
                            >
                                EDITED
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {paginatedResults && paginatedResults?.map((listing: any) => {
                            const listingId = listing?.id

                            return (
                                <>
                                    <tr id={listingId} onClick={() => navigate(`${listingId}`)}>
                                        <td><img src={listing.image1} /></td>
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
                                        <td><p className={`td-p-bold ${listing.status == "Active" ? "status-active" : "status-sold"}`}>{listing.status}</p></td>
                                        <td><p className="td-p-bold">{listing.area}</p></td>
                                        <td><p className="td-p-bold">{new Date(listing.dateCreated).toLocaleDateString()}</p></td>
                                        <td><p className="td-p-bold">{listing.lastEdited !== null && new Date(listing.lastEdited).toLocaleDateString()}</p></td>
                                        {/* <td>
                            <button id={listingId} className="table-view-btn" onClick={() => navigate(listingId)}></button>
                        </td> */}
                                    </tr>
                                </>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div className="table-footer">
                <Pagination
                    className="pagination-bar"
                    currentPage={currentPage}
                    totalCount={sortedResults?.length}
                    pageSize={pageSize}
                    onPageChange={(page: number) => {
                        setCurrentPage(page)
                    }}
                />
            </div>
        </>
    )
}

export default Table
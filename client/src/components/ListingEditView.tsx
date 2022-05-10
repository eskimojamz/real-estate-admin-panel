import React from "react"
import { motion } from "framer-motion"
import Dropzone from "react-dropzone"
import { LazyLoadImage } from "react-lazy-load-image-component"
import Skeleton from "react-loading-skeleton"

interface EditProps {
    allImages: any;
    setAllImages: (value: any) => void;
    handleImg: (index: number) => void;
    listingData: any;
    editStateSetters: any;
    onDrop: any;
    s3UploadData: [];
    setS3UploadData: React.Dispatch<any>;
}

const editVariants = {
    hidden: { y: -10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
}

const ListingEditView: React.FC<EditProps> = ({ allImages, setAllImages, handleImg, listingData, editStateSetters, onDrop, s3UploadData, setS3UploadData }) => (


    <div className="listing-view-card">
        <div className="listing-view-images">
            {/* images carousel */}
            <div className="listing-view-images-main">
                <span className="listing-view-img-main">
                    {allImages.length > 0 ?
                        <>
                            <motion.img className="edit-img-main"
                                src={allImages[0].src!}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => handleImg(0)}
                            />
                            <motion.button className="edit-img-main-close"
                                onClick={() => {
                                    // remove file from upload data
                                    setS3UploadData(s3UploadData.filter((data: any) =>
                                        data.file.name !== allImages[0 as keyof EditProps['allImages']].name
                                    )
                                    )
                                    // remove image from cache state
                                    const images = [...allImages]
                                    images.splice(0, 1)
                                    setAllImages(images)
                                }}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                            />
                        </>
                        :
                        <Dropzone
                            accept={['image/jpeg', 'image/png']}
                            maxFiles={(5 - allImages.length)}
                            onDrop={onDrop}
                        >
                            {({ getRootProps, getInputProps }) => (
                                <div {...getRootProps()} className="edit-main-dropzone">
                                    <input {...getInputProps()} />
                                    <p>Click / Drop</p>
                                </div>
                            )}
                        </Dropzone>
                    }
                </span>
            </div>
            {allImages.length > 0 &&
                <div className="listing-view-images-side">
                    {allImages.length > 1 &&
                        allImages.slice(1).map((image: any, i: number) => {
                            return (
                                <span className="listing-view-img-side edit-span-h-sm">
                                    <motion.img className="edit-img-side"
                                        src={image.src}
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        onClick={() => handleImg(i + 1)}
                                    />
                                    <motion.button className="edit-img-side-close"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        onClick={(e: any) => {
                                            e.preventDefault()
                                            // remove file from upload data
                                            setS3UploadData(s3UploadData.filter((data: any) =>
                                                data.file.name !== allImages[i + 1 as keyof EditProps['allImages']].name
                                            )
                                            )
                                            // remove image from cache state
                                            // setAllImages(allImages.filter((imageData:any) => imageData.src !== image.src))
                                            const images = [...allImages]
                                            images.splice(i + 1, 1)
                                            setAllImages(images)
                                        }}
                                    />
                                </span>
                            )
                        })
                    }
                    {allImages.length > 0 && allImages.length < 5 ?
                        <motion.span className={`listing-view-img-side ${allImages.length == 1 ? "edit-span-full" : "edit-span-h-sm"}`}
                            initial="hidden"
                            animate="visible"
                            variants={editVariants}
                        >
                            <Dropzone
                                accept={['image/jpeg', 'image/png']}
                                maxFiles={(5 - allImages.length)}
                                onDrop={onDrop}
                            >
                                {({ getRootProps, getInputProps }) => (
                                    <div {...getRootProps()} className={`edit-side-dropzone ${allImages.length == 1 && "edit-side-dropzone-full"}`}>
                                        <input {...getInputProps()} />
                                        <p>Click or Drop</p>
                                    </div>
                                )}
                            </Dropzone>
                        </motion.span>
                        : null
                    }
                </div>
            }
        </div>

        <motion.div className="listing-view-text">
            {/* listing view text */}
            <motion.div className="listing-view-text-head">
                <motion.span>
                    <motion.h5>Address</motion.h5>
                    <motion.input className="edit-address1"
                        defaultValue={listingData?.address1}
                        onChange={e => editStateSetters.setAddress1(e.target.value)}
                        initial="hidden"
                        animate="visible"
                        variants={editVariants}
                    />
                    <motion.input className="edit-address2"
                        defaultValue={listingData?.address2}
                        onChange={e => editStateSetters.setAddress2(e.target.value)}
                        initial="hidden"
                        animate="visible"
                        variants={editVariants}
                    />
                </motion.span>
                <motion.span>
                    <motion.h5>Price</motion.h5>
                    <motion.div className="edit-price-relative"
                        initial="hidden"
                        animate="visible"
                        variants={editVariants}
                    >
                        <motion.span className="edit-dollar">$</motion.span>
                        <motion.input className="edit-price"
                            defaultValue={listingData?.price.toString()}
                            onChange={e => editStateSetters.setPrice(parseInt(e.target.value.replace(/\D/g, '')))}

                        />
                    </motion.div>
                </motion.span>
            </motion.div>
            <motion.div className="listing-view-text-body">
                <motion.div className="listing-view-text-details">
                    <motion.div className="listing-view-text-details-col">
                        <motion.span>
                            <motion.h5>Beds</motion.h5>
                            <motion.select
                                defaultValue={listingData?.beds.toString()}
                                onChange={e => editStateSetters.setBeds(parseInt(e.target.value))}
                                initial="hidden"
                                animate="visible"
                                variants={editVariants}
                            >
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                            </motion.select>
                        </motion.span>
                        <motion.span>
                            <motion.h5>Baths</motion.h5>
                            <motion.select
                                defaultValue={listingData?.baths.toString()}
                                onChange={e => editStateSetters.setBaths(parseInt(e.target.value))}
                                initial="hidden"
                                animate="visible"
                                variants={editVariants}
                            >
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                            </motion.select>
                        </motion.span>
                        <motion.span>
                            <motion.h5>Square Ft.</motion.h5>
                            <motion.input className="edit-squareFt"
                                defaultValue={listingData?.squareFt.toString()}
                                onChange={e => editStateSetters.setSquareFt(parseInt(e.target.value.replace(/\D/g, '')))}
                                initial="hidden"
                                animate="visible"
                                variants={editVariants}
                            />
                        </motion.span>
                    </motion.div>
                    <motion.div className="listing-view-text-details-col">
                        <motion.span>
                            <motion.h5>Area</motion.h5>
                            <motion.select
                                defaultValue={listingData?.area}
                                onChange={e => editStateSetters.setArea(e.target.value)}
                                initial="hidden"
                                animate="visible"
                                variants={editVariants}
                            >
                                <option value="Queens">Queens</option>
                                <option value="Brooklyn">Brooklyn</option>
                                <option value="Long Island">Long Island</option>
                                <option value="Manhattan">Manhattan</option>
                                <option value="Bronx">Bronx</option>
                                <option value="New Jersey">New Jersey</option>
                                <option value="Staten Island">Staten Island</option>
                            </motion.select>
                        </motion.span>
                        <motion.span>
                            <motion.h5>Status</motion.h5>
                            <motion.select
                                defaultValue={listingData?.status}
                                onChange={e => editStateSetters.setStatus(e.target.value)}
                                initial="hidden"
                                animate="visible"
                                variants={editVariants}
                            >
                                <option value="Active">Active</option>
                                <option value="Sold">Sold</option>
                            </motion.select>
                        </motion.span>
                        <motion.span>
                            <motion.h5>Type</motion.h5>
                            <motion.select className="edit-type"
                                defaultValue="For Sale"
                                initial="hidden"
                                animate="visible"
                                variants={editVariants}
                            >
                                <option value="For Sale">For Sale</option>
                                <option value="For Rent">For Rent</option>
                            </motion.select>
                        </motion.span>
                    </motion.div>
                </motion.div>
                <motion.div className="listing-view-text-desc">
                    <motion.span>
                        <motion.h5>Description</motion.h5>
                        <motion.textarea
                            defaultValue={listingData?.description}
                            onChange={e => editStateSetters.setDescription(e.target.value)}
                            initial="hidden"
                            animate="visible"
                            variants={editVariants}
                        />
                    </motion.span>
                </motion.div>
            </motion.div>
        </motion.div>
    </div>
)

export default ListingEditView
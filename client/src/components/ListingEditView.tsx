import React from "react"
import {motion} from "framer-motion"
import Dropzone from "react-dropzone"
import { DropState, ImagesFiles } from "../pages/ListingView"

interface EditProps {
    listingImages: {
        0: string | null | undefined, 
        1: string | null | undefined, 
        2: string | null | undefined, 
        3: string | null | undefined, 
        4: string | null | undefined,
    };
    imagesCount: number;
    handleImg: (index:number) => void;
    listingData: any;
    editState: any;
    onDrop: any;
    imageFiles: {
        0: File | null,
        1: File | null,
        2: File | null,
        3: File | null,
        4: File | null,
    };
    setImageFiles: React.Dispatch<React.SetStateAction<any>>;
    dropState: {
        0: boolean | undefined,
        1: boolean | undefined,
        2: boolean | undefined,
        3: boolean | undefined,
        4: boolean | undefined, 
    };
    setDrop: React.Dispatch<React.SetStateAction<any>>;
    s3UploadData: [];
    setS3UploadData: React.Dispatch<any>;
}

const editVariants = {
    hidden: { y: -10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
}

const ListingEditView:React.FC<EditProps> = ({listingImages, imagesCount, handleImg, listingData, editState, onDrop, imageFiles, setImageFiles, dropState, setDrop, s3UploadData, setS3UploadData}) => (
        

                <div className="listing-view">
                    <div className="listing-view-images">
                        {/* images carousel */}
                        <div className="listing-view-images-main">
                            <span className="listing-view-img-main">
                                { listingImages[0] && imageFiles[0] == null && !dropState[0] ?
                                <>
                                <img className="edit-img-main" src={listingImages[0]!} onClick={() => handleImg(0)} />
                                <motion.button className="edit-img-main-close" 
                                    onClick={() => {
                                        setDrop({...dropState, 0: true})
                                    }}
                                    initial="hidden"
                                    animate="visible"
                                    variants={editVariants}
                                />
                                </>
                                : imageFiles[0] !== null ?
                                <>
                                <motion.img className="edit-img-main" 
                                    src={URL.createObjectURL(imageFiles[0] as Blob)} 
                                    onClick={() => handleImg(0)}
                                    initial="hidden"
                                    animate="visible"
                                    variants={editVariants}
                                />
                                <motion.button className="edit-img-main-close" 
                                    onClick={() => {
                                        // remove file from upload data
                                        setS3UploadData(s3UploadData.filter((data:any) => 
                                            data.acceptedFile !== imageFiles[0]
                                            )
                                        )
                                        // remove file from cache state
                                        setImageFiles({...imageFiles, 0: null})
                                        setDrop({...dropState, 0: true})
                                    }}
                                    initial="hidden"
                                    animate="visible"
                                    variants={editVariants}
                                />
                                </>
                                : dropState[0] || !listingImages[0] ? 
                                <Dropzone 
                                    accept={['image/jpeg', 'image/png']}
                                    maxFiles={1}
                                    multiple={false}
                                    onDrop={onDrop}
                                    onDropAccepted={acceptedFile => {
                                        console.log(acceptedFile)
                                        setImageFiles({...imageFiles, [0]: acceptedFile[0]})
                                    }}
                                >
                                    {({getRootProps, getInputProps}) => (
                                        <div {...getRootProps()} className="edit-main-dropzone">
                                            <input {...getInputProps()} />
                                            <p>Click / Drop</p>
                                        </div>
                                    )}
                                </Dropzone>
                                : null
                                }
                            </span>
                        </div>
                        <div className="listing-view-images-side">
                            {Object.values(listingImages).slice(1).map((imageUrl, i) => {
                                return (
                                    imageUrl !== null && !dropState[i+1 as keyof DropState] ?
                                    <span className="listing-view-img-side edit-span-h-sm">
                                        
                                            {/* // imagesCount == 1 ? ""
                                            // : imagesCount == 2 ? ""
                                            // : imagesCount == 3 ? "edit-span-h-sm"
                                            // : imagesCount == 4 ? "edit-span-h-sm"
                                            // : "edit-span-h-sm" */}
                                         
                                        <img className="edit-img-side" src={imageUrl!} onClick={() => handleImg(i + 1)} />
                                        <motion.button className="edit-img-side-close"
                                            initial="hidden"
                                            animate="visible"
                                            variants={editVariants}
                                            onClick={() => 
                                                setDrop({...dropState, [i+1]: true})
                                            }
                                        />
                                    </span>
                                    : imageFiles[i+1 as keyof ImagesFiles] ?
                                        <span className="listing-view-img-side edit-span-h-sm">
                                            <motion.img className="edit-img-side" 
                                                src={URL.createObjectURL(imageFiles[i+1 as keyof ImagesFiles] as Blob)}
                                                initial="hidden"
                                                animate="visible"
                                                variants={editVariants}
                                            />
                                            <motion.button className="edit-img-side-close"
                                                initial="hidden"
                                                animate="visible"
                                                variants={editVariants}
                                                onClick={() => {
                                                    // remove file from upload data
                                                    setS3UploadData(s3UploadData.filter((data:any) => 
                                                        data.acceptedFile !== imageFiles[i+1 as keyof ImagesFiles]
                                                        )
                                                    )
                                                    // remove file from cache state
                                                    setImageFiles({...imageFiles, [i+1]: null})
                                                    setDrop({...dropState, [i+1]: true})
                                                }}
                                            />
                                        </span>
                                        : dropState[i+1 as keyof DropState] || !imageUrl ?
                                        <motion.span className="listing-view-img-side edit-span-h-sm"
                                            initial="hidden"
                                            animate="visible"
                                            variants={editVariants}
                                        >
                                            <Dropzone 
                                                accept={['image/jpeg', 'image/png']}
                                                maxFiles={1}
                                                onDrop={onDrop}
                                                onDropAccepted={acceptedFile => {
                                                    console.log(acceptedFile)
                                                    setImageFiles({...imageFiles, [i+1]: acceptedFile[0]})
                                                }}
                                            >
                                                {({getRootProps, getInputProps}) => (
                                                    <div {...getRootProps()} className="edit-side-dropzone">
                                                        <input {...getInputProps()} />
                                                        <p>Click or Drop</p>
                                                    </div>
                                                )}
                                            </Dropzone>
                                        </motion.span>
                                        : null
                                )
                            })}
                        </div>
                    </div>
                    
                    <motion.div className="listing-view-text">
                        {/* listing view text */}
                        <motion.div className="listing-view-text-head">
                            <motion.span>
                                <motion.h5>Address</motion.h5>
                                <motion.input className="edit-address1" 
                                    defaultValue={listingData?.address1}
                                    onChange={e => editState.setAddress1(e.target.value)}
                                    initial="hidden"
                                    animate="visible"
                                    variants={editVariants}
                                />
                                <motion.input className="edit-address2" 
                                    defaultValue={listingData?.address2} 
                                    onChange={e => editState.setAddress2(e.target.value)}
                                    initial="hidden"
                                    animate="visible"
                                    variants={editVariants}
                                />
                            </motion.span>
                            <motion.span>
                                <motion.h5>Price</motion.h5>
                                <motion.span className="edit-dollar">$</motion.span>
                                <motion.input className="edit-price" 
                                    defaultValue={listingData?.price.toString()} 
                                    onChange={e => editState.setPrice(parseInt(e.target.value))}
                                    initial="hidden"
                                    animate="visible"
                                    variants={editVariants}
                                />
                            </motion.span>
                        </motion.div>
                        <motion.div className="listing-view-text-body">
                            <motion.div className="listing-view-text-details">
                                <motion.div className="listing-view-text-details-col">
                                    <motion.span>
                                        <motion.h5>Beds</motion.h5>
                                        <motion.select 
                                            defaultValue={listingData?.beds.toString()}
                                            onChange={e => editState.setBeds(parseInt(e.target.value))}
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
                                            onChange={e => editState.setBaths(parseInt(e.target.value))}
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
                                            onChange={e => editState.setSquareFt(parseInt(e.target.value))}
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
                                            onChange={e => editState.setArea(e.target.value)}
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
                                            onChange={e => editState.setStatus(e.target.value)}
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
                                        onChange={e => editState.setDescription(e.target.value)}
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
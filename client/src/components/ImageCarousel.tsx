import React, {useEffect, useState} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import { useSwipeable } from "react-swipeable";
import { ImagesFiles } from '../pages/ListingView';

type CarouselProps = {
    allImages: [];
    toggleCarousel: boolean;
    setToggleCarousel: (val: boolean) => void;
    currentIndex: number;
    listingImages: any;
    imagesCount: number;
    imageFiles: any;
};

const ImageCarousel: React.FC<CarouselProps> = ({
    allImages,
    toggleCarousel, 
    setToggleCarousel, 
    currentIndex, 
    listingImages, 
    imagesCount,
    imageFiles,
}) => {
    const [activeIndex, setActiveIndex] = useState(currentIndex)

    console.log(listingImages[0])

    const updateIndex = (newIndex:number) => {
        if (newIndex < 0) {
            newIndex = imagesCount - 1;
        } else if (newIndex >= imagesCount) {
            newIndex = 0;
        }

        setActiveIndex(newIndex);
    };

    const handlers = useSwipeable({
        onSwipedLeft: () => updateIndex(activeIndex + 1),
        onSwipedRight: () => updateIndex(activeIndex - 1)
    });

    return (
        <>
            <AnimatePresence>
                <motion.div className="carousel-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setToggleCarousel(false)}
                />
                <motion.div className="carousel-wrapper"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', bounce: 0.25 }} 
                    {...handlers}  
                >
                    <div className="carousel-inner">   
                        <div className='carousel-inner-main' style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
                        {/* {listingImages[0]
                            ?
                            <div className="carousel-item">
                                <img src={listingImages[0]} className="carousel-img"/>
                            </div>
                            : null
                        }
                        {listingImages[1]
                            ?
                            <div className="carousel-item">
                                <img src={listingImages[1]} className="carousel-img"/>
                            </div>
                            : null
                        }
                        {listingImages[2]
                            ?
                            <div className="carousel-item">
                                <img src={listingImages[2]} className="carousel-img"/>
                            </div>
                            : null
                        } */}
                        {/* {Object.values<string>(listingImages).filter(val => val !== null).map((imageUrl) => {
                            return (
                                <div className="carousel-item">
                                    <img src={imageUrl} className="carousel-img" />
                                </div>
                            );
                        })}*/}
                            {/* { Object.keys(listingImages).map((key) => {
                                return (
                                    listingImages[key] ?
                                    <div className="carousel-item">
                                        <img src={listingImages[key]} className="carousel-img" />
                                    </div>    
                                    : !listingImages[key] ?
                                        imageFiles[key as unknown as keyof ImagesFiles] ?
                                        <div className="carousel-item">
                                            <img src={URL.createObjectURL(imageFiles[key as unknown as keyof ImagesFiles] as Blob)} className="carousel-img" />
                                        </div> 
                                        : null 
                                    : null
                                ) 
                            })} */}
                            { 
                                Object.values(allImages)?.map((image:any) => {
                                    return (
                                        <div className="carousel-item">
                                            <img src={image.src} className="carousel-img" />
                                        </div>
                                    )   
                                })
                            }
                        </div> 


                        <div className='carousel-inner-bottom'>
                        {/* {listingImages[0]
                            ?
                            <div className="carousel-inner-bottom-item">
                                <img src={listingImages[0]} className="carousel-thumb"/>
                            </div>
                            : null
                        }
                        {listingImages[1]
                            ?
                            <div className="carousel-inner-bottom-item">
                                <img src={listingImages[1]} className="carousel-thumb"/>
                            </div>
                            : null
                        }
                        {listingImages[2]
                            ?
                            <div className="carousel-inner-bottom-item">
                                <img src={listingImages[2]} className="carousel-thumb"/>
                            </div>
                            : null
                        } */}
                        {Object.values(allImages).map((image:any, i) => {
                            return (
                                <div className={`carousel-inner-bottom-item `}>
                                    <img src={image.src} 
                                        className={`carousel-thumb ${activeIndex == i ? "carousel-thumb-active" : "carousel-thumb-inactive"}`}
                                        onClick={() => {
                                            updateIndex(i);
                                        }}
                                    />
                                </div>
                            );
                        })}
                        </div>
                    </div>
                    <motion.div className="carousel-pagin"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', bounce: 0.25 }} 
                    >
                        {Object.values(allImages).map((_, i) => {
                            return (
                                <button
                                    className={`carousel-pagin-button ${i === activeIndex ? "carousel-pagin-button-active" : ""}`}
                                    onClick={() => {
                                        updateIndex(i);
                                    }}
                                >
                                </button>
                            );
                        })}
                    </motion.div>
                    <motion.div className="carousel-close"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', bounce: 0.25 }} 
                    >
                        <button 
                            className="carousel-close-button"
                            onClick={() => setToggleCarousel(!toggleCarousel)}
                        >
                            Close
                        </button>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </>
    )
}

export default ImageCarousel
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSwipeable } from "react-swipeable";

type CarouselProps = {
    allImages: [];
    toggleCarousel: boolean;
    setToggleCarousel: (val: boolean) => void;
    currentIndex: number;
    imagesCount: number;
};

const ImageCarousel: React.FC<CarouselProps> = ({
    allImages,
    toggleCarousel,
    setToggleCarousel,
    currentIndex,
    imagesCount,
}) => {
    const [activeIndex, setActiveIndex] = useState(currentIndex)

    const updateIndex = (newIndex: number) => {
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

                            {
                                Object.values(allImages)?.map((image: any) => {
                                    return (
                                        <div className="carousel-item">
                                            <img src={image.src} className="carousel-img" />
                                        </div>
                                    )
                                })
                            }
                        </div>


                        <div className='carousel-inner-bottom'>

                            {Object.values(allImages).map((image: any, i) => {
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
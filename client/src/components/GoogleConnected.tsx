import { useContext, useState } from "react"
import { GlobalContext } from "../App"
import { FcGoogle } from "react-icons/fc"
import { MdSettings } from "react-icons/md"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

const GoogleConnected = () => {
    const navigate = useNavigate()
    const { gAccountInfo, setGAccountInfo } = useContext(GlobalContext)
    const [isOpen, setIsOpen] = useState<boolean>(false)

    return (
        <>
            <span className='google-connected' onClick={() => setIsOpen(!isOpen)}>
                <span className="google-connected-main">
                    <FcGoogle size='20px' />
                    <h6>Connected to Google</h6>
                </span>
                {isOpen && (
                    <>
                        <motion.div className="google-connected-expand"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => navigate('/settings/?category=google')}
                        >
                            <img src={gAccountInfo.photo} />
                            <h6>{gAccountInfo.email}</h6>
                            <MdSettings size='20px' color='#b0b0b0' />
                        </motion.div>
                    </>
                )}
            </span>
            {isOpen && (
                <div className="google-connected-backdrop" onClick={() => setIsOpen(false)} />
            )}

        </>
    )
}

export default GoogleConnected
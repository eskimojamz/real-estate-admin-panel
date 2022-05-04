import { useContext, useState } from "react"
import logoDark from "../assets/logoDark.svg"
import { useNavigate } from "react-router-dom"
import { useLoginMutation, DisplayUserDocument, DisplayUserQuery } from "../generated/graphql"
import { ScaleLoader } from "react-spinners"
import { motion } from "framer-motion"
import { GlobalContext } from "../App"
import { setAccessToken } from "../utils/accessToken"

const Login: React.FC = () => {
    const { setIsLoggedIn } = useContext(GlobalContext)
    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [login, { error, loading }] = useLoginMutation()

    const submit = async (e: any) => {
        e.preventDefault();
        await login({
            variables: {
                username,
                password
            },
            update: (store, { data }) => {
                if (!data) {
                    return null
                }
                setAccessToken(data.login.accessToken)
                localStorage.setItem('refresh_token', data.login.refreshToken)
                store.writeQuery<DisplayUserQuery>({
                    query: DisplayUserDocument,
                    data: {
                        displayUser: data.login.user
                    }
                })
            },
            onError: (err) => {
                throw new Error(err.message)
            }
        }).then(() => {
            setIsLoggedIn(true)
            navigate("/dashboard", { replace: true })
        })
    }

    return (
        <motion.div className='login-container'
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
        >
            <motion.div className='login-wrapper'
                initial={{ opacity: 0.5, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className='login-header'>
                    <img className='login-header-logo' src={logoDark} alt='logo' />
                    <div className='login-header-text'>
                        <h3>Admin Panel</h3>
                    </div>
                </div>
                <form
                    className='login-form'
                    onSubmit={submit}
                >
                    <label>ID</label>
                    <input
                        className='login-form-id'
                        onChange={e => {
                            setUsername(e.target.value)
                        }}
                    />
                    <label>PASSWORD</label>
                    <input
                        className='login-form-id'
                        type='password'
                        onChange={e => {
                            setPassword(e.target.value)
                        }}
                    />
                    {error &&
                        <div className="login-form-error">
                            <p>Invalid credentials. Try again.</p>
                        </div>
                    }
                    <button type='submit' className="btn-primary">
                        Login
                    </button>
                    {loading && (
                        <motion.div className="login-loader-overlay"
                            initial={{ opacity: 0.5 }}
                            animate={{ opacity: 1 }}
                        >
                            <ScaleLoader color='#2c5990' />
                            <p>Logging in to Admin Panel</p>
                        </motion.div>
                    )}
                </form>
            </motion.div>
        </motion.div>
    )
}

export default Login
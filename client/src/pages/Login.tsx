import { useState } from "react"
import logo from "../assets/logo.svg"
import { useNavigate } from "react-router-dom"
import { useLoginMutation, DisplayUserDocument, DisplayUserQuery } from "../generated/graphql"

const Login: React.FC = () => {
    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [login, {error, loading}] = useLoginMutation()

    const submit = async (e:any) => {
        e.preventDefault();
        const response = await login({
            variables: {
                username, 
                password
            },
            update: (store, {data}) => {
                if (!data) {
                    return null
                }

                store.writeQuery<DisplayUserQuery>({
                    query: DisplayUserDocument,
                    data: {
                        displayUser: data.login.user
                    }
                })
            }
        })
        console.log(response)

        navigate("/", {replace: true})
    }

    return (
        <div className='login-container'>
        <div className='login-wrapper'>
            <div className='login-header'>
                <img className='login-header-logo' src={logo} alt='logo' />
                <div className='login-header-text'>
                    <h3>Admin Dashboard</h3>
                    <h6>Please enter credentials</h6>
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
                <label>Password</label>
                <input 
                    className='login-form-id' 
                    type='password'
                    onChange={e => {
                        setPassword(e.target.value)
                    }}
                />
                
                <div className="login-form-error">
                {error &&
                    'Invalid credentials. Try again.'
                }
                </div>
                <button type='submit'>
                    Login
                </button>
                {loading && 'Logging in...'}
            </form>
        </div>
    </div>
  )
}

export default Login
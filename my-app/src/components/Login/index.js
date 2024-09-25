import {useState} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import BeatLoader from "react-spinners/BeatLoader";
import Cookies from 'js-cookie';
import '../share.css'
import './index.css'

const Login = () => {
    const [userNameOrEmail,setUsernameEmail] = useState('')
    const [password,setPassword] = useState('')
    const [message,setMessage] = useState('')
    const [loader,setLoader] = useState(false)
    const history = useNavigate()

    const login= async(e) => {
        e.preventDefault()
        if (!userNameOrEmail || !password){
            setMessage('*please enter user details and password')
        }else{
            setLoader(true)
            const response = await fetch('https://todo-full-backend.onrender.com/login', {
                method: 'POST',
                headers: {
                    'Content-Type': "application/json; charset=UTF-8"
                },
                body: JSON.stringify({
                    userNameOrEmail,
                    password
                })
            });
            setUsernameEmail('')
            setPassword('')
            const responseMsg = await response.json()
            setLoader(false)
            if (response.ok){
                Cookies.set('jwtToken', responseMsg.token, { expires: 7 });
                history('/')
            }
            //console.log(responseMsg.message,responseMsg.token)
            setMessage(responseMsg.message)
        }
    }
    return(
        <div className="login-container">
            <div className='login'>
                <h1>Login</h1>
                <form>
                    <label htmlFor='username'>Username Or Email</label><br />
                    <input type="text" placeholder='Enter Username or Email' value={userNameOrEmail} onChange={(e)=>setUsernameEmail(e.target.value)} id='username' /><br />
                    <label>Password</label><br />
                    <input type="password" placeholder='Enter Password' value={password} onChange={(e)=>setPassword(e.target.value)} /><br />
                    <button type="button" className='submit-btn' onClick={login}>Login</button>
                </form>
                <div className='loader'>
                <BeatLoader
                        color={'aqua'}
                        loading={loader}
                        size={50}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                    />
                </div>
                <p>New user? <Link to='/register'>Register</Link></p>
                {message && <p className='message'>{message}</p>}
            </div>
        </div>
    ) 
}

export default Login

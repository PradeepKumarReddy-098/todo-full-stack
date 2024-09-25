import {useState} from 'react'
import {Link} from 'react-router-dom'
import BeatLoader from "react-spinners/BeatLoader";
import './index.css'
import '../share.css'

const Register = () => {
    const [username,setUsername] = useState('')
    const [email,setEmali] = useState('')
    const [password,setPassword] = useState('')
    const [rePassword,setRepassword] = useState('')
    const [message,setMessage] = useState('')
    const [loader,setLoader]= useState(false)

    const register = async(e) => {
        e.preventDefault()
        if (password!==rePassword){
            setMessage('*Password not matched. Enter same password in both the fields')
        }else{
            if (!username || !email || !password || !rePassword){
                setMessage('*please enter user details and password')
            }else{
                setLoader(true)
                const response = await fetch('https://todo-full-backend.onrender.com/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': "application/json; charset=UTF-8"
                    },
                    body: JSON.stringify({
                        username,
                        email,
                        password
                    })
                });
                setUsername('')
                setEmali('')
                setPassword('')
                setRepassword('')
                const responseMsg = await response.json()
                setLoader(false)
                setMessage(responseMsg.message)
            }
        }
    }
    return(
        <div className='register-container'>
            <div className='register'>
                <h1>Register</h1>
                <form onSubmit={register}>
                    <label htmlFor="username">Username</label><br />
                    <input type='text' placeholder='Username' value={username} onChange={(e)=>setUsername(e.target.value)} id="username" /><br />
                    <label htmlFor='email'>Email</label><br />
                    <input type='text' placeholder='Email' value={email} onChange={(e)=>setEmali(e.target.value)} id='email' /><br />
                    <label htmlFor='password'>Password</label><br />
                    <input type="password" placeholder='Password' value={password} onChange={(e)=>setPassword(e.target.value)} id="password" /><br />
                    <label htmlFor='re-password'>Re-Password</label><br />
                    <input type="password" placeholder='Re-Password' value={rePassword} onChange={(e)=>setRepassword(e.target.value)} id="re-password" /><br />
                    <button className='submit-btn' onClick={register}>Register</button>  
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
                <p>Already have an account? <Link to='/login'>Login</Link></p>
                {message && <p className='message'>{message}</p>}
            </div>
        </div>
    )
}

export default Register

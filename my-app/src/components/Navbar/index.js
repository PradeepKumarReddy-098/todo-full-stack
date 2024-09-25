import Cookies from 'js-cookie'
import { useNavigate,Link } from 'react-router-dom'
import './index.css'

const Navbar = () => {
    const nagivate = useNavigate()
    const logout = () => {
        Cookies.remove('jwtToken')
        nagivate('/login')
    }
    return(
        <nav>
            <span className='logo'>
                <Link to='/' className='link'>Todo App</Link>
            </span>
            <Link to='/profile' className='link'>Profile</Link>
            <button onClick={logout} type='button' className='logout-btn'>Logout</button>
        </nav>
    )
}

export default Navbar

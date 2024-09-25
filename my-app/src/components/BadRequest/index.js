import Navbar from "../Navbar";
import { Link } from "react-router-dom";
import './index.css'

const BadRequest = () => {
    return(
        <>
        <Navbar />
        <div className="bad-request">
            <h1>Something went wrong....</h1>
            <p>click on Todo App logo or go to login page <Link to='/login'>here</Link></p>
        </div>
        </>
    )
}

export default BadRequest

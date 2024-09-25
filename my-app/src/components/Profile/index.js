import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import Cookies from 'js-cookie';
import Navbar from '../Navbar';
import './index.css';

const Profile = () => {
  const [userDetails, setUserDetails] = useState({});
  const [updatedDetails, setUpdatedDetails] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    const getUserDetails = async () => {
      const token = Cookies.get('jwtToken');
      const response = await fetch('https://todo-full-backend.onrender.com/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUserDetails(data);
    };

    getUserDetails();
  }, []);

  const nagivate = useNavigate()
  const jwtToken = Cookies.get('jwtToken')
  if (!jwtToken){
    return nagivate('/login')
  }  

  const handleEditClick = () => {
    setIsEditing(true);
    setUpdatedDetails({ username: userDetails.username, email: userDetails.email, password: '' });
  };

  const handleInputChange = (event) => {
    setUpdatedDetails({ ...updatedDetails, [event.target.name]: event.target.value });
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    setEditError('');

    const token = Cookies.get('jwtToken');
    const { username, email, password } = updatedDetails;

    try {
      const response = await fetch('https://todo-full-backend.onrender.com/users/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (data.message === 'Details updated successfully') {
        setUserDetails({ ...userDetails, username, email });
        setIsEditing(false);
      } else {
        setEditError(data.message);
      }
    } catch (err) {
      console.error(err);
      setEditError('An error occurred. Please try again later.');
    }
  };

  return (
    <>
      <Navbar />
      <div className='user-container'>
        <CgProfile size={180} />
        {isEditing ? (
          <form onSubmit={handleEditSubmit}>
            <h1>Edit Profile</h1>
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                name="username"
                id="username"
                value={updatedDetails.username}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                name="email"
                id="email"
                value={updatedDetails.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                name="password"
                id="password"
                value={updatedDetails.password}
                onChange={handleInputChange}
              />
            </div>
            <button type="submit" className='update-btn'>Update</button>
            {editError && <p className="error-message">{editError}</p>}
          </form>
        ) : (
          <>
            <h1>Hello, {userDetails.username}</h1>
            <p>{userDetails.email}</p>
            <button type='button' className='update-btn' onClick={handleEditClick}>
              Update Details and Password
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default Profile;
import { useState } from 'react'
import Cookies from 'js-cookie'

import './index.css'

const TodoItem = ({todo,deleteTodo,handleEditDataArr}) => {
    const [isEditing,setIsEditing] = useState(false)
    const [editValue,setEditValue] = useState(todo.title)
    const [editState,setEditState] = useState('pending')
    console.log(editState,editValue)
    const deleteItem = () => {
        deleteTodo(todo.id)
    }

    const handleEditData = async () => {
        const editedData = {
          id: todo.id,
          title: editValue,
          state: editState,
        };
    
        try {
          const token = Cookies.get('jwtToken');
          const response = await fetch(`https://todo-full-backend.onrender.com/todos/${editedData.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json; charset=UTF-8',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(editedData)
          });
    
          const data = await response.json();
    
          if (data.message === 'Todo updated successfully') {
            handleEditDataArr(editedData);
            setIsEditing(false);
          } else {
            console.error('Error updating todo:', data.message);
          }
        } catch (err) {
          console.error('Error sending update request:', err);
        }
      };
    return (
     <li key={todo.id} className='todo-li-item'>
      {isEditing ? (
        <>
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
        />
        <select onChange={(e)=>setEditState(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="complected">complected</option>
            <option value="In progress">In Progress</option>
        </select>
        <button type="button" className='update-btn' onClick={handleEditData}>update</button>
        </>
      ) : (
        <>
          <span>{todo.title}</span>
          <span>{todo.state}</span>
          <button type="button" onClick={() => setIsEditing(true)} className='edit-btn'>Edit</button>
          <button type="button" onClick={deleteItem} className="delete-btn">Delete</button>
        </>
      )}
    </li>
    )
}

export default TodoItem
import {useState,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'
import { v4 as uuidv4 } from 'uuid';
import BeatLoader from "react-spinners/BeatLoader";
import Navbar from "../Navbar";
import TodoItem from '../TodoItem';
import './index.css'
import '../share.css'

const Todo = () => {
    const [todoList,setTodoList] = useState([])
    const [item,setItem] = useState('')
    const [loader,setLoader] = useState(false)

    const deleteTodo = async (todoId) => {
        //console.log(todoId)
        setLoader(true);
        const token = Cookies.get('jwtToken');
        const response = await fetch(`https://todo-full-backend.onrender.com/todos/${todoId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
    
        const data = await response.json();
        setLoader(false);
    
        if (data.message === 'Todo deleted successfully') {
          setTodoList(todoList.filter((todo) => todo.id !== todoId));
        } else {
          console.error('Error deleting todo:', data.message);
        }
      };

      const handleEditDataArr = async (editedData) => {
        setTodoList(
            todoList.map((todo) => (todo.id === editedData.id ? editedData : todo))
          );
      };


    const addTodo= async() => {
        if (item){
            const token = Cookies.get('jwtToken')
            //console.log(token)
            const response = await fetch('https://todo-full-backend.onrender.com/todos/add', {
                method: 'POST',
                headers: {
                    'Content-Type': "application/json; charset=UTF-8",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id:uuidv4(),
                    title:item,
                    status:'pending'
                })});
            const responseMes = await response.json();
            if (responseMes.message === 'Todo created successfully') {
                setItem('');
                setTodoList([...todoList, responseMes.todo]);
              } else {
                console.error('Error creating todo:', responseMes.message);
              }
        } 
    }
    useEffect(() => {
        const fetchTodos = async () => {
          setLoader(true)
          const token = Cookies.get('jwtToken');
          const response = await fetch('https://todo-full-backend.onrender.com/todos', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          setTodoList(data);
          setLoader(false)
        };
    
        fetchTodos();
      }, []);

    const nagivate = useNavigate()
    const jwtToken = Cookies.get('jwtToken')
    if (!jwtToken){
        return nagivate('/login')
    }

    return(
        <>
        <Navbar />
        <div className="todo-app">
            <h1>Todo App </h1>
            <section className="add-todo-section">
                <input type="text" placeholder="Enter Your Todo Note here ......" value={item} onChange={(e)=>setItem(e.target.value)} />
                <button type="button" onClick={addTodo} className="add-todo-btn">Add Todo</button>
            </section>
            <section className='todo-items-container'>
                <h1>Todo List</h1>
                <ul className='todo-ul-list'>
                    {todoList.length>0?
                    todoList.map((todo) => (
                      <TodoItem key={todo.id} todo={todo} deleteTodo={() => deleteTodo(todo.id)} handleEditDataArr={handleEditDataArr} />
                    )):(
                        <div className='empty-list'>
                            <h2>No Items Added</h2>
                            <p>Enter your Todo above and click on add button to add todo.</p>
                        </div>
                    )}
                </ul>
            </section>
            <div className='loader'>
                <BeatLoader
                        color={'aqua'}
                        loading={loader}
                        size={50}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                    />
                </div>
        </div>
        </>

    )
}
export default Todo

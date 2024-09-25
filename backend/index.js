const express = require("express");
const path = require("path");
const sqlite3 = require('sqlite3');
const {open} = require('sqlite')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const dbPath = path.join(__dirname,"todo.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.post('/register', async (request, response) => {
  const {username,email,password} = request.body
  if (!username || !email || !password){
      return response.status(400).json({ message: 'Please fill out all required fields' });
  }
  const checkUsername = `select * from users where username = ?;`;
  const checkemail = `select * from users where email = ?;`;
  const user = await db.get(checkUsername,[username])
  const emailId = await db.get(checkemail,[email])
  if (user){
     return response.status(400).json({ message: 'username is already in use. Please try other' });
  }else if(emailId){
    return response.status(400).json({ message: 'Email is already exits. Please try other' });
  }
  try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.run(
        `INSERT INTO users (username, email, password)
        VALUES (?, ?, ?)`,
        [username, email, hashedPassword]
      );
      response.status(201).json({ message: 'Account created successfully!' });
    } catch (err) {
      console.error(`Error creating account: ${err.message}`);
      response.status(500).json({ message: 'An error occurred during registration' });
    }
});


app.post('/login',async(request,response)=>{
  const {userNameOrEmail,password} = request.body

  const checkUsernameOrEmail = await db.get(`SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)`,
      [userNameOrEmail, userNameOrEmail]);
  if (!checkUsernameOrEmail){
    return response.status(400).json({ message: 'Invalid user details' });
  }

  //console.log(checkUsernameOrEmail)
  
  const checkPassword = await bcrypt.compare(password,checkUsernameOrEmail.password);
  if (!checkPassword) {
    return response.status(401).json({ message: 'Invalid username or email/password combination' });
  }
  try{
    const payload = {
      id: checkUsernameOrEmail.id,
      username:checkUsernameOrEmail.username
    }
    const token = jwt.sign(payload, "TODO_APP_LOGIN", { expiresIn: '7d' });
    console.log(token)
    response.status(200).json({ message:'Login Successful',token });
  }catch(error){
    console.error(`Error logging in: ${error.message}`);
    response.status(500).json({ message: 'An error occurred during login' });
  }
});

const authenticateToken = (request, response, next) => {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }

  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "TODO_APP_LOGIN", async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        const userId = payload.id;
        //console.log("User ID:", userId);
        request.user = { id: userId };
        next();
      }
    });
  }
};


app.post('/todos/add', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { id,title,status } = req.body;
  //console.log(userId,id,title,status)
  try {
    const todo = {
      id,
      title,
      userId,
      status,
    };

    await db.run('INSERT INTO todos (id, title, userId, state) VALUES (?, ?, ?, ?)', [todo.id, todo.title, todo.userId, todo.status]);
    res.status(201).json({ message: 'Todo created successfully',todo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/todos', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const todos = await db.all('SELECT * FROM todos WHERE userId = ?', [userId]);
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/todos/:id', authenticateToken, async (req, res) => {
  const todoId = req.params.id;
  const userId = req.user.id;
  const { title,state } = req.body;

  try {
    await db.run('UPDATE todos SET title = ?, state = ? WHERE id = ? AND userId = ?', [title,state, todoId, userId]);
    res.status(200).json({ message: 'Todo updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/todos/:id', authenticateToken, async (req, res) => {
  const todoId = req.params.id;
  const userId = req.user.id;

  try {
    await db.run('DELETE FROM todos WHERE id = ? AND userId = ?', [todoId, userId]);
    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/users', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.patch('/users/update', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { username, email, password } = req.body;

  try {
    const existingUser = await db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    let updateQuery = 'UPDATE users SET username = ?, email = ? WHERE id = ?';
    let updateParams = [username, email, userId];
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10); // Hash password
      updateQuery = 'UPDATE users SET username = ?, email = ?,password = ? WHERE id = ?';
      updateParams.push(hashedPassword);
    }

    await db.run(updateQuery, updateParams);
    res.status(200).json({ message: 'Details updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
})


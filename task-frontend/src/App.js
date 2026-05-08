// Imports
import { useState, useRef, useEffect } from 'react';
import './App.css';
import { FaTasks } from "react-icons/fa";

function App() {    //component function =>   function App() {....}


  //States / Refs

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("myTasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  }); //array of task objects. Each task has text and done properties.
  const [input, setInput] = useState("");  //input field value. 
  const [editingIndex, setEditingIndex] = useState(null); //index of the task being edited 
  const [editedText, setEditedText] = useState(""); //edited text value
  const inputRef = useRef(null); 
  const [priority, setPriority] = useState("Medium");
  const [filter, setFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
  const savedMode = localStorage.getItem("darkMode");
  return savedMode === "true";
  });
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

const [loginUsername, setLoginUsername] = useState("");
const [loginPassword, setLoginPassword] = useState("");
const [currentUserId, setCurrentUserId] = useState(null);

const [currentUsername, setCurrentUsername] = useState("");


 
//UseEffects 

  useEffect(() => {
  if (editingIndex !== null) {
    inputRef.current.focus();
  }
  }, [editingIndex]);

  useEffect(() => {
  localStorage.setItem("myTasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
  localStorage.setItem("darkMode", darkMode);
}, [darkMode]);

useEffect(() => {
  if (!currentUserId) {
    return;
  }

  fetch(`https://taskflow-fullstack-k82v.onrender.com/api/tasks/${currentUserId}`)
    .then((res) => res.json())
    .then((data) => {
      setTasks(data);
    });
}, [currentUserId]);

useEffect(() => {
  const savedUserId = localStorage.getItem("currentUserId");
  const savedUsername = localStorage.getItem("currentUsername");

  if (savedUserId && savedUsername) {
    setCurrentUserId(savedUserId);
    setCurrentUsername(savedUsername);
  }
}, []);




//Functions

const signupUser = () => {   //signup function to create a new user and send it to the backend
  if (signupUsername.trim() === "" || signupPassword.trim() === "") {
    return;
  }

  const newUser = {
    username: signupUsername,
    password: signupPassword
  };

  fetch("https://taskflow-fullstack-k82v.onrender.com/api/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newUser)
  })
    .then((res) => res.json())
    .then((data) => {
      alert(data.message || data.error);
      setSignupUsername("");
      setSignupPassword(""); 
    });
};


const loginUser = () => {
  if (loginUsername.trim() === "" || loginPassword.trim() === "") {
    return;
  }

  const userInfo = {
    username: loginUsername,
    password: loginPassword
  };

  fetch("https://taskflow-fullstack-k82v.onrender.com/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userInfo)
  })
    .then((res) => res.json())
    .then((data) => {
      alert(data.message || data.error);
      

      if (data.userId) {
        setCurrentUserId(data.userId);
        setCurrentUsername(loginUsername);

        localStorage.setItem("currentUserId", data.userId);
        localStorage.setItem("currentUsername", loginUsername);
      }

      setLoginUsername("");
      setLoginPassword("");
    });
};



const addTask = () => {  //add a new task to the list and send it to the backend
    if (!currentUserId) {
    alert("Please login first");
    return;
    }
  if (input.trim() === "") {
    return;
  }

  const newTask = {
    text: input,
    priority: priority,
    userId: currentUserId
  };

  fetch("https://taskflow-fullstack-k82v.onrender.com/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newTask)
  })
    .then((res) => res.json())
    .then((savedTask) => {
      setTasks([...tasks, savedTask]);
      setInput("");
    });
};


const deleteTask = (idToDelete) => {
  fetch(`https://taskflow-fullstack-k82v.onrender.com/api/tasks/${idToDelete}`, {
    method: "DELETE"
  })
    .then((res) => res.json())
    .then(() => {
      const updatedTasks = tasks.filter((task) => task._id !== idToDelete);
      setTasks(updatedTasks);
    });
};



const toggleDone = (id) => {
  fetch(`https://taskflow-fullstack-k82v.onrender.com/api/tasks/${id}`, {
    method: "PUT"
  })
    .then((res) => res.json())
    .then((updatedTask) => {
      const updatedTasks = tasks.map((task) =>
        task._id === id ? updatedTask : task
      );
      setTasks(updatedTasks);
    });
};



const saveTask = () => {
  if (editedText.trim() === "") {
    return;
  }

  const taskToEdit = tasks[editingIndex];

  fetch(`https://taskflow-fullstack-k82v.onrender.com/api/tasks/${taskToEdit._id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text: editedText })
  })
    .then((res) => res.json())
    .then((updatedTask) => {
      const updatedTasks = tasks.map((task) =>
        task._id === updatedTask._id ? updatedTask : task
      );

      setTasks(updatedTasks);
      setEditingIndex(null);
      setEditedText("");
    });
};



const cancelEdit = () => {
  setEditingIndex(null);
  setEditedText("");
};



const getPriorityColor = (priority) => {
  if (priority === "High") return "red";
  if (priority === "Medium") return "orange";
  if (priority === "Low") return "green";
};

const logoutUser = () => {
  setCurrentUserId(null);
  setCurrentUsername("");
  setTasks([]); // Clear tasks on logout
};

//helper Variables {

const totalTasks = tasks.length;
const highTasks = tasks.filter((task) => task.priority === "High").length;
const mediumTasks = tasks.filter((task) => task.priority === "Medium").length;
const lowTasks = tasks.filter((task) => task.priority === "Low").length;

//  }


const clearCompletedTasks = () => {
  const activeTasks = tasks.filter((task) => !task.done);
  setTasks(activeTasks);
};





return (

    <div className={darkMode ? "app-container dark" : "app-container"}>
    <div className="app-header">
      <h1 className="app-title">
        <FaTasks className="logo-icon" />
        TaskFlow
      </h1>

    {currentUserId && (
      <div className="header-user">
        <span>Welcome, {currentUsername}</span>

        <button onClick={logoutUser} className="btn btn-logout">
          Logout
        </button>
      </div>
    )}
    </div>

    {!currentUserId && (
      <div className="auth-section">
    <div>
      <h3>Sign Up</h3>

  <input
    className="input"
    value={signupUsername}
    onChange={(e) => setSignupUsername(e.target.value)}
    placeholder="Username"
  />

  <input
    className="input"
    type="password"
    value={signupPassword}
    onChange={(e) => setSignupPassword(e.target.value)}
    placeholder="Password"
  />

   <button onClick={signupUser} className="btn btn-add">
     Sign Up
   </button>
    </div>


<div>
  <h3>Login</h3>

  <input
    className="input"
    value={loginUsername}
    onChange={(e) => setLoginUsername(e.target.value)}
    placeholder="Username"
  />

  <input
    className="input"
    type="password"
    value={loginPassword}
    onChange={(e) => setLoginPassword(e.target.value)}
    placeholder="Password"
  />

   <button onClick={loginUser} className="btn btn-add">
      Login
   </button>

   {currentUserId && <p>You are logged in.</p>}
</div>
  </div>
    )}


    <button onClick={() => setDarkMode(!darkMode)} className="btn btn-toggle">
      {darkMode ? "Light Mode" : "Dark Mode"}
    </button>

  <div className="stats-grid">
    <div className="stat-card">
      <p>Total Tasks</p>
      <h2>{totalTasks}</h2>
    </div>

    <div className="stat-card">
      <p>High Priority</p>
      <h2>{highTasks}</h2>
    </div>

    <div className="stat-card">
      <p>Medium Priority</p>
      <h2>{mediumTasks}</h2>
    </div>

    <div className="stat-card">
      <p>Low Priority</p>
      <h2>{lowTasks}</h2>
    </div>
  </div>
  

    <div className="top-controls">
      <input
        className="input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search tasks"
      />

      <input
        className="input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter task"
      />
    <div>
      <label>Priority</label>
      <select
      value={priority}
       onChange={(e) => setPriority(e.target.value)}
      >
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
    </div>


    <div>
      <label>Filter by Priority</label>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        <option value="All">All</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
    </div>

    <div> 
      <label>Status</label>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="All">All</option>
        <option value="Active">Active</option>
        <option value="Completed">Completed</option>
      </select>
    </div>

 
       <button onClick={addTask} className="btn btn-add"> 
          Add
       </button>

      <button onClick={clearCompletedTasks} className="btn btn-clear">
        Clear Completed
      </button>
     </div>
    
      <ul>
    {[...tasks]
    .filter((task) => {
      const matchesPriority =
        filter === "All" || task.priority === filter;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && !task.done) ||
        (statusFilter === "Completed" && task.done);
      const matchesSearch =
       task.text.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesPriority && matchesStatus && matchesSearch;
    }) 

    .sort((a, b) => {

        const order = {
         High: 1,
         Medium: 2,
         Low: 3
        };

        return order[a.priority] - order[b.priority];
      })
      .map((task, index) => (
        <li key={task._id} className="task-item">


         {/*  left side*/}
         <div>
        {editingIndex === index ? (
          <input
          ref={inputRef}
          className="input"
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              saveTask();
            }
            if (e.key === "Escape") {
              cancelEdit();
            }
          }}
          onBlur={saveTask} //save on blur
          />
        ) : (
          task.done ? (
            <s>
              {task.text} - {task.priority}
            </s>
          ) : (
            <>
            {task.text} -{" "}
              <span style={{ color: getPriorityColor(task.priority) }}>
                {task.priority}
              </span>
            </>
          )
        )}
          </div>


           {/*  right side */}
          <div className="task-buttons">
            {editingIndex !== index && (
          <button
            onClick={() => toggleDone(task._id)}
            className={`btn ${task.done ? "btn-undo" : "btn-done"}`}
          >
            {task.done ? "Undo" : "Done"}
          </button>
          )}

        {editingIndex === index ? (
          <> 
          <button onClick={saveTask} className="btn btn-save"> 
            Save
          </button> 
        <button onClick={cancelEdit} className="btn btn-cancel">
          Cancel
        </button>

          </>
        ) : ( 

        <button
          onClick={() => {
            setEditingIndex(index);
            setEditedText(task.text);
          }}
          className="btn btn-edit"
        >
            Edit
        </button>
        )}

        {editingIndex !== index && (
        <button onClick={() => deleteTask(task._id)} className="btn btn-delete">
          Delete
        </button>
        )}
        </div> 
      </li>
    ))} 
      </ul>

    
    </div>
  );
}

export default App; 
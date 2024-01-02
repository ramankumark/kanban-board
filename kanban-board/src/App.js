import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

import './App.css';

import List from './Components/List/List';
import Navbar from './Components/Navbar/Navbar';

function App() {
  // Lists containing different categories of data
  const statusList = ['Backlog', 'Todo', 'In progress', 'Done', 'Cancelled'];
  const userList = ['Anoop Sharma', 'Yogesh', 'Shankar Kumar', 'Ramesh', 'Suresh'];
  const priorityList = [
    { name: 'No priority', priority: 0 },
    { name: 'Low', priority: 1 },
    { name: 'Medium', priority: 2 },
    { name: 'High', priority: 3 },
    { name: 'Urgent', priority: 4 },
  ];

  // State variables
  const [groupValue, setGroupValue] = useState(getStateFromLocalStorage() || 'status');
  const [orderValue, setOrderValue] = useState('title');
  const [ticketDetails, setTicketDetails] = useState([]);

  // Function to order data based on the selected value
  const orderDataByValue = useCallback(async (cardsArray) => {
    if (orderValue === 'priority') {
      cardsArray.sort((a, b) => b.priority - a.priority);
    } else if (orderValue === 'title') {
      cardsArray.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();

        if (titleA < titleB) {
          return -1;
        } else if (titleA > titleB) {
          return 1;
        } else {
          return 0;
        }
      });
    }
    await setTicketDetails(cardsArray);
  }, [orderValue, setTicketDetails]);

  // Function to save state to local storage
  function saveStateToLocalStorage(state) {
    localStorage.setItem('groupValue', JSON.stringify(state));
  }

  // Function to retrieve state from local storage
  function getStateFromLocalStorage() {
    const storedState = localStorage.getItem('groupValue');
    if (storedState) {
      return JSON.parse(storedState);
    }
    return null;
  }

  // Fetching and processing data on component mount
  useEffect(() => {
    saveStateToLocalStorage(groupValue);

    async function fetchData() {
      try {
        const response = await axios.get('https://api.quicksell.co/v1/internal/frontend-assignment');
        await refactorData(response);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    async function refactorData(response) {
      let ticketArray = [];
      if (response.status === 200) {
        for (let i = 0; i < response.data.tickets.length; i++) {
          for (let j = 0; j < response.data.users.length; j++) {
            if (response.data.tickets[i].userId === response.data.users[j].id) {
              let ticketJson = { ...response.data.tickets[i], userObj: response.data.users[j] };
              ticketArray.push(ticketJson);
            }
          }
        }
      }
      await setTicketDetails(ticketArray);
      orderDataByValue(ticketArray);
    }

    fetchData();
  }, [orderDataByValue, groupValue]);

  // Functions to handle value changes
  function handleGroupValue(value) {
    setGroupValue(value);
    console.log(value);
  }

  function handleOrderValue(value) {
    setOrderValue(value);
    console.log(value);
  }

  return (
    <>
      <Navbar
        groupValue={groupValue}
        orderValue={orderValue}
        handleGroupValue={handleGroupValue}
        handleOrderValue={handleOrderValue}
      />
      <section className="board-details">
        <div className="board-details-list">
          {
            {
              'status': statusList.map((listItem) => (
                <List
                  groupValue="status"
                  orderValue={orderValue}
                  listTitle={listItem}
                  listIcon=""
                  statusList={statusList}
                  ticketDetails={ticketDetails}
                />
              )),
              'user': userList.map((listItem) => (
                <List
                  groupValue="user"
                  orderValue={orderValue}
                  listTitle={listItem}
                  listIcon=""
                  userList={userList}
                  ticketDetails={ticketDetails}
                />
              )),
              'priority': priorityList.map((listItem) => (
                <List
                  groupValue="priority"
                  orderValue={orderValue}
                  listTitle={listItem.priority}
                  listIcon=""
                  priorityList={priorityList}
                  ticketDetails={ticketDetails}
                />
              )),
            }[groupValue]
          }
        </div>
      </section>
    </>
  );
}

export default App;

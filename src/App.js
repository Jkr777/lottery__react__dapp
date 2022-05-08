import { useState, useEffect } from "react";
import web3 from "./web3";
import lottery from "./lottery";
import './App.css';

function App() {
  const [state, setState] = useState({
    manager: '',
    players: [],
    balance: '',
    isManager: false
  });
  const [formVal, setFormVal] = useState("");
  const [message, setMessage] = useState("Enter the lottery!");
  const [messageAdmin, setMessageAdmin] = useState("");

  async function handleWinner() {
    if(!state.isManager) return  setMessageAdmin("Only the manager can pick a Winner!")

    try {
      const accounts = await web3.eth.getAccounts();

      setMessageAdmin("And the winner is...");

      await lottery.methods.pickWinner().send({
        from: accounts[0]
      });
    } catch (error) {
      setMessageAdmin("Only the manager can pick a Winner!")
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if(formVal !== ".001") return  setMessage("You have to pay .001 ether to enter the lottery!");

    const accounts = await web3.eth.getAccounts();
    
    setMessage("Waiting on transaction success...")
    
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei(formVal, 'ether')
      }); 
    } catch (error) {
      return  setMessage("You have to pay .001 ether to enter the lottery!");
    }

    setMessage("Good luck!");
  }

  useEffect(() => {
    (async function getInitialState() {
      const manager = await lottery.methods.manager().call();
      const players = await lottery.methods.getPlayers().call();
      const balance = await web3.eth.getBalance(lottery.options.address);
      const isManager = manager === players[0];

      setState({ manager, players, balance, isManager });
    })();
  }, [])

  useEffect(() => {
      if(messageAdmin){
        const timeout = setTimeout(() => {
          setMessageAdmin("");
        }, 5000);

        return () => clearTimeout(timeout);
    }
  }, [messageAdmin])

  return (
    <div className="container">
      <div className="info">
        <h1 className="title">Lottery Contract</h1>
        <p className="info-text">
          This contract is managed by {state.manager}. There are currently {state.players.length} people entered, competing to win {web3.utils.fromWei(state.balance, 'ether')} ether!
        </p>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <h4 className="sub-title">Want to try your luck? You need .001 ETH to enter</h4>
        <div className="form__info">
          <label className="form__label">Amount of ether to enter</label>
          <input
            className="form__input"
            value={formVal}
            onChange={e => setFormVal(e.target.value)}
            placeholder=".001"
          />
        </div>
        <button className="form__btn">Enter</button>
      </form>

      <span className="message">{message}</span>

      {state.isManager ? <div className="info">
        <h4 className="sub-title">Ready to pick a winner ?</h4>
        <button className="form__btn" onClick={handleWinner}>Pick a winner!</button>
        {messageAdmin && <h1>{messageAdmin}</h1>}
      </div> : null}
    </div>
  );
}

export default App;
/* eslint-disable jsx-a11y/alt-text */
import { useState } from 'react';
import axios from 'axios';
import './App.css';
import { isValidHttpUrl } from './util/http';

export type BettingSite = 'fanDuel' | 'playNow' | 'sportsInteraction';

export const App = () => {
  const [ fanDuelUrl, setFanDuelUrl ] = useState<string>('');
  const [ playNowUrl, setPlayNowUrl ] = useState<string>('');
  const [ sportsinteractionUrl, setSportsinteractionUrl ] = useState<string>('');

  const [ fanDuelBettingLines, setFanDuelBettingLines ] = useState<any>([]);
  const [ playNowBettingLines, setPlayNowBettingLines ] = useState<any>([]);
  const [ sportsInteractionBettingLines, setSportsInteractionBettingLines ] = useState<any>([]);

  const loadBettingLines = async (type: BettingSite, url: string) => {
    if (!isValidHttpUrl(url)) {
      alert(`'${url}' is not a valid url`);
      return;
    }

    try {
      let resp;
      let elements = [];
      switch (type) {
        case 'fanDuel':
          resp = await axios.get('http://localhost:4200/scrape', { params: { type, url }});
          for (const [ line, img ] of Object.entries(resp.data)) {
            if (line !== 'all') elements.push(<img src={ `http://localhost:4200/lines/${img}` }/>);
          }
          
          setFanDuelBettingLines(elements);
          break;
        case 'playNow':
          resp = await axios.get('http://localhost:4200/scrape', { params: { type, url }});

          for (const [ line, img ] of Object.entries(resp.data)) {
            if (line !== 'all') elements.push(<img src={ `http://localhost:4200/lines/${img}` }/>);
          }
          
          setPlayNowBettingLines(elements);
          break;
        case 'sportsInteraction':
          resp = await axios.get('http://localhost:4200/scrape', { params: { type, url }});

          for (const [ line, img ] of Object.entries(resp.data)) {
            if (line !== 'all') elements.push(<img src={ `http://localhost:4200/lines/${img}` }/>);
          }
          
          setSportsInteractionBettingLines(elements);
          break;
        default:
          break;
      }
    } catch (e) {
      console.log(e)
    }
  };

  return (
    <div>
      <h1>Betting Odds</h1>
      <div className='url-inputs'>
        <div className='url-input'>
          <a href='https://www.fanduel.com/'>FanDuel</a>
          <input
            placeholder='https://www.fanduel.com/'
            value={ fanDuelUrl }
            onChange={ (e) => setFanDuelUrl(e.target.value) }
          ></input>
          <button
            onClick={ () => {
              setFanDuelBettingLines([]);
              loadBettingLines('fanDuel', fanDuelUrl);
            } }
          >Go</button>
        </div>
        <div className='url-input'>
          <a href='https://www.playnow.com/'>PlayNow</a>
          <input
            placeholder='https://www.playnow.com/'
            value={ playNowUrl }
            onChange={ (e) => setPlayNowUrl(e.target.value) }
          ></input>
          <button
            onClick={ () => {
              setPlayNowBettingLines([]);
              loadBettingLines('playNow', playNowUrl);
            } }
          >Go</button>
        </div>
        <div className='url-input'>
          <a href='https://www.sportsinteraction.com/'>Sports Interaction</a>
          <input
            placeholder='https://www.sportsinteraction.com/'
            value={ sportsinteractionUrl }
            onChange={ (e) => setSportsinteractionUrl(e.target.value) }
          ></input>
          <button
            onClick={ () => {
              setSportsInteractionBettingLines([]);
              loadBettingLines('sportsInteraction', sportsinteractionUrl);
            } }
          >Go</button>
        </div>
      </div>

      <div className='betting-lines'>
        <div className='betting-line'>
          { fanDuelBettingLines }
        </div>
        <div className='betting-line'>
          { playNowBettingLines }
        </div>
        <div className='betting-line'>
          { sportsInteractionBettingLines }
        </div>
      </div>
    </div>
  );
}

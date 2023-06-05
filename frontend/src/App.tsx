/* eslint-disable jsx-a11y/alt-text */
import { useState } from 'react';
import axios from 'axios';
import './App.css';
import { isValidHttpUrl } from './util/http';

export type BettingSite = 'fanduel' | 'playNow' | 'sportsInteraction';

export const App = () => {
  const [ fanduelUrl, setFanduelUrl ] = useState<string>('');
  const [ playNowUrl, setPlayNowUrl ] = useState<string>('');
  const [ sportsinteractionUrl, setSportsinteractionUrl ] = useState<string>('');

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
        case 'fanduel':
          resp = await axios.get('http://localhost:4200/scrape', { params: { type, url }});
          console.log(resp.data)
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
          <a href='https://www.fanduel.com/'>fanduel</a>
          <input
            placeholder='https://www.fanduel.com/'
            value={ fanduelUrl }
            onChange={ (e) => setFanduelUrl(e.target.value) }
          ></input>
          <button
            onClick={ () => loadBettingLines('fanduel', fanduelUrl) }
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
          { playNowBettingLines }
        </div>
        <div>
          { sportsInteractionBettingLines }
        </div>
      </div>
    </div>
  );
}

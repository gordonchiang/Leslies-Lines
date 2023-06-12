import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { isValidHttpUrl } from './util/http';
import { BettingSite } from './types';

export const App = () => {
  const [ fanDuelUrl, setFanDuelUrl ] = useState<string>('');
  const [ playNowUrl, setPlayNowUrl ] = useState<string>('');
  const [ sportsinteractionUrl, setSportsinteractionUrl ] = useState<string>('');

  const [ initialTimer, setInitialTimer ] = useState<number>(60);
  const [ timer, setTimer ] = useState<number>(initialTimer);
  const [ pauseTimer, setPauseTimer ] = useState<boolean>(true);

  const [ fanDuelBettingLines, setFanDuelBettingLines ] = useState<any>([]);
  const [ playNowBettingLines, setPlayNowBettingLines ] = useState<any>([]);
  const [ sportsInteractionBettingLines, setSportsInteractionBettingLines ] = useState<any>([]);

  window.addEventListener('beforeunload', event => {
    if (fanDuelUrl || playNowUrl || sportsinteractionUrl) {
      event.preventDefault();
      return event.returnValue = '';
    }
  });

  const reloadBettingLines = useCallback(async (): Promise<void> => {
    setFanDuelBettingLines([]);
    setPlayNowBettingLines([]);
    setSportsInteractionBettingLines([]);

    loadBettingLines('fanDuel', fanDuelUrl);
    loadBettingLines('playNow', playNowUrl);
    loadBettingLines('sportsInteraction', sportsinteractionUrl);
  }, [ fanDuelUrl, playNowUrl, sportsinteractionUrl ]);

  useEffect(() => {
    if (pauseTimer) return;

    const newTimer = timer-1;
    const tick = setInterval(setTimer, 1000, newTimer === -1 ? initialTimer : newTimer);

    const triggerReload = async () => await reloadBettingLines();
    if (newTimer === -1) triggerReload();
  
    return () => clearInterval(tick);
  }, [ initialTimer, pauseTimer, reloadBettingLines, timer ]);

  const loadBettingLines = async (type: BettingSite, url: string) => {
    if (!isValidHttpUrl(url)) {
      alert(`'${url}' is not a valid url`);
      return;
    }

    const backendFrontdoor = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_BACKEND_FRONTDOOR : 'http://localhost:3001';

    try {
      const resp = await axios.get(`${backendFrontdoor}/scrape`, { params: { type, url }});
      const bettingLines = Object.entries(resp.data).reduce<JSX.Element[]>((arr, [line, img]) => {
        return line === 'all' ? arr : arr.concat(<img
          id={ `${line}${img}` }
          alt='betting-line'
          src={ `${backendFrontdoor}/lines/${img}` }
        />);
      }, []);
 
      switch (type) {
        case 'fanDuel':
          setFanDuelBettingLines(bettingLines);
          break;
        case 'playNow':
          setPlayNowBettingLines(bettingLines);
          break;
        case 'sportsInteraction':
          setSportsInteractionBettingLines(bettingLines);
          break;
        default:
          break;
      }
    } catch (e) {
      console.log(e);
      alert(`Error scraping '${url}'; try again`);
    }
  };

  return (
    <div>
      <h1>Leslie's Lines</h1>

      <div className='url-inputs'>
        <div className='url-input'>
          <a href='https://sportsbook.fanduel.com/' target='_blank' rel='noreferrer'>FanDuel</a>
          <input
            placeholder='https://sportsbook.fanduel.com/'
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
          <a href='https://www.playnow.com/sports/' target='_blank' rel='noreferrer'>PlayNow</a>
          <input
            placeholder='https://www.playnow.com/sports/'
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
          <a href='https://www.sportsinteraction.com/' target='_blank' rel='noreferrer'>Sports Interaction</a>
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

      <div className='timer'>
        <div className='timer-input'>
          <input
            value={ initialTimer }
            type='number'
            onChange={ (e) => setInitialTimer(Number(e.target.value)) }
          ></input>
          <input
            className='timer-view'
            disabled={ pauseTimer }
            readOnly={ true }
            value={ timer }
          ></input>
          <button onClick={ () => setPauseTimer(!pauseTimer) }>
            { `${pauseTimer ? 'Enable' : 'Disable' } Automatic Refresh` }
          </button>
          <button
            onClick={ async () => {
              setTimer(initialTimer);
              await reloadBettingLines();
            } }
          >Reload All Betting Lines</button>
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

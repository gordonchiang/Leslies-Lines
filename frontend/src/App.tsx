import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { isValidHttpUrl } from './util/http';

export type BettingSite = 'fanDuel' | 'playNow' | 'sportsInteraction';

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

  const reloadBettingLines = useCallback(async (): Promise<void> => {
    console.log('reload');
  }, []);

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

    try {
      const resp = await axios.get('http://localhost:4200/scrape', { params: { type, url }});
      const elements = Object.entries(resp.data).reduce<JSX.Element[]>((arr, [line, img]) => {
        return line === 'all' ? arr : arr.concat(<img
          id={ `${line}${img}` }
          alt='betting-line'
          src={ `http://localhost:4200/lines/${img}` }
        />);
      }, []);
 
      switch (type) {
        case 'fanDuel':
          setFanDuelBettingLines(elements);
          break;
        case 'playNow':
          setPlayNowBettingLines(elements);
          break;
        case 'sportsInteraction':
          setSportsInteractionBettingLines(elements);
          break;
        default:
          break;
      }
    } catch (e) {
      console.log(e);
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
          >
            Reload All Betting Lines
          </button>
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

import { useEffect, useState } from 'react';
import { useStore } from './store';
import { paint } from './paint';
import { useEngine } from './engine/useEngine';
import { Toolbar } from './components/Toolbar';
import { PaintArea } from './components/PaintArea';
import { SequencerControls } from './components/SequencerControls';
import { SidePanel } from './components/SidePanel';
import { sgResources } from './assets/resources';

const SAVE_KEY = 'synthogram.save';
const audioSupported = typeof window.AudioContext !== 'undefined';

function About() {
  return (
    <div id="about">
      <h2>About</h2>
      <p>Synthogram is an experiment in synthesizing drawings on a painting canvas.</p>
      <p>
        It uses the HTML5 Web Audio API, which enables sound synthesis in the browser. It is
        designed to work on mobile and touch devices as well (it is recommended to use headphones or
        an external speaker).
      </p>
      <p>
        Synthogram is proudly open source, and available at{' '}
        <a href="https://github.com/amitayd/synthogram">Github</a>.
      </p>
      <h2>Credits</h2>
      <ul>
        <li>
          Development: <a href="http://www.doboism.com">Amitay Dobo</a>
        </li>
        <li>Graphic design: Galia Kropach</li>
        <li>
          Musical consultant: <a href="http://drorshiman.com">Dror Shiman</a>
        </li>
        <li>Title Theme music: Ray Atencio</li>
      </ul>
    </div>
  );
}

export default function App() {
  const [saveFlash, setSaveFlash] = useState(false);
  useEngine(audioSupported);

  // Load the saved creation (or the default image) once on startup.
  useEffect(() => {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    } catch {
      saved = null;
    }
    if (saved) {
      useStore.getState().applySettings(saved.settings);
      if (saved.img) {
        paint.setImage(saved.img);
        return;
      }
    }
    paint.setImage(sgResources.defaultImage);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        useStore.getState().togglePlay();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          paint.redo();
        } else {
          paint.undo();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSave = () => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        img: paint.getImage(),
        settings: useStore.getState().getSettings(),
        saveDate: new Date().toISOString()
      })
    );
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1500);
  };

  const handleNew = () => {
    paint.clear();
    useStore.getState().setCurrentStep(0);
  };

  return (
    <>
      <div id="mainContainer" className="mainShadow">
        <div id="synth" className="componenet">
          <h1>Synthogram</h1>
          <div id="saving-box">
            <ul>
              <li>
                <a onClick={handleNew}>New</a>
              </li>
              <li>|</li>
              <li>
                <a onClick={handleSave}>{saveFlash ? 'Saved ✓' : 'Save'}</a>
              </li>
            </ul>
          </div>
        </div>
        {!audioSupported && (
          <div id="notSupported">
            <p>Unfortunately, your browser does not support the technology needed to run the application.</p>
            <p>
              You can use a free, modern browser such as{' '}
              <a href="http://www.google.com/chrome">Google Chrome</a> to enjoy Synthogram.
            </p>
          </div>
        )}
        <div id="sonogram" className="componenet">
          <div className="compMain">
            <Toolbar />
            <PaintArea />
          </div>
        </div>
        <SequencerControls />
        <SidePanel />
      </div>
      <About />
    </>
  );
}

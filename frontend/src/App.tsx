import AITutor from './components/AITutor';
import PathMap from './components/PathMap';

function App(): JSX.Element {
  return (
    <div className="app-container">
      <header>
        <h1>OpenMTSciEd STEM Learning Path</h1>
      </header>
      <main>
        <PathMap />
        <AITutor />
      </main>
    </div>
  );
}

export default App;

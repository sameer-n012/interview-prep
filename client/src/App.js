import './App.css';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.js'
import History from './pages/History.js'
import Header from './components/Header.js'
import About from './pages/About.js'

function App() {
	return (
		<div className='App bg-light' style={{minHeight:'100vh'}}>
			<HashRouter>
				<Header />
				<Routes>
					<Route path='/' element={<Home />} exact />
                    <Route path='/home' element={<Home />} exact />
					<Route path='/history' element={<History />} exact />
                    <Route path='/about' element={<About />} exact />
				</Routes>
			</HashRouter>
		</div>
	);
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Situations from './pages/Situations';
import Detail from './pages/Detail';
import Associations from './pages/Associations';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <Routes>
        {/* Pages with layout (Navbar + Footer) */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/situations" element={<Situations />} />
          <Route path="/associations" element={<Associations />} />
        </Route>

        {/* Detail page has its own layout (Left sidebar) */}
        <Route path="/detail/:slug" element={<Detail />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;

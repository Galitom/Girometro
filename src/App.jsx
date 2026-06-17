import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Classifica from './pages/Classifica';
import Statistiche from './pages/Statistiche';
import Leghe from './pages/Leghe';
import Tornei from './pages/Tornei';
import Chat from './pages/Chat';
import Achievement from './pages/Achievement';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="classifica" element={<Classifica />} />
          <Route path="statistiche" element={<Statistiche />} />
          <Route path="leghe" element={<Leghe />} />
          <Route path="tornei" element={<Tornei />} />
          <Route path="chat" element={<Chat />} />
          <Route path="achievement" element={<Achievement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

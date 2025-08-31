import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Production from './pages/Production';
import NotFound from './pages/NotFound';
import { ThemeProvider } from './components/ThemeProvider';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/production" replace />} />
          <Route path="/production" element={<Production />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
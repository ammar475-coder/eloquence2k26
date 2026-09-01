import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter.jsx';

export default function App() {
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => console.log('Backend connected:', data))
      .catch((err) => console.error('Backend connection failed:', err));
  }, []);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <AppRouter />
    </>
  );
}

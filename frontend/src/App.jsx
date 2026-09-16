import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter.jsx';

export default function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <AppRouter />
    </>
  );
}

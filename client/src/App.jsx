import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';
import HomePage from './pages/homePage.jsx';
const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(<Route index element={<HomePage />} />),
  );
  return <RouterProvider router={router} />;
};

export default App;

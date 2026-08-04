import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';
import HomePage from './pages/homePage.jsx';
import SigninPage from './pages/SigninPage.jsx';
import Grades from './pages/grades.jsx';
import Students from './pages/students.jsx';
import StudentDetails from './pages/studentDetails.jsx';
import TeacherDetails from './pages/teacherDetails.jsx';

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route index element={<HomePage />} />
        <Route path="signin" element={<SigninPage />} />
        <Route path="profile" element={<TeacherDetails />} />
        <Route path="grades" element={<Grades />} />
        <Route path="grades/:gradeId/students" element={<Students />} />
        <Route path="students/:studentId" element={<StudentDetails />} />
      </>,
    ),
  );
  return <RouterProvider router={router} />;
};

export default App;

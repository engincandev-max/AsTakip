import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/MainLayout';
import CustomerList from './pages/CustomerList';
import CustomerCreate from './pages/CustomerCreate';
import CustomerDetail from './pages/CustomerDetail';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<CustomerList />} />
              <Route path="customers/new" element={<CustomerCreate />} />
              <Route path="customers/:id" element={<CustomerDetail />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

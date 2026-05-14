

import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

import LoginPage from './pages/auth/LoginPage';

import './App.css';

import WorkflowList from './workflow/components/workflow_list';
import WorkflowListExecutions from './workflow/components/WorkflowListExecutions';
import ShowForm from './workflow/components/workflow_form';


import AppContent from './components/AppContent';


function App() {
  return (
    <Routes>
        <Route path="/workflow" element={<WorkflowList />} />

      <Route path="/workflow/workflow_list_executions" element={<WorkflowListExecutions />}/>
       <Route path="/workflow/workflow_form/:execution_id" element={<ShowForm />} />
  
    
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/*" element={<AppContent />} />
      </Routes>
    
  );
}

export default App;

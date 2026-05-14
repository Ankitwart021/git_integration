import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter } from 'react-router-dom';
import { BoardContextProvider } from './context/boardContext';
import { LoginContextProvider } from './context/login-context';
import { UserContextProvider } from './context/userContext';
import { AppProvider } from './context/appContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApplicationProvider } from './context/applicationContext';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <BrowserRouter>
    {/* <React.StrictMode> */}
    <QueryClientProvider client={queryClient}>
    <UserContextProvider>
      <LoginContextProvider>
        <BoardContextProvider>
        <AppProvider>
          <ApplicationProvider>
          <DndProvider backend={HTML5Backend}>
            <App />
          </DndProvider>
          </ApplicationProvider>
        </AppProvider>
        </BoardContextProvider>
      </LoginContextProvider>
      {/* </React.StrictMode> */}
    </UserContextProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

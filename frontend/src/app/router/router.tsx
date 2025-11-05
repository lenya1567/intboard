import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ContextProvider } from './lib/context/ContextProvider';
import { WelcomePage } from '#pages/WelcomePage';
import { BoardsListPage } from '#pages/BoardsListPage';
import { BoardPage } from '#pages/BoardPage';
import './index.css';

export function AppWithRoutes() {
    return (
        <>
            <ContextProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="" element={<WelcomePage />} />
                        <Route path="/boards" element={<BoardsListPage />} />
                        <Route path="/board/:id" element={<BoardPage />} />
                    </Routes>
                </BrowserRouter>
            </ContextProvider>
        </>

    )
}

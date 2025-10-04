import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ContextProvider } from './lib/context/ContextProvider';
import { WelcomePage, BoardsPage } from '#pages';

import './index.css';

export function AppWithRoutes() {
    return (
        <>
            <ContextProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="" element={<WelcomePage />} />
                        <Route path="/boards" element={<BoardsPage />} />
                    </Routes>
                </BrowserRouter>
            </ContextProvider>
        </>

    )
}

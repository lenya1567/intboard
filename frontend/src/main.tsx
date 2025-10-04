import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppWithRoutes } from '#app';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<AppWithRoutes />
	</StrictMode>,
)

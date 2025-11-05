import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppWithRoutes } from '#app/router'
import '@progress/kendo-theme-default/dist/all.css';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<AppWithRoutes />
	</StrictMode>,
)

import { createRoot } from 'react-dom/client'
import './index.css'
import { AppWithRoutes } from '#app/router'

createRoot(document.getElementById('root')!).render(
	<AppWithRoutes />,
)

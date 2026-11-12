import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

/* ⚠️ ترتیب مهم است: ui.css باید آخر باشد تا دارک مود روی همه اعمال شود */
import './styles/main.css';
import './styles/shop.css';
import './styles/product.css';
import './styles/cart.css';
import './styles/checkout.css';
import './styles/ui.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);
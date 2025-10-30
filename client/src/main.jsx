import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App.jsx";
import "./index.css";
import { persistor, store } from "./store/store";

const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<Provider store={store}>
			<PersistGate
				loading={null}
				persistor={persistor}>
				<BrowserRouter
					future={{
						v7_startTransition: true,
						v7_relativeSlatPath: true,
						v7_relativeSplatPath: true,
					}}>
					<PayPalScriptProvider
						options={{ "client-id": paypalClientId }}>
						<App />
					</PayPalScriptProvider>
				</BrowserRouter>
			</PersistGate>
		</Provider>
	</StrictMode>
);

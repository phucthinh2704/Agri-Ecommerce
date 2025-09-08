import { PrivateRoute } from "./components";
import PublicRoute from "./components/PublicRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { Routes, Route } from "react-router-dom";

function App() {
	return (
		<Routes>
			<Route
				path="/login"
				element={
					<PublicRoute>
						<Login />
					</PublicRoute>
				}
			/>
			<Route
				path="/"
				element={
					<PrivateRoute>
						<Home />
					</PrivateRoute>
				}
			/>
		</Routes>
	);
}

export default App;

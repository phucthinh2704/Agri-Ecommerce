import { Outlet } from "react-router-dom";
import { AdminSidebar, AdminHeader } from "../../components";

const AdminLayout = () => {
	return (
		<div className="flex h-screen bg-gray-100">
			{/* Sidebar cố định */}
			<AdminSidebar />
			
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Header của trang admin */}
				<AdminHeader />

				{/* Nội dung chính, có thể cuộn */}
				<main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
					<Outlet /> {/* Các trang con của admin sẽ render ở đây */}
				</main>
			</div>
		</div>
	);
};

export default AdminLayout;
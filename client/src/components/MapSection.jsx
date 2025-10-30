import { MapPin } from "lucide-react";

const MapSection = () => {
	return (
		<section className="my-12">
			<div className="flex items-center space-x-2 mb-4">
				<MapPin className="w-6 h-6 text-green-600" />
				<h2 className="text-3xl font-bold text-gray-800">
					Tìm chúng tôi ở đây
				</h2>
			</div>

			<div className="overflow-hidden rounded-2xl shadow-lg border border-gray-200">
				<iframe
					src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1964.4120369675134!2d105.76852942034932!3d10.03137196646!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a08903b65b4b89%3A0xfd786372c1a73532!2zQ8SDbiB0aW4ga2hvYSBDw7RuZyBuZ2jhu4cgdGjDtG5nIHRpbiB2w6AgdHJ1eeG7gW4gdGjDtG5nIMSQSENU!5e0!3m2!1sen!2s!4v1761823359475!5m2!1sen!2s"
					width="100%"
					height="450"
					style={{ border: 0 }}
					allowFullScreen=""
					loading="lazy"
					referrerPolicy="no-referrer-when-downgrade"></iframe>
				
			</div>
		</section>
	);
};

export default MapSection;

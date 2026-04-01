import { useNavigate } from "react-router-dom";
import Background from "../components/common/Background";

export default function ThankYou() {
  const navigate = useNavigate();

  return (
    <>
      <Background />
      <div className="min-h-screen bg-[#F7FBFF] flex items-center justify-center px-4">

        <div className="bg-white rounded-3xl shadow-md p-8 text-center space-y-6 max-w-md w-full">

          {/* GIF PLACEHOLDER */}
          <div className="w-48 h-48 mx-auto flex items-center justify-center bg-gray-100 rounded-xl">
            {/* Replace src later */}
            <img
              src="/assets/gifs/thankyou.gif"
              alt="Thank you"
              className="w-full h-full object-contain"
            />
          </div>

          {/* TEXT */}
          <h2 className="text-2xl font-semibold text-slate-700">
            Thank you for playing &#127752;
          </h2>

          <p className="text-slate-600">
            You did a great job!
            Your responses have been recorded.
          </p>

        </div>
      </div>
    </>
  );
}
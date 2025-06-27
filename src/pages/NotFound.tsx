import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Rocket, Compass, Home } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            }}
            className="inline-block"
          >
            <Rocket className="h-12 w-12 text-white mx-auto" />
          </motion.div>
          <h1 className="text-6xl font-bold text-white mt-4">ERROR</h1>
          <p className="text-xl text-white/90 mt-2">Admin, we have a problem!</p>
        </div>

        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Page Not Built yet!!
          </h2>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist or has been removed
            <br />
            <code className="bg-gray-100 px-2 py-1 rounded text-sm mt-2 inline-block">
              {location.pathname}
            </code>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              <Compass className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help?{" "}
              <a
                href="mailto:support@idealunch.com"
                className="text-purple-600 hover:underline"
              >
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Optional: You can put your RepFit Logo here */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Welcome back to RepFit
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to automate your gym's growth
          </p>
        </div>

        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 border border-transparent rounded-md",
                card: "bg-white shadow-xl rounded-xl border border-gray-100",
                headerTitle: "hidden", // We hide the default Clerk title because we made a better one above
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

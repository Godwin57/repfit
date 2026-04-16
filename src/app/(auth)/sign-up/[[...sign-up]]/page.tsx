import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0e0e0e]">
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#cafd00",
            colorBackground: "#131313",
            colorText: "#ffffff",
            colorInputBackground: "#262626",
            colorInputText: "#ffffff",
          },
        }}
      />
    </div>
  );
}

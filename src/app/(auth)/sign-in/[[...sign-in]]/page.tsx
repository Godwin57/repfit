import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0e0e0e]">
      <SignIn
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

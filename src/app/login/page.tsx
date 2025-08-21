"use client";

import { GalleryVerticalEnd } from "lucide-react";

import { LoginForm } from "@/components/login-form";
import Featured_05 from "@/components/ui/globe-feature-section";
import { useUser } from "@/services/supabase/use-user";
import { redirect } from "next/navigation";

export default function LoginPage() {
  const { user } = useUser();

  if (user) {
    console.log("user", user);
    redirect("/dashboard");
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            HolidayBooker
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:flex bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 overflow-hidden items-center justify-center p-6">
        <Featured_05 />
      </div>
    </div>
  );
}
